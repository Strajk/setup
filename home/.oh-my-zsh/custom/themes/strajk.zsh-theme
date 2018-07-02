function time_ago {
  if [ -x $1 ]; then
    echo "?"
    exit;
  fi

  local now=`date +%s`;
  local sec=$((now - $1));
  local min=$((sec / 60));
  local hrs=$((sec / 3600));
  local day=$((sec / 86400));

  local real_hrs=$((hrs % 24));
  local real_min=$((min % 60));

  if [ "$hrs" -gt 24 ]; then
    time_ago="${day}d"
  elif [ "$min" -gt 60 ]; then
    time_ago="${hrs}h"
  else
    time_ago="${min}m"
  fi
  [ "$time_ago" != "" ] && echo "${time_ago}"
}

git_branch() {
  echo $(/usr/bin/git symbolic-ref HEAD 2>/dev/null | awk -F/ {'print $NF'})
}

git_dirty() {
  last_commit=$(time_ago `git log --pretty=format:'%at' -1 2>/dev/null;`);
  last_mine=$(time_ago `git mine --pretty=format:'%at' -1 2>/dev/null;`);
  st=$(/usr/bin/git status 2>/dev/null | tail -n 1)
  if [[ $st == "" ]]
  then
    echo ""
  else
    if [[ $st == "nothing to commit (working directory clean)" ]]
    then
      echo "on %{$fg_bold[green]%}$(git_prompt_info) last commit: ${last_commit}%{$reset_color%}"
    else
      echo "on %{$fg_bold[red]%}$(git_prompt_info) last commit: ${last_commit}%{$reset_color%}"
    fi
  fi
}

git_prompt_info () {
 ref=$(/usr/bin/git symbolic-ref HEAD 2>/dev/null) || return
# echo "(%{\e[0;33m%}${ref#refs/heads/}%{\e[0m%})"
 echo "${ref#refs/heads/}"
}

unpushed () {
  /usr/bin/git cherry -v @{upstream} 2>/dev/null
}

need_push () {
  if [[ $(unpushed) == "" ]]
  then
    echo " "
  else
    echo " with %{$fg_bold[magenta]%}unpushed%{$reset_color%} "
  fi
}

rb_prompt(){
  if $(which rbenv &> /dev/null)
  then
	  echo "ruby: %{$fg_bold[yellow]%}$(rbenv version | awk '{print $1}')%{$reset_color%}"
	else
	  echo ""
  fi
}

# This keeps the number of todos always available the right hand side of my
# command line. I filter it to only count those tagged as "+next", so it's more
# of a motivation to clear out the list.
todo(){
  if $(which todo.sh &> /dev/null)
  then
    num=$(echo $(todo.sh ls +next | wc -l))
    let todos=num-2
    if [ $todos != 0 ]
    then
      echo "$todos"
    else
      echo ""
    fi
  else
    echo ""
  fi
}

directory_name(){
  echo "%{$fg_bold[cyan]%}%1/%\/%{$reset_color%}"
}

precmd() {
  smiley="%(?,%{$fg[green]%}☺%{$reset_color%},%{$fg[red]%}☹%{$reset_color%})"
  RPROMPT=$'$(rb_prompt)'
  PROMPT=$'\n⌌ ${smiley} $(directory_name) $(git_dirty)$(need_push)\n⌎ '
}
