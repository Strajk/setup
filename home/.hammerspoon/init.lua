-- Hammerspoon Configuration
-- https://www.hammerspoon.org/
--
-- Hammerspoon is a macOS automation tool that exposes system APIs to Lua scripts.
-- This file is the entry point — Hammerspoon loads ~/.hammerspoon/init.lua on startup
-- and whenever the config is reloaded (via the menu bar icon or hs.reload()).
--
-- Lua's require() loads modules from the same directory as init.lua.
-- It searches for <name>.lua files, runs them once, and caches the result.
-- Subsequent require() calls return the cached module table without re-executing.

-- Draws a colored border around the focused window
require("window_highlight")

-- Cursor IDE hotkeys
require("cursor")
