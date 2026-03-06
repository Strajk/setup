-- Cursor Editor Module
-- Hotkeys that automate Cursor IDE interactions via simulated keypresses.
--
-- How it works:
-- 1. hs.hotkey.new() creates hotkeys that are NOT globally active — they start disabled.
-- 2. An hs.application.watcher monitors app activate/deactivate events.
-- 3. When Cursor becomes the frontmost app, all hotkeys are enabled; when another app takes focus, they are disabled. This prevents conflicts with other apps.
-- 4. The automation functions use hs.eventtap to simulate keyboard input:
--    - keyStroke() sends a full key press (down + up) with optional modifiers
--    - newKeyEvent():post() sends individual key-down or key-up events (faster, avoids the 200ms built-in delay of keyStroke between down and up)
-- 5. hs.timer.doAfter() schedules callbacks after a delay, giving the UI time to react between simulated keypresses.

local M = {}

-- Simulate switching the AI model in Cursor's model picker dropdown.
-- Opens the picker with Cmd+/, then presses Down arrow `downPresses` times to reach the desired model, and confirms with Return.
--
-- @param downPresses number - how many times to press Down to reach the model
local function switchCursorModel(downPresses)
    local app = hs.application.frontmostApplication()
    if app:name() ~= "Cursor" then return end

    -- Cmd+/ opens the model picker dropdown in Cursor
    hs.eventtap.keyStroke({"cmd"}, "/", 0)

    -- Wait 150ms for the dropdown to appear, then navigate
    hs.timer.doAfter(0.15, function()
        -- Use raw key events instead of keyStroke() — keyStroke has a built-in
        -- 200ms down-to-up delay that would compound across multiple presses
        for _ = 1, downPresses do
            hs.eventtap.event.newKeyEvent({}, "down", true):post()
            hs.eventtap.event.newKeyEvent({}, "down", false):post()
        end
        hs.eventtap.event.newKeyEvent({}, "return", true):post()
        hs.eventtap.event.newKeyEvent({}, "return", false):post()
    end)
end

-- Toggle the "Auto-run" setting in Cursor's features panel.
-- Navigates: Cmd+Shift+J (open features) -> Cmd+F (search) -> type "Auto-run"
-- -> Enter (find) -> Tab (move to toggle) -> Enter (toggle it).
--
-- The nested hs.timer.doAfter calls create a sequential chain of actions,
-- each waiting for the previous UI state to settle before proceeding.
local function adjustCursorAutoRun()
    local app = hs.application.frontmostApplication()
    if app:name() ~= "Cursor" then return end

    -- Cmd+Shift+J opens the Cursor features/settings panel
    hs.eventtap.keyStroke({"cmd", "shift"}, "j", 0)

    hs.timer.doAfter(0.3, function()
        -- Cmd+F opens the search within the panel
        hs.eventtap.keyStroke({"cmd"}, "f", 0)

        hs.timer.doAfter(0.3, function()
            -- keyStrokes() types a string character by character (not a shortcut)
            hs.eventtap.keyStrokes("Auto-run")

            hs.timer.doAfter(0.5, function()
                -- Enter to confirm the search / jump to result
                hs.eventtap.event.newKeyEvent({}, "return", true):post()
                hs.eventtap.event.newKeyEvent({}, "return", false):post()
            end)

            hs.timer.doAfter(0.7, function()
                -- Tab to move focus to the toggle control
                hs.eventtap.event.newKeyEvent({}, "tab", true):post()
                hs.eventtap.event.newKeyEvent({}, "tab", false):post()

                hs.timer.doAfter(0.1, function()
                    -- Enter to toggle the setting
                    hs.eventtap.event.newKeyEvent({}, "return", true):post()
                    hs.eventtap.event.newKeyEvent({}, "return", false):post()
                end)
            end)
        end)
    end)
end

-- Hotkey definitions (created disabled, activated by the app watcher below).
-- hs.hotkey.new() registers a hotkey without enabling it — unlike hs.hotkey.bind() which immediately activates the binding globally.
--
-- The downPresses count depends on the order of models in Cursor's dropdown.
-- Adjust these numbers if the model list changes.
local cursorHotkeys = {}

cursorHotkeys.autorun  = hs.hotkey.new({"cmd", "ctrl"}, "f8",  function() adjustCursorAutoRun() end)

cursorHotkeys.codex    = hs.hotkey.new({"cmd", "ctrl"}, "f9",  function() switchCursorModel(6) end)
cursorHotkeys.sonnet   = hs.hotkey.new({"cmd", "ctrl"}, "f10", function() switchCursorModel(5) end)
cursorHotkeys.opus     = hs.hotkey.new({"cmd", "ctrl"}, "f11", function() switchCursorModel(4) end)
cursorHotkeys.composer = hs.hotkey.new({"cmd", "ctrl"}, "f12", function() switchCursorModel(3) end)

-- hs.application.watcher fires callbacks when apps are activated, deactivated, launched, or terminated. We use `activated` to know when Cursor gains focus. Storing the watcher in M (the module table) prevents it from being garbage-collected, which would silently stop the watcher.
local function appWatcherCallback(appName, eventType, _appObject)
    if eventType == hs.application.watcher.activated then
        if appName == "Cursor" then
            for _, hk in pairs(cursorHotkeys) do hk:enable() end
        else
            for _, hk in pairs(cursorHotkeys) do hk:disable() end
        end
    end
end

M.appWatcher = hs.application.watcher.new(appWatcherCallback)
M.appWatcher:start()

-- If Cursor is already the frontmost app when this module loads (e.g. after a Hammerspoon config reload), enable hotkeys immediately.
if hs.application.frontmostApplication():name() == "Cursor" then
    for _, hk in pairs(cursorHotkeys) do hk:enable() end
end

return M
