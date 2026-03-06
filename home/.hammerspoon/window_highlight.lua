-- Window Highlight Module
-- Draws a colored border around the currently focused window.
--
-- How it works:
-- 1. A window filter (hs.window.filter) watches for focus/unfocus events globally.
-- 2. When a window gains focus, we get its frame (position + size) and draw an
--    hs.drawing.rectangle slightly larger than the window to create a border effect.
-- 3. When a window loses focus (or a new one gains focus), the old rectangle is deleted.
--
-- The border is purely cosmetic — it's an overlay rectangle with no fill, just a stroke.
-- hs.drawing.rectangle creates a transparent canvas element that floats above all windows.
-- bringToFront(true) ensures it stays visible even above fullscreen apps.

local M = {}

-- Configuration: toggle, thickness, color, and corner rounding of the highlight border
M.config = {
    enabled = false,
    borderWidth = 6,
    color = {red = 1, green = 0, blue = 0, alpha = 0.8},
    cornerRadius = 12,
}

-- Holds the current hs.drawing object (or nil when no highlight is shown)
local highlight = nil

-- Draw (or redraw) a border around the currently focused window
local function highlightWindow()
    -- Clean up any existing highlight first
    if highlight then
        highlight:delete()
        highlight = nil
    end

    if not M.config.enabled then return end

    -- hs.window.focusedWindow() returns the frontmost window, or nil if
    -- the desktop/no window is focused
    local win = hs.window.focusedWindow()
    if not win then return end

    -- win:frame() returns an hs.geometry.rect with x, y, w, h of the window
    local frame = win:frame()
    local bw = M.config.borderWidth

    -- Expand the rectangle by half the border width on each side so the
    -- stroke is centered on the window edge
    local highlightFrame = hs.geometry.rect(
        frame.x - bw / 2,
        frame.y - bw / 2,
        frame.w + bw,
        frame.h + bw
    )

    -- hs.drawing.rectangle creates a drawable rectangle overlay on screen
    highlight = hs.drawing.rectangle(highlightFrame)
    highlight:setStrokeColor(M.config.color)
    highlight:setStrokeWidth(bw)
    highlight:setFill(false)                      -- no fill, border only
    highlight:setRoundedRectRadii(M.config.cornerRadius, M.config.cornerRadius)
    highlight:bringToFront(true)                  -- stay above all windows
    highlight:show()
end

-- hs.window.filter.default is a pre-built filter that tracks all visible,
-- standard windows. We subscribe to focus/unfocus events to keep the
-- highlight in sync with whatever window the user is interacting with.
hs.window.filter.default:subscribe(hs.window.filter.windowFocused, function()
    highlightWindow()
end)

hs.window.filter.default:subscribe(hs.window.filter.windowUnfocused, function()
    if highlight then
        highlight:delete()
        highlight = nil
    end
end)

return M
