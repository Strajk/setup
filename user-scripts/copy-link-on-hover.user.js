// ==UserScript==
// @name         Copy Link on Hover
// @description  Copy link address without right-clicking. Hover a link and hit Cmd-C for plain URL, or Cmd-Ctrl-C for enhanced copy (e.g. Slack message content).
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

/**
 * How it works:
 * When you hover over a link:
 * - If something is already selected in the page, it does nothing
 * - Otherwise, it takes the URL of the link you're hovering, copies it to an invisible span, and programmatically selects that span
 * - Cmd-C/Ctrl-C copies the plain URL to clipboard
 * - Cmd-Ctrl-C / Ctrl-Alt-C runs service-specific enhancement (e.g. appends Slack message content as markdown)
 * - When you move pointer away from the link, it clears the hidden selection
 *
 * Service-specific enhancements (triggered by Cmd-Ctrl-C / Ctrl-Alt-C):
 * - Slack: When hovering a link within a message, appends the message content as markdown
 *
 * Inspired by: https://github.com/dhruvtv/copylinkaddress
 */

(() => {
  // ========================================
  // DEBUG SETUP
  // ========================================

  const debugEnabled = false
  const debug = debugEnabled
    ? (...args) => console.log("[Copy Link on Hover]", ...args)
    : () => {}

  // ========================================
  // SLACK MARKDOWN CONVERTER
  // Inlined from lib/slack-html-parser.ts
  // ========================================

  function normalizeWhitespace (text) {
    return text.replace(/\s+/g, " ")
  }

  function extractNick (username) {
    const quotedMatch = username.match(/'([^']+)'/)
    if (quotedMatch) return quotedMatch[1]

    const underscoreIndex = username.indexOf("_")
    if (underscoreIndex !== -1) {
      return username.substring(0, underscoreIndex)
    }

    return username
  }

  function formatTimestamp (timestampMs) {
    const date = new Date(timestampMs)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    const seconds = String(date.getSeconds()).padStart(2, "0")

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  function getTextContent (element) {
    let text = ""

    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === 3) { // Text node
        const content = node.textContent || ""
        text += normalizeWhitespace(content)
      } else if (node.nodeType === 1) { // Element node
        const el = node

        if (el.tagName === "BR") {
          text += "\n"
        } else if (el.tagName === "SPAN" && el.classList.contains("c-mrkdwn__br")) {
          text += "\n"
        } else if (el.tagName === "A") {
          const href = el.getAttribute("href")
          const linkText = normalizeWhitespace(el.textContent || "").trim()

          if (href && href.includes("/team/")) {
            const username = linkText.startsWith("@") ? linkText.substring(1) : linkText
            const nick = extractNick(username)
            text += `@${nick}`
          } else if (linkText === href) {
            text += href
          } else {
            text += `[${linkText}](${href})`
          }
        } else if (el.tagName === "BLOCKQUOTE") {
          const quoteText = getTextContent(el).trim()
          text += quoteText.split("\n").map(line => `> ${line.trim()}`).join("\n") + "\n"
        } else {
          text += getTextContent(el)
        }
      }
    }

    return text
  }

  function slackElementToMarkdown (messageContainer) {
    try {
      debug("slackElementToMarkdown: Processing message container")
      // Extract sender
      const senderButton = messageContainer.querySelector("[data-qa=\"message_sender_name\"]")
      const sender = normalizeWhitespace(senderButton ? senderButton.textContent || "" : "").trim()
      const nick = extractNick(sender)
      debug("slackElementToMarkdown: Found sender:", nick)

      // Extract timestamp
      const msgTs = messageContainer.getAttribute("data-msg-ts") // '1757346929.116089'
      const timestampMs = Math.floor(parseFloat(msgTs) * 1000)
      const timestamp = formatTimestamp(timestampMs)

      // Extract message content
      const messageBlocks = messageContainer.querySelector(".p-rich_text_block")
      if (!messageBlocks) {
        debug("slackElementToMarkdown: No message blocks found")
        return null
      }

      const content = getTextContent(messageBlocks)
        .split("\n")
        .map(line => {
          if (line.trim().startsWith(">")) return line.trim()
          return line.replace(/ +/g, " ").trim()
        })
        .join("\n")
        .trim()

      // Format as markdown
      let markdown = `\n##### @${nick} at ${timestamp}\n\n`
      markdown += content
      markdown += "\n"

      debug("slackElementToMarkdown: Successfully converted to markdown")
      return markdown
    } catch (error) {
      debug("slackElementToMarkdown: Error:", error)
      console.error("[Copy Link on Hover] Error parsing Slack message:", error)
      return null
    }
  }

  // ========================================
  // SERVICE HANDLERS (modular but in one file)
  // ========================================

  const serviceHandlers = {
    /**
     * Slack handler - enriches copied links with message content
     */
    slack: {
      matches: () => {
        const isSlack = window.location.hostname === "app.slack.com"
        debug("Slack handler - matches:", isSlack)
        return isSlack
      },

      enhanceContent: (link) => {
        debug("Slack handler - enhanceContent called for link:", link.href)
        // Check if link is within a Slack message
        const messageContainer = link.closest(".c-message_kit__message")
        if (!messageContainer) {
          debug("Slack handler - link not in message container")
          return null
        }

        debug("Slack handler - found message container, converting to markdown")
        // Get the message markdown
        const messageMarkdown = slackElementToMarkdown(messageContainer)
        if (!messageMarkdown) {
          debug("Slack handler - failed to convert to markdown")
          return null
        }

        debug("Slack handler - successfully enhanced content")
        // Return enhanced content: URL + message markdown
        return link.href + messageMarkdown
      },
    },

    // Add more service handlers here following the same pattern:
    // serviceName: {
    //   matches: () => boolean,
    //   enhanceContent: (link) => string | null
    // }
  }

  // ========================================
  // MAIN SCRIPT LOGIC
  // ========================================

  // Create invisible element to hold the link address
  const linkAddressSpan = document.createElement("span")
  linkAddressSpan.id = "copylAddress"
  linkAddressSpan.style.cssText = "position: absolute; left: -9999em; display: inline-block;"

  // Track previous caret position for restoration
  let previousCaretPosition = -1

  // Track the current hovered link for later enhancement during copy
  let currentHoveredLink = null

  // Programmatically select the content of an element
  function selectElement (el) {
    // Backup current selection position if in an input
    if (window.getSelection().rangeCount > 0) {
      previousCaretPosition = document.activeElement.selectionStart
    }

    const range = document.createRange()
    range.selectNodeContents(el)

    // Clear any existing selection
    if (window.getSelection().rangeCount > 0) {
      window.getSelection().removeAllRanges()
    }

    // Add our new selection
    window.getSelection().addRange(range)
  }

  // Clear the link address and restore previous selection
  function clearLinkAddress () {
    if (linkAddressSpan.textContent) {
      linkAddressSpan.textContent = ""
      linkAddressSpan.blur()
      window.getSelection().removeAllRanges()
    }

    // Clear the hovered link reference
    currentHoveredLink = null

    // Restore previous caret position if it was in an input
    if (previousCaretPosition !== -1) {
      document.activeElement.selectionStart = previousCaretPosition
      previousCaretPosition = -1
    }
  }

  // Get content to copy (with service-specific enhancements)
  function getContentToCopy (link) {
    debug("getContentToCopy: Processing link:", link.href)
    // Check if any service handler applies
    for (const handler of Object.values(serviceHandlers)) {
      if (handler.matches()) {
        debug("getContentToCopy: Handler matched, attempting enhancement")
        const enhancedContent = handler.enhanceContent(link)
        if (enhancedContent) {
          debug("getContentToCopy: Content enhanced successfully")
          return enhancedContent
        }
        debug("getContentToCopy: Enhancement returned null")
      }
    }

    // Default: just return the href
    debug("getContentToCopy: No handler matched, returning plain href")
    return link.href
  }

  // Handle mouseenter on links
  function handleLinkEnter (e) {
    // e.target might be a text node, so get the element first
    const target = e.target instanceof Element ? e.target : e.target.parentElement
    if (!target) {
      // debug("handleLinkEnter: No target element")
      return
    }

    const link = target.closest("a")
    if (!link) {
      // debug("handleLinkEnter: No link element found")
      return
    }

    debug("handleLinkEnter: Link found:", link.href)

    // Get the href attribute
    const href = link.href
    if (!href) {
      debug("handleLinkEnter: No href attribute")
      return
    }

    // Don't interfere if user already has something selected (unless it's the same as the link)
    const currentSelection = window.getSelection().toString()
    if (currentSelection && currentSelection !== href) {
      debug("handleLinkEnter: User has different selection, skipping:", currentSelection)
      return
    }

    // Store the link for potential enhancement during copy
    currentHoveredLink = link

    // Set the invisible span's text to just the plain href (fast)
    linkAddressSpan.textContent = href
    debug("handleLinkEnter: Plain href prepared, will enhance on copy if needed")

    // Select it so Cmd-C/Ctrl-C will copy it
    selectElement(linkAddressSpan)
  }

  // Handle mouseleave on links
  function handleLinkLeave (e) {
    // e.target might be a text node, so get the element first
    const target = e.target instanceof Element ? e.target : e.target.parentElement
    if (!target) return

    const link = target.closest("a")
    if (!link) return

    debug("handleLinkLeave: Clearing link address")
    clearLinkAddress()
  }

  // Show a toast notification with the copied link
  function showToast (text, enhanced = false) {
    const toast = document.createElement("div")
    // Show preview (first 100 chars) if text is long
    const preview = text.length > 100 ? text.substring(0, 100) + "..." : text
    toast.textContent = `${enhanced ? "📎" : "📋"} ${preview}`
    toast.style.cssText = `
      position: fixed;
      bottom: 16px;
      right: 16px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      max-width: 800px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      z-index: 999999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
    `

    document.body.appendChild(toast)

    // Fade in
    requestAnimationFrame(() => {
      toast.style.opacity = "1"
    })

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = "0"
      setTimeout(() => {
        toast.remove()
      }, 200)
    }, 3000)
  }

  // Handle copy event (Cmd-C / Ctrl-C) — always copies the plain URL
  function handleCopy (e) {
    debug("handleCopy: Copy event triggered")
    debug("handleCopy: linkAddressSpan content:", linkAddressSpan.textContent ? linkAddressSpan.textContent.substring(0, 100) : "(empty)")
    debug("handleCopy: Selected text:", window.getSelection().toString().substring(0, 100))

    if (linkAddressSpan.textContent && window.getSelection().toString() === linkAddressSpan.textContent) {
      debug("handleCopy: Plain URL copied")
      showToast(linkAddressSpan.textContent)
    } else {
      debug("handleCopy: Not our selection, skipping")
    }
  }

  // Handle Cmd-Ctrl-C (Mac) / Ctrl-Alt-C (Win/Linux) — service-specific enhanced copy
  function handleEnhancedCopy (e) {
    const isMac = navigator.platform.toUpperCase().includes("MAC")
    const modifierMatch = isMac
      ? e.metaKey && e.ctrlKey && !e.altKey && !e.shiftKey
      : e.ctrlKey && e.altKey && !e.shiftKey && !e.metaKey

    if (!modifierMatch || e.key !== "c") return
    if (!currentHoveredLink) return

    e.preventDefault()

    const enhancedContent = getContentToCopy(currentHoveredLink)
    debug("handleEnhancedCopy: Copying enhanced content:", enhancedContent.substring(0, 100))

    navigator.clipboard.writeText(enhancedContent).then(() => {
      showToast(enhancedContent, true)
    }).catch(err => {
      debug("handleEnhancedCopy: Clipboard write failed:", err)
    })
  }

  // Initialize the userscript
  function init () {
    debug("init: Initializing userscript")
    // Append the invisible span to body
    if (!document.body) {
      // If body doesn't exist yet, wait for it
      debug("init: Body not ready, waiting for DOMContentLoaded")
      document.addEventListener("DOMContentLoaded", init)
      return
    }

    debug("init: Appending invisible span to body")
    document.body.appendChild(linkAddressSpan)

    // Use event delegation on document level
    debug("init: Setting up event listeners")
    document.addEventListener("mouseenter", handleLinkEnter, true)
    document.addEventListener("mouseleave", handleLinkLeave, true)

    // Listen for copy events (plain URL)
    document.addEventListener("copy", handleCopy)

    // Listen for enhanced copy shortcut (Cmd-Option-C / Ctrl-Alt-C)
    document.addEventListener("keydown", handleEnhancedCopy)

    // Clear on page unload
    window.addEventListener("beforeunload", clearLinkAddress)

    debug("init: Userscript fully initialized and ready")
  }

  // Start immediately if document is already ready, otherwise wait
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()
