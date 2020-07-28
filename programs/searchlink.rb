#!/usr/bin/env ruby
# encoding: utf-8

# SOURCE: https://brettterpstra.com/projects/searchlink/
# BUT: Not from the gist, that's old version! So this is downloaded .workflow and extracted ruby code
# BEWARE: I had to remove `!` from `input.strip` on L842, not sure why

SILENT = ENV['SL_SILENT'] =~ /false/i ? false : true || true
VERSION = '2.2.15'

# SearchLink by Brett Terpstra 2015 <http://brettterpstra.com/projects/searchlink/>
# MIT License, please maintain attribution
require 'net/https'
require 'uri'
require 'rexml/document'
require 'shellwords'
require 'yaml'
require 'cgi'
require 'fileutils'
require 'zlib'
require 'time'
require 'json'

if RUBY_VERSION.to_f > 1.9
  Encoding.default_external = Encoding::UTF_8
  Encoding.default_internal = Encoding::UTF_8
end

PINBOARD_CACHE = File.expand_path("~/.searchlink_cache")

class Array
  def longest_element
    group_by(&:size).max.last[0]
  end
end

class String
  def clean
    gsub(/\n+/,' ').gsub(/"/,"&quot").gsub(/\|/,"-").gsub(/([&\?]utm_[scm].+=[^&\s!,\.\)\]]++?)+(&.*)/, '\2').sub(/\?&/,'').strip
  end

  def to_am # convert itunes to apple music link
    input = self.dup
    input.sub!(/\/itunes\.apple\.com/,'geo.itunes.apple.com')
    append = input =~ /\?[^\/]+=/ ? '&app=music' : '?app=music'
    input + append
  end

  def path_elements
    path = URI.parse(self).path
    path.sub!(/\/?$/,'/')
    path.sub!(/\/[^\/]+[\.\-][^\/]+\/$/,'')
    path.gsub!(/(^\/|\/$)/,'')
    path.split(/\//).delete_if {|section| section =~ /^\d+$/ || section.length < 5 }
  end

  def close_punctuation!
    self.replace close_punctuation
  end

  def close_punctuation
    return self unless self =~ /[“‘\[\(<]/

    words = self.split(/\s+/)

    punct_chars = {
        '“' => '”',
        '‘' => '’',
        '[' => ']',
        '(' => ')',
        '<' => '>'
    }
    left_punct = []

    words.each {|w|

      punct_chars.each {|k,v|

        if w =~ /#{Regexp.escape(k)}/
          left_punct.push(k)
        end

        if w =~ /#{Regexp.escape(v)}/
          left_punct.delete_at(left_punct.rindex(k))
        end
      }
    }
    tail = ""
    left_punct.reverse.each {|c|
      tail += punct_chars[c]
    }

    self.gsub(/[^a-z\)\]’”\.…]+$/i,"...").strip + tail

  end

  def remove_seo!(url)
    self.replace remove_seo(url)
  end

  def remove_seo(url)
    title = self.dup
    url = URI.parse(url)
    host = url.hostname
    path = url.path
    root_page = path =~ /^\/?$/ ? true : false

    title.gsub!(/\s*(&ndash;|&mdash;)\s*/,' - ')
    title.gsub!(/&[lr]dquo;/,'"')
    title.gsub!(/&[lr]dquo;/,"'")

    seo_title_separators = [ '|', '«', '-', '–', '·', ':' ]

    begin
      re_parts = []

      host_parts = host.sub(/(?:www\.)?(.*?)\.[^\.]+$/,'\1').split(/\./).delete_if {|p| p.length < 3 }
      h_re = host_parts.length > 0 ? host_parts.map{|seg| seg.downcase.split(//).join('.?') }.join('|') : ''
      re_parts.push(h_re) if h_re.length > 0

      # p_re = path.path_elements.map{|seg| seg.downcase.split(//).join('.?') }.join('|')
      # re_parts.push(p_re) if p_re.length > 0

      site_re = "(#{re_parts.join('|')})"

      dead_switch = 0

      while title.downcase.gsub(/[^a-z]/i,'') =~ /#{site_re}/i

        break if dead_switch > 5

        seo_title_separators.each_with_index do |sep, i|
          parts = title.split(/ ?#{Regexp.escape(sep)} +/)

          next if parts.length == 1
          remaining_separators = seo_title_separators[i..-1].map {|s| Regexp.escape(s)}.join('')
          seps = Regexp.new("^[^#{remaining_separators}]+$")

          longest = parts.longest_element.strip

          parts.delete_if {|pt|
            compressed = pt.strip.downcase.gsub(/[^a-z]/i,'')
            compressed =~ /#{site_re}/ && pt =~ seps ? !root_page : false
          } if parts.length > 1

          if parts.length == 0
            title = longest
          elsif parts.length < 2
            title = parts.join(sep)
          elsif parts.length > 2
            title = parts.longest_element.strip
          else
            title = parts.join(sep)
          end

        end
        dead_switch += 1
      end
    rescue Exception => e
      return self unless $cfg['debug']
      $stderr.puts "Error processing title"
      p e
      raise e
      # return self
    end

    seps = Regexp.new("[#{seo_title_separators.map {|s| Regexp.escape(s) }.join('')}]")
    if title =~ seps
      seo_parts = title.split(seps)
      if seo_parts.length > 1
        title = seo_parts.longest_element.strip
      end
    end

    title && title.length > 5 ? title.gsub(/\s+/,' ') : self
  end

  def truncate!(max)
    self.replace truncate(max)
  end

  def truncate(max)
    return self if self.length < max

    max -= 3
    counter = 0
    trunc_title = ""

    words = self.split(/\s+/)
    while trunc_title.length < max && counter < words.length
      trunc_title += " " + words[counter]
      break if trunc_title.length + 1 > max
      counter += 1
    end



    trunc_title = words[0] if trunc_title.nil? || trunc_title.length == 0

    trunc_title
  end
end

class SearchLink
  attr_reader :originput, :output, :clipboard
  attr_accessor :cfg
  # Values found in ~/.searchlink will override defaults in
  # this script

  def initialize(opt={})

    @printout = opt[:echo] || false
    unless File.exists? File.expand_path("~/.searchlink")
      default_config =<<ENDCONFIG
# set to true to have an HTML comment included detailing any errors
debug: true
# set to true to have an HTML comment included reporting results
report: true

# use Notification Center to display progress
notifications: false

# when running on a file, back up original to *.bak
backup: true

# change this to set a specific country for search (default US)
country_code: US

# set to true to force inline Markdown links
inline: false

# set to true to include a random string in reference titles.
# Avoids conflicts if you're only running on part of a document
# or using SearchLink multiple times within a document
prefix_random: true

# set to true to add titles to links based on the page title
# of the search result
include_titles: false

# confirm existence (200) of generated links. Can be disabled
# per search with `--v`, or enabled with `++v`.
validate_links: false

# If the link text is left empty, always insert the page title
# E.g. [](!g Search Text)
empty_uses_page_title: false

# append affiliate link info to iTunes urls, empty quotes for none
# example:
# itunes_affiliate = "&at=10l4tL&ct=searchlink"
itunes_affiliate: "&at=10l4tL&ct=searchlink"

# to create Amazon affiliate links, set amazon_partner to your amazon
# affiliate tag
#    amazon_partner: "bretttercom-20"
amazon_partner: "bretttercom-20"

# To create custom abbreviations for Google Site Searches,
# add to (or replace) the hash below.
# "abbreviation" => "site.url",
# This allows you, for example to use [search term](!bt)
# as a shortcut to search brettterpstra.com (using a site-specific
# Google search). Keys in this list can override existing
# search trigger abbreviations.
#
# If a custom search starts with "http" or "/", it becomes
# a simple replacement. Any instance of "$term" is replaced
# with a URL-escaped version of your search terms.
# Use $term1, $term2, etc. to replace in sequence from
# multiple search terms. No instances of "$term" functions
# as a simple shortcut. "$term" followed by a "d" lowercases
# the replacement. Use "$term1d," "$term2d" to downcase
# sequential replacements (affected individually).
# Long flags (e.g. --no-validate_links) can be used after
# any url in the custom searches.
custom_site_searches:
  bt: brettterpstra.com
  btt: http://brettterpstra.com/$term1d/$term2d
  bts: /search/$term --no-validate_links
  md: www.macdrifter.com
  ms: macstories.net
  dd: www.leancrew.com
  spark: macsparky.com
  man: http://man.cx/$term
  dev: developer.apple.com
  nq: http://nerdquery.com/?media_only=0&query=$term&search=1&category=-1&catid=&type=and&results=50&db=0&prefix=0
  gs: http://scholar.google.com/scholar?btnI&hl=en&q=$term&btnG=&as_sdt=80006
# Remove or comment (with #) history searches you don't want
# performed by `!h`. You can force-enable them per search, e.g.
# `!hsh` (Safari History only), `!hcb` (Chrome Bookmarks only),
# etc. Multiple types can be strung together: !hshcb (Safari
# History and Chrome bookmarks).
history_types:
- chrome_history
- chrome_bookmarks
- safari_bookmarks
- safari_history
# Pinboard search
# You can find your api key here: https://pinboard.in/settings/password
pinboard_api_key: ''

ENDCONFIG
      File.open(File.expand_path("~/.searchlink"), 'w') do |f|
        f.puts default_config
      end
    end

    @cfg = YAML.load_file(File.expand_path("~/.searchlink"))

    # set to true to have an HTML comment inserted showing any errors
    @cfg['debug'] ||= false

    # set to true to get a verbose report at the end of multi-line processing
    @cfg['report'] ||= false

    @cfg['backup'] = true unless @cfg.has_key? 'backup'

    # set to true to force inline links
    @cfg['inline'] ||= false

    # set to true to add titles to links based on site title
    @cfg['include_titles'] ||= false

    # set to true to use page title as link text when empty
    @cfg['empty_uses_page_title'] ||= false

    # change this to set a specific country for search (default US)
    @cfg['country_code'] ||= "US"

    # set to true to include a random string in ref titles
    # allows running SearchLink multiple times w/out conflicts
    @cfg['prefix_random'] = false unless @cfg['prefix_random']

    # append affiliate link info to iTunes urls, empty quotes for none
    # example:
    # $itunes_affiliate = "&at=10l4tL&ct=searchlink"
    @cfg['itunes_affiliate'] ||= "&at=10l4tL&ct=searchlink"

    # to create Amazon affiliate links, set amazon_partner to your amazon
    # affiliate tag
    #    amazon_partner: "bretttercom-20"
    @cfg['amazon_partner'] ||= ''

    # To create custom abbreviations for Google Site Searches,
    # add to (or replace) the hash below.
    # "abbreviation" => "site.url",
    # This allows you, for example to use [search term](!bt)
    # as a shortcut to search brettterpstra.com. Keys in this
    # hash can override existing search triggers.
    @cfg['custom_site_searches'] ||= {
        "bt" => "brettterpstra.com",
        "md" => "www.macdrifter.com"
    }

    # confirm existence of links generated from custom search replacements
    @cfg['validate_links'] ||= false

    # use notification center to show progress
    @cfg['notifications'] ||= false
    @cfg['pinboard_api_key'] ||= false

    @line_num = nil;
    @match_column = nil;
    @match_length = nil;
  end

  def available_searches
    searches = [
        ["a", "Amazon"],
        ["g", "Google"],
        ["b", "Bing"],
        ["wiki", "Wikipedia"],
        ["s", "Software search (Google)"],
        ["@t", "Twitter user link"],
        ["@fb", "Facebook user link"],
        ["am", "Apple Music"],
        ["amart", "Apple Music Artist"],
        ["amalb", "Apple Music Album"],
        ["amsong", "Apple Music Song"],
        ["ampod", "Apple Music Podcast"],
        ["ipod", "iTunes podcast"],
        ["isong", "iTunes song"],
        ["iart", "iTunes artist"],
        ["ialb", "iTunes album"],
        ["lsong", "Last.fm song"],
        ["lart", "Last.fm artist"],
        ["mas", "Mac App Store"],
        ["masd", "Mac App Store developer link"],
        ["itu", "iTunes App Store"],
        ["itud", "iTunes App Store developer link"],
        ["imov","iTunes Movies"],
        ["def", "Dictionary definition"],
        ["sp", "Spelling"],
        ["pb", "Pinboard"]
    # ["h", "Web history"],
    # ["hs[hb]", "Safari [history, bookmarks]"],
    # ["hc[hb]", "Chrome [history, bookmarks]"]
    ]
    out = ""
    searches.each {|s|
      out += "!#{s[0]}#{spacer(s[0])}#{s[1]}\n"
    }
    out
  end

  def spacer(str)
    len = str.length
    str.scan(/[mwv]/).each do |tt|
      len += 1
    end
    str.scan(/[t]/).each do |tt|
      len -= 1
    end
    spacer = case len
             when 0..3
               "\t\t"
             when 4..12
               " \t"
             end
    spacer
  end

  def get_help_text
    help_text =<<EOHELP
-- [Available searches] -------------------
#{available_searches}
EOHELP

    if @cfg['custom_site_searches']
      help_text += "\n-- [Custom Searches] ----------------------\n"
      @cfg['custom_site_searches'].each {|label, site|
        help_text += "!#{label}#{spacer(label)} #{site}\n"
      }
    end
    help_text
  end

  def help_dialog
    help_text = "[SearchLink v#{VERSION}]\n\n"
    help_text += get_help_text
    help_text += "\nClick \\\"More Help\\\" for additional information"
    res = %x{osascript <<'APPLESCRIPT'
set _res to display dialog "#{help_text.gsub(/\n/,'\\\n')}" buttons {"OK", "More help"} default button "OK" with title "SearchLink Help"

return button returned of _res
APPLESCRIPT
    }.strip
    if res == "More help"
      %x{open http://brettterpstra.com/projects/searchlink}
    end
  end

  def help_cli
    $stdout.puts get_help_text
  end

  def parse(input)
    @output = ''
    return false unless input && input.length > 0
    parse_arguments(input, {:only_meta => true})
    @originput = input.dup

    if input.strip =~ /^help$/i
      if SILENT
        help_dialog # %x{open http://brettterpstra.com/projects/searchlink/}
      else
        $stdout.puts "SearchLink v#{VERSION}"
        $stdout.puts "See http://brettterpstra.com/projects/searchlink/ for help"
      end
      print input
      Process.exit
    end

    @cfg['inline'] = true if input.scan(/\]\(/).length == 1 && input.split(/\n/).length == 1
    @errors = {}
    @report = []

    links = {}
    @footer = []
    counter_links = 0
    counter_errors = 0

    input.sub!(/\n?<!-- Report:.*?-->\n?/m, '')
    input.sub!(/\n?<!-- Errors:.*?-->\n?/m, '')

    input.scan(/\[(.*?)\]:\s+(.*?)\n/).each {|match|
      links[match[1].strip] = match[0]
    }

    if @cfg['prefix_random']
      if input =~ /\[(\d{4}-)\d+\]: \S+/
        prefix = $1
      else
        prefix = ("%04d" % rand(9999)).to_s + "-"
      end
    else
      prefix = ""
    end

    highest_marker = 0
    input.scan(/^\s{,3}\[(?:#{prefix})?(\d+)\]: /).each do |match|
      highest_marker = $1.to_i if $1.to_i > highest_marker
    end

    footnote_counter = 0
    input.scan(/^\s{,3}\[\^(?:#{prefix})?fn(\d+)\]: /).each do |match|
      footnote_counter = $1.to_i if $1.to_i > footnote_counter
    end

    if input =~ /\[(.*?)\]\((.*?)\)/
      lines = input.split(/\n/)
      out = []

      total_links = input.scan(/\[(.*?)\]\((.*?)\)/).length
      in_code_block = false
      line_difference = 0
      lines.each_with_index {|line, num|
        @line_num = num - line_difference
        cursor_difference = 0
        # ignore links in code blocks
        if line =~ /^( {4,}|\t+)[^\*\+\-]/
          out.push(line)
          next
        end
        if line =~ /^[~`]{3,}/
          if in_code_block
            in_code_block = false
            out.push(line)
            next
          else
            in_code_block = true
          end
        end
        if in_code_block
          out.push(line)
          next
        end

        # line.gsub!(/\(\$ (.*?)\)/) do |match|
        #   this_match = Regexp.last_match
        #   match_column = this_match.begin(0)
        #   match_string = this_match.to_s
        #   match_before = this_match.pre_match
        #   match_after = this_match.post_match
        #   # todo: inline searches in larger context
        # end

        delete_line = false

        line.gsub!(/\[(.*?)\]\((.*?)\)/) do |match|

          this_match = Regexp.last_match
          @match_column = this_match.begin(0) - cursor_difference
          match_string = this_match.to_s
          @match_length = match_string.length
          match_before = this_match.pre_match

          invalid_search = false
          ref_title = false

          if match_before.scan(/(^|[^\\])`/).length % 2 == 1
            add_report("Match '#{match_string}' within an inline code block")
            invalid_search = true
          end

          counter_links += 1
          $stderr.print("\033[0K\rProcessed: #{counter_links} of #{total_links}, #{counter_errors} errors. ") unless SILENT

          link_text = this_match[1] || ''
          link_info = parse_arguments(this_match[2].strip).strip || ''

          if link_text.strip == '' && link_info =~ /".*?"/
            link_info.gsub!(/\"(.*?)\"/) {|q|
              link_text = $1 if link_text == ''
              $1
            }
          end

          if link_info.strip =~ /:$/ && line.strip == match
            ref_title = true
            link_info.sub!(/\s*:\s*$/,'')
          end

          unless link_text.length > 0 || link_info.sub(/^[!\^]\S+/,'').strip.length > 0
            add_error('No input', match)
            counter_errors += 1
            invalid_search = true
          end

          if link_info =~ /^!(\S+)/
            search_type = $1
            unless valid_search?(search_type) || search_type =~ /^(\S+\.)+\S+$/
              add_error('Invalid search', match)
              invalid_search = true
            end
          end


          if invalid_search
            match
          elsif link_info =~ /^\^(.+)/
            if $1.nil? || $1 == ''
              match
            else
              note = $1.strip
              footnote_counter += 1
              if link_text.length > 0 && link_text.scan(/\s/).length == 0
                ref = link_text
              else
                ref = prefix + "fn" + ("%04d" % footnote_counter).to_s
              end
              add_footer "[^#{ref}]: #{note}"
              res = %Q{[^#{ref}]}
              cursor_difference = cursor_difference + (@match_length - res.length)
              @match_length = res.length
              add_report("#{match_string} => Footnote #{ref}")
              res
            end
          elsif (link_text == "" && link_info == "") || is_url?(link_info)
            add_error('Invalid search', match) unless is_url?(link_info)
            match
          else

            if link_text.length > 0 && link_info == ""
              link_info = link_text
            end

            search_type = ''
            search_terms = ''
            link_only = false
            @clipboard = false
            @titleize = @cfg['empty_uses_page_title']


            if link_info =~ /^(?:[!\^](\S+))\s*(.*)$/

              if $1.nil?
                search_type = 'g'
              else
                search_type = $1
              end

              search_terms = $2.gsub(/(^["']|["']$)/, '')
              search_terms.strip!

              # if the link text is just '%' replace with title regardless of config settings
              if link_text == '%' && search_terms && search_terms.length > 0
                @titleize = true
                link_text = ''
              end

              search_terms = link_text if search_terms == ''

              # if the input starts with a +, append it to the link text as the search terms
              search_terms = link_text + " " + search_terms.strip.sub(/^\+\s*/, '') if search_terms.strip =~ /^\+[^\+]/

              # if the end of input contain "^", copy to clipboard instead of STDOUT
              @clipboard = true if search_terms =~ /(!!)?\^(!!)?$/

              # if the end of input contains "!!", only print the url
              link_only = true if search_terms =~ /!!\^?$/

              search_terms.sub!(/(!!)?\^?(!!)?$/,"")

            elsif link_info =~ /^\!/
              search_word = link_info.match(/^\!(\S+)/)

              if search_word && valid_search?(search_word[1])
                search_type = search_word[1] unless search_word.nil?
                search_terms = link_text
              elsif search_word && search_word[1] =~ /^(\S+\.)+\S+$/
                search_type = 'g'
                search_terms = "site:#{search_word[1]} #{link_text}"
              else
                add_error('Invalid search', match)
                search_type = false
                search_terms = false
              end

            elsif link_text && link_text.length > 0 && (link_info.nil? || link_info.length == 0)

              search_type = 'g'
              search_terms = link_text
            else
              add_error('Invalid search', match)
              search_type = false
              search_terms = false
            end



            @cfg['custom_site_searches'].each {|k,v|
              if search_type == k
                link_text = search_terms if link_text == '' unless @titleize
                v = parse_arguments(v, {:no_restore => true})
                if v =~ /^(\/|http)/i
                  search_type = 'r'
                  tokens = v.scan(/\$term\d+d?/).sort.uniq

                  if tokens.length > 0
                    highest_token = 0
                    tokens.each {|token|
                      if token =~ /(\d+)d?$/
                        highest_token = $1.to_i if $1.to_i > highest_token
                      end
                    }
                    terms_p = search_terms.split(/ +/)
                    if terms_p.length > highest_token
                      remainder = terms_p[highest_token-1..-1].join(" ")
                      terms_p = terms_p[0..highest_token - 2]
                      terms_p.push(remainder)
                    end
                    tokens.each {|t|
                      if t =~ /(\d+)d?$/
                        int = $1.to_i - 1
                        replacement = terms_p[int]
                        if t =~ /d$/
                          replacement.downcase!
                          re_down = ""
                        else
                          re_down = "(?!d)"
                        end
                        v.gsub!(/#{Regexp.escape(t)+re_down}/, CGI.escape(replacement))
                      end
                    }
                    search_terms = v


                  else
                    search_terms = v.gsub(/\$termd?/i) {|m|
                      search_terms.downcase! if m =~ /d$/i
                      CGI.escape(search_terms)
                    }
                  end

                else
                  search_type = 'g'
                  search_terms = "site:#{v} #{search_terms}"
                end

                break
              end
            } if search_type && search_terms && search_terms.length > 0

            if search_type && search_terms
              url = false
              title = false
              force_title = false
              # $stderr.puts "Searching #{search_type} for #{search_terms}"
              url, title, link_text = do_search(search_type, search_terms, link_text)


              if url
                if @titleize && title == ''
                  title = titleize(url)
                end
                link_text = title if link_text == '' && title
                force_title = search_type =~ /def/ ? true : false

                if link_only || search_type =~ /sp(ell)?/ || url == 'embed'
                  url = title if url == 'embed'
                  cursor_difference = cursor_difference + (@match_length - url.length)
                  @match_length = url.length
                  add_report("#{match_string} => #{url}")
                  url
                elsif ref_title
                  unless links.has_key? url
                    links[url] = link_text
                    add_footer make_link('ref_title', link_text, url, title, force_title)
                  end
                  delete_line = true
                elsif @cfg['inline']
                  res = make_link('inline', link_text, url, title, force_title)
                  cursor_difference = cursor_difference + (@match_length - res.length)
                  @match_length = res.length
                  add_report("#{match_string} => #{url}")
                  res
                else
                  unless links.has_key? url
                    highest_marker += 1
                    links[url] = prefix + ("%04d" % highest_marker).to_s
                    add_footer make_link('ref_title', links[url], url, title, force_title)
                  end

                  type = @cfg['inline'] ? 'inline' : 'ref_link'
                  res = make_link(type, link_text, links[url], false, force_title)
                  cursor_difference = cursor_difference + (@match_length - res.length)
                  @match_length = res.length
                  add_report("#{match_string} => #{url}")
                  res
                end
              else
                add_error('No results', "#{search_terms} (#{match_string})")
                counter_errors += 1
                match
              end
            else
              add_error('Invalid search', match)
              counter_errors += 1
              match
            end
          end
        end
        line_difference += 1 if delete_line
        out.push(line) unless delete_line
        delete_line = false
      }
      $stderr.puts("\n") unless SILENT

      input = out.delete_if {|l|
        l.strip =~ /^<!--DELETE-->$/
      }.join("\n")

      if @cfg['inline']
        add_output input + "\n"
        add_output "\n" + print_footer unless @footer.empty?
      else
        if @footer.empty?
          add_output input
        else
          last_line = input.strip.split(/\n/)[-1]
          if last_line =~ /^\[.*?\]: http/
            add_output input.rstrip + "\n"
          elsif last_line =~ /^\[\^.*?\]: /
            add_output input.rstrip
          else
            add_output input + "\n\n"
          end
          add_output print_footer + "\n\n"
        end
      end
      @line_num = nil
      add_report("Processed: #{total_links} links, #{counter_errors} errors.")
      print_report
      print_errors
    else
      link_only = false
      @clipboard = false

      input = parse_arguments(input.strip).strip

      # if the end of input contain "^", copy to clipboard instead of STDOUT
      @clipboard = true if input =~ /\^[!~:]*$/

      # if the end of input contains "!!", only print the url
      link_only = true if input =~ /!![\^~:]*$/

      reference_link = input =~ /:([!\^\s~]*)$/

      # if end of input contains ~, pull url from clipboard
      if input =~ /~[:\^!\s]*$/
        input.sub!(/[:!\^\s~]*$/,'')
        clipboard = %x{__CF_USER_TEXT_ENCODING=$UID:0x8000100:0x8000100 pbpaste}.strip
        if is_url?(clipboard)
          type = reference_link ? 'ref_title' : 'inline'
          print make_link(type, input.strip, clipboard, false, false)
        else
          print @originput
        end
        Process.exit
      end

      input.sub!(/[:!\^\s~]*$/,'')

      # check for additional search terms in parenthesis
      additional_terms = ''
      if input =~ /\((.*?)\)/
        additional_terms = " " + $1.strip
        input.sub!(/\(.*?\)/,'')
      end

      link_text = false

      if input =~ /"(.*?)"/
        link_text = $1
        input.gsub!(/"(.*?)"/, '\1')
      end

      # remove quotes from terms, just in case
      # input.sub!(/^(!\S+)?\s*(["'])(.*?)\2([\!\^]+)?$/, "\\1 \\3\\4")

      if input =~ /^!(\S+)\s+(.*)$/
        type = $1
        link_info = $2.strip
        link_text = link_info unless link_text
        terms = link_info  + additional_terms
        terms.strip!

        if valid_search?(type) || type =~ /^(\S+\.)+\S+$/
          @cfg['custom_site_searches'].each {|k,v|
            if type == k
              link_text = terms if link_text == ''
              v = parse_arguments(v, {:no_restore => true})
              if v =~ /^(\/|http)/i
                type = 'r'
                tokens = v.scan(/\$term\d+d?/).sort.uniq

                if tokens.length > 0
                  highest_token = 0
                  tokens.each {|token|
                    if token =~ /(\d+)d?$/
                      highest_token = $1.to_i if $1.to_i > highest_token
                    end
                  }
                  terms_p = terms.split(/ +/)
                  if terms_p.length > highest_token
                    remainder = terms_p[highest_token-1..-1].join(" ")
                    terms_p = terms_p[0..highest_token - 2]
                    terms_p.push(remainder)
                  end
                  tokens.each {|t|
                    if t =~ /(\d+)d?$/
                      int = $1.to_i - 1
                      replacement = terms_p[int]
                      if t =~ /d$/
                        replacement.downcase!
                        re_down = ""
                      else
                        re_down = "(?!d)"
                      end
                      v.gsub!(/#{Regexp.escape(t)+re_down}/, CGI.escape(replacement))
                    end
                  }
                  terms = v


                else
                  terms = v.gsub(/\$termd?/i) {|m|
                    terms.downcase! if m =~ /d$/i
                    CGI.escape(terms)
                  }
                end

              else
                type = 'g'
                terms = "site:#{v} #{terms}"
              end

              break
            end
          } if type && terms && terms.length > 0

          if type =~ /^(\S+\.)+\S+$/
            terms = "site:#{type} #{terms}"
            type = 'g'
          end

          url, title, link_text = do_search(type, terms, link_text)
        else
          add_error('Invalid search', input)
          counter_errors += 1
        end
      elsif input =~ /^@(\S+)\s*$/
        link_text = input
        url, title = social_handle('twitter', link_text)
      else
        link_text = input unless link_text
        url, title = ddg(input)
      end

      if url
        if type =~ /sp(ell)?/
          add_output(url)
        elsif link_only
          add_output(url)
        elsif url == 'embed'
          add_output(title)
        else
          type = reference_link ? 'ref_title' : 'inline'
          add_output make_link(type, link_text, url, title, false)
          print_errors
        end
      else
        add_error('No results', title)
        add_output @originput.chomp
        print_errors
      end

      if @clipboard
        if @output == @originput
          $stderr.puts "No results found"
        else
          %x{echo #{Shellwords.escape(@output)}|tr -d "\n"|pbcopy}
          $stderr.puts "Results in clipboard"
        end
      end
    end
  end

  private

  def parse_arguments(string, opt={})
    input = string.dup
    skip_flags = opt[:only_meta] || false
    no_restore = opt[:no_restore] || false
    restore_prev_config unless no_restore

    input.gsub!(/(\+\+|--)([dirtv]+)\b/) do |match|
      bool = $1 == "++" ? "" : "no-"
      output = " "
      $2.split('').each {|arg|
        output += case arg
                  when 'd'
                    "--#{bool}debug "
                  when 'i'
                    "--#{bool}inline "
                  when 'r'
                    "--#{bool}prefix_random "
                  when 't'
                    "--#{bool}include_titles "
                  when 'v'
                    "--#{bool}validate_links "
                  else
                    ""
                  end
      }
      output
    end unless skip_flags

    options = %w{ debug country_code inline prefix_random include_titles validate_links }
    options.each {|o|
      if input =~ /^#{o}:\s+(.*?)$/
        val = $1.strip
        val = true if val =~ /true/i
        val = false if val =~ /false/i
        @cfg[o] = val
        $stderr.print "\r\033[0KGlobal config: #{o} = #{@cfg[o]}\n" unless SILENT
      end

      unless skip_flags
        while input =~ /^#{o}:\s+(.*?)$/ || input =~ /--(no-)?#{o}/ do

          if input =~ /--(no-)?#{o}/ && !skip_flags
            unless @prev_config.has_key? o
              @prev_config[o] = @cfg[o]
              bool = $1.nil? || $1 == '' ? true : false
              @cfg[o] = bool
              $stderr.print "\r\033[0KLine config: #{o} = #{@cfg[o]}\n" unless SILENT
            end
            input.sub!(/\s?--(no-)?#{o}/, '')
          end
        end
      end
    }
    @clipboard ? string : input
  end

  def restore_prev_config
    @prev_config.each {|k,v|
      @cfg[k] = v
      $stderr.print "\r\033[0KReset config: #{k} = #{@cfg[k]}\n" unless SILENT
    } if @prev_config
    @prev_config = {}
  end

  def make_link(type, text, url, title=false, force_title=false)

    if (@titleize && text == '')
      text = title ? title : titleize(url)
    end

    title = title && (@cfg['include_titles'] || force_title) ? %Q{ "#{title.clean}"} : ""

    case type
    when 'ref_title'
      %Q{\n[#{text.strip}]: #{url}#{title}}
    when 'ref_link'
      %Q{[#{text.strip}][#{url}]}
    when 'inline'
      %Q{[#{text.strip}](#{url}#{title})}
    end
  end

  def add_output(str)
    if @printout && !@clipboard
      print str
    end
    @output += str
  end

  def add_footer(str)
    @footer ||= []
    @footer.push(str.strip)
  end

  def print_footer
    unless @footer.empty?

      footnotes = []
      @footer.delete_if {|note|
        note.strip!
        if note =~ /^\[\^.+?\]/
          footnotes.push(note)
          true
        elsif note =~ /^\s*$/
          true
        else
          false
        end
      }

      output = @footer.sort.join("\n").strip
      output += "\n\n" if output.length > 0 && !footnotes.empty?
      output += footnotes.join("\n\n") unless footnotes.empty?
      return output.gsub(/\n{3,}/,"\n\n")
    end
    return ""
  end

  def add_report(str)
    if @cfg['report']
      unless @line_num.nil?
        position = @line_num.to_s + ':'
        position += @match_column.nil? ? "0:" : "#{@match_column}:"
        position += @match_length.nil? ? "0" : @match_length.to_s
      end
      @report.push("(#{position}): #{str}")
      $stderr.puts "(#{position}): #{str}" unless SILENT
    end
  end

  def add_error(type, str)
    if @cfg['debug']
      unless @line_num.nil?
        position = @line_num.to_s + ':'
        position += @match_column.nil? ? "0:" : "#{@match_column}:"
        position += @match_length.nil? ? "0" : @match_length.to_s
      end
      @errors[type] ||= []
      @errors[type].push("(#{position}): #{str}")
    end
  end

  def print_report
    return if (@cfg['inline'] && @originput.split(/\n/).length == 1) || @clipboard
    unless @report.empty?
      out = "\n<!-- Report:\n#{@report.join("\n")}\n-->\n"
      add_output out
    end
  end

  def print_errors(type = 'Errors')
    return if @errors.empty?
    out = ''
    if @originput.split(/\n/).length > 1
      inline = false
    else
      inline = @cfg['inline'] || @originput.split(/\n/).length == 1
    end

    @errors.each {|k,v|
      unless v.empty?
        v.each_with_index {|err, i|
          out += "(#{k}) #{err}"
          out += inline ? i == v.length - 1 ? " | " : ", " : "\n"
        }
      end
    }
    unless out == ''
      sep = inline ? " " : "\n"
      out.sub!(/\| /, '')
      out = "#{sep}<!-- #{type}:#{sep}#{out}-->#{sep}"
    end
    if @clipboard
      $stderr.puts out
    else
      add_output out
    end
  end

  def print_or_copy(text)
    # Process.exit unless text
    if @clipboard
      %x{echo #{Shellwords.escape(text)}|tr -d "\n"|pbcopy}
      print @originput
    else
      print text
    end
  end

  def notify(str, sub)
    return unless @cfg['notifications']
    %x{osascript -e 'display notification "SearchLink" with title "#{str}" subtitle "#{sub}"'}
  end

  def valid_link?(uri_str, limit = 5)
    begin
      notify("Validating", uri_str)
      return false if limit == 0
      url = URI(uri_str)
      return true unless url.scheme
      if url.path == ""
        url.path = "/"
      end
      # response = Net::HTTP.get_response(URI(uri_str))
      response = false

      Net::HTTP.start(url.host, url.port, :use_ssl => url.scheme == 'https') {|http| response = http.request_head(url.path) }

      case response
      when Net::HTTPMethodNotAllowed, Net::HTTPServiceUnavailable then
        unless /amazon\.com/ =~ url.host
          add_error('link validation', "Validation blocked: #{uri_str} (#{e})")
        end
        notify("Error validating", uri_str)
        true
      when Net::HTTPSuccess then
        true
      when Net::HTTPRedirection then
        location = response['location']
        valid_link?(location, limit - 1)
      else
        notify("Error validating", uri_str)
        false
      end
    rescue => e
      notify("Error validating", uri_str)
      add_error('link validation', "Possibly invalid => #{uri_str} (#{e})")
      return true
    end
  end

  def is_url?(input)
    input =~ /^(#.*|https?:\/\/\S+|\/\S+|\S+\/|[^!]\S+\.\S+)(\s+".*?")?$/
  end

  def valid_search?(term)
    valid = false
    valid = true if term =~ /(^h(([sc])([hb])?)*|^a$|^imov|^g$|^b$|^wiki$|^def$|^masd?$|^itud?$|^s$|^(i|am)(art|alb|song|pod)e?$|^lart|^@(t|adn|fb)|^r$|^sp(ell)?|pb$)/
    valid = true if @cfg['custom_site_searches'].keys.include? term
    notify("Invalid search", term) unless valid
    valid
  end

  def search_chrome_history(term)
    # Google history
    if File.exists?(File.expand_path('~/Library/Application Support/Google/Chrome/Default/History'))
      notify("Searching Chrome History", term)
      tmpfile = File.expand_path('~/Library/Application Support/Google/Chrome/Default/History.tmp')
      FileUtils.cp(File.expand_path('~/Library/Application Support/Google/Chrome/Default/History'), tmpfile)

      terms = []
      terms.push("(url NOT LIKE '%search/?%' AND url NOT LIKE '%?q=%' AND url NOT LIKE '%?s=%')")
      terms.concat(term.split(/\s+/).map {|t| "(url LIKE '%#{t.strip.downcase}%' OR title LIKE '%#{t.strip.downcase}%')" })
      query = terms.join(" AND ")
      most_recent = %x{sqlite3 -separator ' ;;; ' '#{tmpfile}' "select title,url,datetime(last_visit_time / 1000000 + (strftime('%s', '1601-01-01')), 'unixepoch') from urls where #{query} AND NOT (url LIKE '%?s=%' OR url LIKE '%/search%') order by last_visit_time limit 1 COLLATE NOCASE;"}.strip
      FileUtils.rm_f(tmpfile)
      return false if most_recent.strip.length == 0
      title, url, date = most_recent.split(/\s*;;; /)
      date = Time.parse(date)
      [url, title, date]
    else
      false
    end
  end

  def search_chrome_bookmarks(term)
    out = false
    if File.exists?(File.expand_path('~/Library/Application Support/Google/Chrome/Default/Bookmarks'))
      notify("Searching Chrome Bookmarks", term)
      chrome_bookmarks = JSON.parse(IO.read(File.expand_path('~/Library/Application Support/Google/Chrome/Default/Bookmarks')))
      if chrome_bookmarks
        terms = term.split(/\s+/)
        roots = chrome_bookmarks['roots']
        urls = extract_chrome_bookmarks(roots)
        urls.sort_by! {|bookmark| bookmark["date_added"]}
        urls.select {|u|
          found = false
          terms.each {|t|
            if u["url"] =~ /#{t}/i || u["title"] =~ /#{t}/
              found = true
            end
          }
          found
        }
        unless urls.empty?
          lastest_bookmark = urls[-1]
          out = [lastest_bookmark['url'], lastest_bookmark['title'], lastest_bookmark['date']]
        end
      end
    end
    out
  end

  def search_history(term,types = [])
    if types.empty?
      if @cfg['history_types']
        types = @cfg['history_types']
      else
        return false
      end
    end


    results = []

    if types.length > 0
      types.each {|type|

        url, title, date = case type
                           when 'chrome_history'
                             search_chrome_history(term)
                           when 'chrome_bookmarks'
                             search_chrome_bookmarks(term)
                           when 'safari_bookmarks'
                             search_safari_urls(term, 'bookmark')
                           when 'safari_history'
                             search_safari_urls(term, 'history')
                           when 'safari_all'
                             search_safari_urls(term)
                           else
                             false
                           end
        if url
          results << {'url' => url, 'title' => title, 'date' => date}
        end
      }

      unless results.empty?
        out = results.sort_by! {|r| r['date'] }[-1]
        [out['url'], out['title']]
      else
        false
      end
    else
      false
    end
  end

  # FIXME: These spotlight searches no longer work on 10.13
  # Search Safari Bookmarks and/or history using spotlight
  #
  # @param (String) term
  # @param (String) type ['history'|'bookmark'|(Bool) false]
  #
  # @return (Array) [url, title, access_date] on success
  # @return (Bool) false on error
  def search_safari_urls(term,type = false)
    notify("Searching Safari History", term)
    onlyin = "~/Library/Caches/Metadata/Safari"
    onlyin += type ? "/"+type.capitalize : "/"
    type = type ? ".#{type}" : "*"
    # created:>10/13/13 kind:safari filename:.webbookmark
    # Safari history/bookmarks
    terms = term.split(/\s+/).delete_if {|t| t.strip =~ /^\s*$/ }.map{|t|
      %Q{kMDItemTextContent = "*#{t}*"cdw}
    }.join(" && ")

    date = type == ".history" ? "&& kMDItemContentCreationDate > $time.today(-182) " : ""

    avoid_results = ["404", "not found", "chrome-extension"].map {|q|
      %Q{ kMDItemDisplayName != "*#{q}*"cdw }
    }.join(" && ")
    query = %Q{((kMDItemContentType = "com.apple.safari#{type}") #{date}&& (#{avoid_results}) && (#{terms}))}

    search = %x{mdfind -onlyin #{onlyin.gsub(/ /,'\ ')} '#{query}'}
    if search.length > 0
      res = []
      search.split(/\n/).each {|file|
        url = %x{mdls -raw -name kMDItemURL "#{file}"}
        date = %x{mdls -raw -name kMDItemDateAdded "#{file}"}
        date = Time.parse(date)
        title = %x{mdls -raw -name kMDItemDisplayName "#{file}"}
        res << {'url' => url, 'date' => date, 'title' => title}
      }
      res.delete_if {|k,el| el =~ /\(null\)/ }

      latest = res.sort_by! {|r| r["date"] }[-1]
      [latest['url'], latest['title'], latest['date']]
    else
      false
    end
  end

  def extract_chrome_bookmarks(json,urls = [])

    if json.class == Array
      json.each {|item|
        urls = extract_chrome_bookmarks(item, urls)
      }
    elsif json.class == Hash
      if json.has_key? "children"
        urls = extract_chrome_bookmarks(json["children"],urls)
      elsif json["type"] == "url"
        date = Time.at(json["date_added"].to_i / 1000000 + (Time.new(1601,01,01).strftime('%s').to_i))
        urls << {'url' => json["url"], 'title' => json["name"], 'date' => date}
      else
        json.each {|k,v|
          urls = extract_chrome_bookmarks(v,urls)
        }

      end
    else
      return urls
    end
    urls
  end



  def wiki(terms)
    ## Hack to scrape wikipedia result
    body = %x{/usr/bin/curl -sSL 'https://en.wikipedia.org/wiki/Special:Search?search=#{CGI.escape(terms)}&go=Go'}
    if body
      if RUBY_VERSION.to_f > 1.9
        body = body.force_encoding('utf-8')
      end

      begin
        title = body.match(/"wgTitle":"(.*?)"/)[1]
        url = body.match(/<link rel="canonical" href="(.*?)"/)[1]
      rescue
        return false
      end
      return [url, title]
    end
    ## Removed because Ruby 2.0 does not like https connection to wikipedia without using gems?
    # uri = URI.parse("https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info&inprop=url&titles=#{CGI.escape(terms)}")
    # req = Net::HTTP::Get.new(uri.path)
    # req['Referer'] = "http://brettterpstra.com"
    # req['User-Agent'] = "SearchLink (http://brettterpstra.com)"

    # res = Net::HTTP.start(uri.host, uri.port,
    #   :use_ssl => true,
    #   :verify_mode => OpenSSL::SSL::VERIFY_NONE) do |https|
    #     https.request(req)
    #   end



    # if RUBY_VERSION.to_f > 1.9
    #   body = res.body.force_encoding('utf-8')
    # else
    #   body = res.body
    # end

    # result = JSON.parse(body)

    # if result
    #   result['query']['pages'].each do |page,info|
    #     unless info.key? "missing"
    #       return [info['fullurl'],info['title']]
    #     end
    #   end
    # end
    # return false
  end

  def zero_click(terms)
    url = URI.parse("http://api.duckduckgo.com/?q=#{CGI.escape(terms)}&format=json&no_redirect=1&no_html=1&skip_disambig=1")
    res = Net::HTTP.get_response(url).body
    res = res.force_encoding('utf-8') if RUBY_VERSION.to_f > 1.9

    result = JSON.parse(res)
    if result
      definition = result['Definition'] || false
      definition_link = result['DefinitionURL'] || false
      wiki_link = result['AbstractURL'] || false
      title = result['Heading'] || false
      return [title, definition, definition_link, wiki_link]
    else
      return false
    end
  end

  # Search apple music
  # terms => search terms (unescaped)
  # media => music, podcast
  # entity => optional: artist, song, album, podcast
  # returns {:type=>,:id=>,:url=>,:title}
  def applemusic(terms, media='music', entity='')
    aff = @cfg['itunes_affiliate']
    output = {}

    url = URI.parse("http://itunes.apple.com/search?term=#{CGI.escape(terms)}&country=#{@cfg['country_code']}&media=#{media}&entity=#{entity}")
    res = Net::HTTP.get_response(url).body
    res = res.force_encoding('utf-8') if RUBY_VERSION.to_f > 1.9
    res.gsub!(/(?mi)[\x00-\x08\x0B-\x0C\x0E-\x1F]/,'')
    json = JSON.parse(res)
    if json['resultCount'] && json['resultCount'] > 0
      result = json['results'][0]

      case result['wrapperType']
      when 'track'
        if result['kind'] == 'podcast'
          output[:type] = 'podcast'
          output[:id] = result['collectionId']
          output[:url] = result['collectionViewUrl'].to_am + aff
          output[:title] = result['collectionName']
        else
          output[:type] = 'song'
          output[:album] = result['collectionId']
          output[:id] = result['trackId']
          output[:url] = result['trackViewUrl'].to_am + aff
          output[:title] = result['trackName'] + " by " + result['artistName']
        end
      when 'collection'
        output[:type] = 'album'
        output[:id] = result['collectionId']
        output[:url] = result['collectionViewUrl'].to_am + aff
        output[:title] = result['collectionName'] + " by " + result['artistName']
      when 'artist'
        output[:type] = 'artist'
        output[:id] = result['artistId']
        output[:url] = result['artistLinkUrl'].to_am + aff
        output[:title] = result['artistName']
      end
      return false if output.empty?
      output
    else
      return false
    end
  end

  def itunes(entity, terms, dev, aff='')
    aff = @cfg['itunes_affiliate']

    url = URI.parse("http://itunes.apple.com/search?term=#{CGI.escape(terms)}&country=#{@cfg['country_code']}&entity=#{entity}")
    res = Net::HTTP.get_response(url).body
    res = res.force_encoding('utf-8').encode # if RUBY_VERSION.to_f > 1.9

    begin
      json = JSON.parse(res)
    rescue => e
      add_error('Invalid response', "Search for #{terms}: (#{e})")
      return false
    end
    return false unless json
    if json['resultCount'] && json['resultCount'] > 0
      result = json['results'][0]
      case entity
      when /movie/
        # dev parameter probably not necessary in this case
        output_url = result['trackViewUrl']
        output_title = result['trackName']
      when /(mac|iPad)Software/
        output_url = dev && result['sellerUrl'] ? result['sellerUrl'] : result['trackViewUrl']
        output_title = result['trackName']
      when /(musicArtist|song|album)/
        case result['wrapperType']
        when 'track'
          output_url = result['trackViewUrl']
          output_title = result['trackName'] + " by " + result['artistName']
        when 'collection'
          output_url = result['collectionViewUrl']
          output_title = result['collectionName'] + " by " + result['artistName']
        when 'artist'
          output_url = result['artistLinkUrl']
          output_title = result['artistName']
        end
      when /podcast/
        output_url = result['collectionViewUrl']
        output_title = result['collectionName']
      end
      return false unless output_url and output_title
      if dev
        return [output_url, output_title]
      else
        return [output_url + aff, output_title]
      end
    else
      return false
    end
  end

  def lastfm(entity, terms)
    url = URI.parse("http://ws.audioscrobbler.com/2.0/?method=#{entity}.search&#{entity}=#{CGI.escape(terms)}&api_key=2f3407ec29601f97ca8a18ff580477de&format=json")
    res = Net::HTTP.get_response(url).body
    res = res.force_encoding('utf-8') if RUBY_VERSION.to_f > 1.9
    json = JSON.parse(res)
    if json['results']
      begin
        case entity
        when 'track'
          result = json['results']['trackmatches']['track'][0]
          url = result['url']
          title = result['name'] + " by " + result['artist']
        when 'artist'
          result = json['results']['artistmatches']['artist'][0]
          url = result['url']
          title = result['name']
        end
        return [url, title]
      rescue
        return false
      end
    else
      return false
    end
  end

  def bing(terms, define = false)
    uri = URI.parse(%Q{https://api.datamarket.azure.com/Data.ashx/Bing/Search/v1/Web?Query=%27#{CGI.escape(terms)}%27&$format=json})
    req = Net::HTTP::Get.new(uri)
    req.basic_auth '2b0c04b5-efa5-4362-9f4c-8cae5d470cef', 'M+B8HkyFfCAcdvh1g8bYST12R/3i46zHtVQRfx0L/6s'

    res = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => true) {|http|
      http.request(req)
    }

    if res
      begin
        json = res.body
        json.force_encoding('utf-8') if json.respond_to?('force_encoding')
        data = JSON.parse(json)
        result = data['d']['results'][0]
        return [result['Url'], result['Title']]
      rescue
        return false
      end
    else
      return false
    end
  end

  def define(terms)
    begin
      def_url = "https://www.wordnik.com/words/#{CGI.escape(terms)}"
      body = %x{/usr/bin/curl -sSL '#{def_url}'}
      if body =~ /id="define"/
        first_definition = body.match(/(?mi)(?:id="define"[\s\S]*?<li>)([\s\S]*?)<\/li>/)[1]
        parts = first_definition.match(/<abbr title="partOfSpeech">(.*?)<\/abbr> (.*?)$/)
        return [def_url, "(#{parts[1]}) #{parts[2]}"]
      end
      return false
    rescue
      return false
    end
  end

  def pinboard_bookmarks
    bookmarks = %x{/usr/bin/curl -sSL "https://api.pinboard.in/v1/posts/all?auth_token=#{@cfg['pinboard_api_key']}&format=json"}
    bookmarks = bookmarks.force_encoding('utf-8')
    bookmarks.gsub!(/[^[:ascii:]]/) do |non_ascii|
      non_ascii.force_encoding('utf-8')
          .encode('utf-16be')
          .unpack('H*').first
          .gsub(/(....)/,'\u\1')
    end

    bookmarks.gsub!(/[\u{1F600}-\u{1F6FF}]/,'')

    bookmarks = JSON.parse(bookmarks)
    updated = Time.now
    result = {'update_time' => updated, 'bookmarks' => bookmarks}
    result
  end

  def save_pinboard_cache(cache)
    cachefile = PINBOARD_CACHE

    # file = File.new(cachefile,'w')
    # file = Zlib::GzipWriter.new(File.new(cachefile,'w'))
    begin
      marshal_dump = Marshal.dump(cache)
      File.write(cachefile, marshal_dump)
    rescue IOError => e
      add_error("Pinboard cache error","Failed to write stash to disk")
      return false
    end
    return true
  end

  def get_pinboard_cache
    refresh_cache = false
    cachefile = PINBOARD_CACHE

    if File.exists?(cachefile)
      begin
        file = IO.read(cachefile) # Zlib::GzipReader.open(cachefile)
        cache = Marshal.load file
          # file.close
      rescue IOError => e # Zlib::GzipFile::Error
        add_error("Error loading pinboard cache","Error reading #{cachefile}")
        return false
      end
      updated = JSON.parse(%x{/usr/bin/curl -sSL 'https://api.pinboard.in/v1/posts/update?auth_token=#{@cfg['pinboard_api_key']}&format=json'})
      last_bookmark = Time.parse(updated['update_time'])
      if cache && cache.key?('update_time')
        last_update = Time.parse(cache['update_time'])
        if last_update < last_bookmark
          refresh_cache = true
        end
      else
        refresh_cache = true
      end
    else
      refresh_cache = true
    end

    if refresh_cache
      cache = pinboard_bookmarks
      save_pinboard_cache(cache)
    end

    return cache
  end

  def pinboard(terms)
    unless @cfg['pinboard_api_key']
      add_error('Missing Pinboard API token', "Find your api key at https://pinboard.in/settings/password and add it to your configuration (pinboard_api_key: YOURKEY)")
      return false
    end

    result = false

    regex = terms.split(/ /).map { |arg| Regexp.escape arg }.join(".*?")
    regex = /#{regex}/i

    # cache = get_pinboard_cache
    cache = pinboard_bookmarks
    bookmarks = cache['bookmarks']

    bookmarks.each {|bm|
      text = [bm['description'],bm['tags']].join(" ")
      if text =~ regex
        result = [bm['href'],bm['description']]
        break
      end
    }
    return result

  end

  def google(terms, define = false)
    begin
      uri = URI.parse("http://ajax.googleapis.com/ajax/services/search/web?v=1.0&filter=1&rsz=small&q=#{CGI.escape(terms)}")
      req = Net::HTTP::Get.new(uri.request_uri)
      req['Referer'] = "http://brettterpstra.com"
      res = Net::HTTP.start(uri.host, uri.port) {|http|
        http.request(req)
      }
      if RUBY_VERSION.to_f > 1.9
        body = res.body.force_encoding('utf-8')
      else
        body = res.body
      end

      json = JSON.parse(body)
      if json['responseData']
        result = json['responseData']['results'][0]
        return false if result.nil?
        output_url = result['unescapedUrl']
        if define && output_url =~ /dictionary/
          output_title = result['content'].gsub(/<\/?.*?>/,'')
        else
          output_title = result['titleNoFormatting']
        end
        return [output_url, output_title]
      else
        return bing(terms, define)
      end
    rescue
      return bing(terms, define)
    end
  end

  def ddg(terms,type=false)

    prefix = type ? "#{type.sub(/^!?/,'!')} " : "%5C"

    begin
      body = `/usr/bin/curl -LIsS 'https://duckduckgo.com/lite?q=#{prefix}#{CGI.escape(terms)}'`
      locs = body.scan(/^location: (.*?)$/)
      return false unless locs
      url = locs[-1]
      result = url[0].strip rescue false
      return false unless result
      output_url = CGI.unescape(result)
      if @cfg['include_titles'] || @titleize
        output_title = titleize(output_url) rescue ''
      else
        output_title = ''
      end
      [output_url, output_title]
    end
  end

  def titleize(url)

    whitespace = url.match(/(\s*$)/)[0] || ''
    title = nil
    begin
      # source = %x{/usr/bin/curl -sSL '#{url.strip}'}

      uri = URI.parse(url)
      res = Net::HTTP.get_response(uri)

      if res.code.to_i == 200
        source = res.body
        unless source
          title = nil
        else
          title = source.match(/<title>(.*)<\/title>/im)
        end

        title = title.nil? ? nil : title[1].strip
      end

      if title.nil? || title =~ /^\s*$/
        $stderr.puts "Warning: missing title for #{url.strip}"
        title = url.gsub(/(^https?:\/\/|\/.*$)/,'').gsub(/-/,' ').strip
      else
        title = title.gsub(/\n/, ' ').gsub(/\s+/,' ').strip # .sub(/[^a-z]*$/i,'')
      end

      # Skipping SEO removal until it's more reliable
      # title.remove_seo(url.strip)
      title
    rescue Exception => e
      $stderr.puts "Error retrieving title for #{url.strip}"
      raise e
    end
  end

  def spell(phrase)
    unless File.exists?("/usr/local/bin/aspell")
      add_error('Missing aspell', "Install aspell in /usr/local/bin/aspell to allow spelling corrections")
      return false
    end
    words = phrase.split(/\b/)
    output = ""
    words.each do |w|
      if w =~ /[A-Za-z]+/
        spell_res =  `echo "#{w}" | /usr/local/bin/aspell --sug-mode=bad-spellers -C pipe | head -n 2 | tail -n 1`
        if spell_res.strip == "\*"
          output += w
        else
          spell_res.sub!(/.*?: /,'')
          results = spell_res.split(/, /).delete_if { |w| phrase =~ /^[a-z]/ && w =~ /[A-Z]/ }
          output += results[0]
        end
      else
        output += w
      end
    end
    output
  end

  # FIXME: Bing API stopped working for me
  # def spell(terms)
  #   caps = []
  #   terms.split(" ").each {|w|
  #     caps.push(w =~ /^[A-Z]/ ? true : false)
  #   }

  #   uri = URI.parse("https://api.datamarket.azure.com/Data.ashx/Bing/Search/v1/SpellingSuggestions?Query=%27#{CGI.escape(terms)}%27&$format=json")
  #   req = Net::HTTP::Get.new(uri)

  #   req.basic_auth '2b0c04b5-efa5-4362-9f4c-8cae5d470cef', 'M+B8HkyFfCAcdvh1g8bYST12R/3i46zHtVQRfx0L/6s'

  #   res = Net::HTTP.start(uri.hostname, uri.port, :use_ssl => true) {|http|
  #     http.request(req)
  #   }
  #   if res
  #     begin
  #       json = res.body
  #       json.force_encoding('utf-8') if json.respond_to?('force_encoding')
  #       data = JSON.parse(json)
  #       return terms if data['d']['results'].empty?
  #       result = data['d']['results'][0]['Value']
  #       output = []
  #       result.split(" ").each_with_index {|w, i|
  #         output.push(caps[i] ? w.capitalize : w)
  #       }
  #       return output.join(" ")
  #     rescue
  #       return false
  #     end
  #   else
  #     return false
  #   end
  # end

  def amazon_affiliatize(url, amazon_partner)
    return url if amazon_partner.nil? || amazon_partner.length == 0

    if url =~ /https?:\/\/(?:.*?)amazon.com\/(?:(.*?)\/)?([dg])p\/([^\?]+)/
      title = $1
      type = $2
      id = $3
      az_url = "http://www.amazon.com/#{type}p/product/#{id}/ref=as_li_ss_tl?ie=UTF8&linkCode=ll1&tag=#{amazon_partner}"
      return [az_url, title]
    else
      return [url,'']
    end
  end

  def social_handle(type, term)
    handle = term.sub(/^@/,'').strip
    case type
    when /twitter/
      url = "https://twitter.com/#{handle}"
      title = "@#{handle} on Twitter"
    when /adn/
      url = "https://alpha.app.net/#{handle}"
      title = "@#{handle} on App.net"
    when /fb/
      url = "https://www.facebook.com/#{handle}"
      title = "@#{handle} on Facebook"
    else
      [false, term, link_text]
    end
    [url, title]
  end

  def do_search(search_type, search_terms, link_text='')
    notify("Searching", search_terms)
    return [false, search_terms, link_text] unless search_terms.length > 0

    case search_type
    when /^r$/ # simple replacement
      if @cfg['validate_links']
        unless valid_link?(search_terms)
          return [false, "Link not valid: #{search_terms}", link_text]
        end
      end
      link_text = search_terms if link_text == ''
      return [search_terms, link_text, link_text]
    when /^@t/ # twitter-ify username
      if search_terms.strip =~ /^@?[0-9a-z_$]+$/i
        url, title = social_handle('twitter', search_terms)
        link_text = search_terms
      else
        return [false, "#{search_terms} is not a valid Twitter handle", link_text]
      end
    when /^@fb/ # fb-nify username
      if search_terms.strip =~ /^@?[0-9a-z_]+$/i
        url, title = social_handle('fb', search_terms)
        link_text = search_terms if link_text == ''
      else
        return [false, "#{search_terms} is not a valid Facebook username", link_text]
      end
    when /^sp(ell)?$/ # replace with spelling suggestion
      res = spell(search_terms)
      if res
        return [res, res, ""]
      else
        url = false
      end
    when /^h(([sc])([hb])?)*$/
      str = $1
      types = []
      if str =~ /s([hb]*)/
        if $1.length > 1
          types.push('safari_all')
        elsif $1 == 'h'
          types.push('safari_history')
        elsif $1 == 'b'
          types.push('safari_bookmarks')
        end
      end

      if str =~ /c([hb]*)/
        if $1.length > 1
          types.push('chrome_bookmarks')
          types.push('chrome_history')
        elsif $1 == 'h'
          types.push('chrome_history')
        elsif $1 == 'b'
          types.push('chrome_bookmarks')
        end
      end
      url, title = search_history(search_terms, types)
    when /^a$/
      az_url, title = ddg(%Q{site:amazon.com #{search_terms}})
      url, title = amazon_affiliatize(az_url, @cfg['amazon_partner'])

    when /^g$/ # google lucky search
      url, title = ddg(search_terms)

    when /^b$/ # bing
      url, title = bing(search_terms)
    when /^pb$/
      url, title = pinboard(search_terms)
    when /^wiki$/
      url, title = wiki(search_terms)

    when /^def$/ # wikipedia/dictionary search
      # title, definition, definition_link, wiki_link = zero_click(search_terms)
      # if search_type == 'def' && definition_link != ''
      #   url = definition_link
      #   title = definition.gsub(/'+/,"'")
      # elsif wiki_link != ''
      #   url = wiki_link
      #   title = "Wikipedia: #{title}"
      # end
      fix = spell(search_terms)

      if fix && search_terms.downcase != fix.downcase
        add_error('Spelling', "Spelling altered for '#{search_terms}' to '#{fix}'")
        search_terms = fix
        link_text = fix
      end

      url, title = define(search_terms)
    when /^imov?$/ #iTunes movie search
      dev = false
      url, title = itunes('movie',search_terms,dev,@cfg['itunes_affiliate'])
    when /^masd?$/ # Mac App Store search (mas = itunes link, masd = developer link)
      dev = search_type =~ /d$/
      url, title = itunes('macSoftware',search_terms, dev, @cfg['itunes_affiliate'])

    when /^itud?$/ # iTunes app search
      dev = search_type =~ /d$/
      url, title = itunes('iPadSoftware',search_terms, dev, @cfg['itunes_affiliate'])

    when /^s$/ # software search (google)
      url, title = ddg(%Q{-site:postmates.com -site:download.cnet.com -site:softpedia.com -site:softonic.com -site:macupdate.com (software OR app OR mac) #{search_terms}})
      unless @titleize
        link_text = title if link_text == ''
      end

    when /^am/ # apple music search
      stype = search_type.downcase.sub(/^am/,'')
      otype = 'link'
      if stype =~ /e$/
        otype = 'embed'
        stype.sub!(/e$/,'')
      end
      case stype
      when /^pod$/
        result = applemusic(search_terms, 'podcast')
      when /^art$/
        result = applemusic(search_terms, 'music', 'musicArtist')
      when /^alb$/
        result = applemusic(search_terms, 'music', 'album')
      when /^song$/
        result = applemusic(search_terms, 'music', 'musicTrack')
      else
        result = applemusic(search_terms)
      end

      # {:type=>,:id=>,:url=>,:title=>}
      if otype == 'embed' && result[:type] =~ /(album|song)/
        url = 'embed'
        if result[:type] =~ /song/
          link = %Q{https://embed.music.apple.com/#{@cfg['country_code']}/album/#{result[:album]}?i=#{result[:id]}&app=music#{@cfg['itunes_affiliate']}}
          height = 150
        else
          link = %Q{https://embed.music.apple.com/#{@cfg['country_code']}/album/#{result[:id]}?app=music#{@cfg['itunes_affiliate']}}
          height = 450
        end

        title = %Q{<iframe src="#{link}" allow="autoplay *; encrypted-media *;" frameborder="0" height="#{height}" style="width:100%;max-width:660px;overflow:hidden;background:transparent;" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"></iframe>}
      else
        url = result[:url]
        title = result[:title]
      end

    when /^ipod$/
      url, title = itunes('podcast', search_terms, false)

    when /^isong$/ # iTunes Song Search
      url, title = itunes('song', search_terms, false)

    when /^iart$/ # iTunes Artist Search
      url, title = itunes('musicArtist', search_terms, false)

    when /^ialb$/ # iTunes Album Search
      url, title = itunes('album', search_terms, false)

    when /^lsong$/ # Last.fm Song Search
      url, title = lastfm('track', search_terms)

    when /^lart$/ # Last.fm Artist Search
      url, title = lastfm('artist', search_terms)
    else
      if search_terms
        if search_type =~ /.+?\.\w{2,4}$/
          url, title = ddg(%Q{site:#{search_type} #{search_terms}})
        else
          url, title = ddg(search_terms)
        end
      end
    end
    if link_text == ''
      if @titleize
        link_text = title
      else
        link_text = search_terms
      end
    end

    if url && @cfg['validate_links'] && !valid_link?(url) && search_type !~ /^sp(ell)?/
      [false, "Not found: #{url}", link_text]
    elsif !url
      [false, "No results: #{url}", link_text]
    else
      [url, title, link_text]
    end
  end

end



sl = SearchLink.new({:echo => false})
overwrite = true
backup = sl.cfg['backup']

if ARGV.length > 0
  files = []
  ARGV.each {|arg|
    if arg =~ /^(--?)?(h(elp)?|v(ersion)?)$/
      $stdout.puts "SearchLink v#{VERSION}"
      sl.help_cli
      $stdout.puts "See http://brettterpstra.com/projects/searchlink/ for help"
      Process.exit
    elsif arg =~ /^--?(stdout)$/
      overwrite = false
    elsif arg =~ /^--?no[\-_]backup$/
      backup = false
    else
      files.push(arg)
    end
  }
  files.each {|file|
    if File.exists?(file) && %x{file -b "#{file}"|grep -c text}.to_i > 0
      if RUBY_VERSION.to_f > 1.9
        input = IO.read(file).force_encoding('utf-8')
      else
        input = IO.read(file)
      end
      FileUtils.cp(file,file+".bak") if backup && overwrite

      sl.parse(input)

      if overwrite
        File.open(file, 'w') do |f|
          f.puts sl.output
        end
      else
        puts sl.output
      end
    else
      $stderr.puts "Error reading #{file}"
    end
  }
else
  if RUBY_VERSION.to_f > 1.9
    input = STDIN.read.force_encoding('utf-8').encode
  else
    input = STDIN.read
  end

  sl.parse(input)
  if sl.clipboard
    print input
  else
    print sl.output
  end
end
