on run argv
  tell application "Keyboard Maestro Engine"
    setvariable (item 1 of argv) to (item 2 of argv)
  end tell
end run


