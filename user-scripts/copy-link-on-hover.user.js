// ==UserScript==
// @name         Copy Link on Hover
// @description  Copy link address without right-clicking. Just hover the link and hit Cmd-C (Mac) or Ctrl-C (Windows/Linux)!
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

/**
 * How it works:
 * When you hover over a link:
 * - If something is already selected in the page, it does nothing
 * - Otherwise, it takes the URL of the link you're hovering, copies it to an invisible span, and programmatically selects that span
 * - When you hit Cmd-C/Ctrl-C, the hidden selection is copied to clipboard
 * - When you move pointer away from the link, it clears the hidden selection
 *
 * Inspired by: https://github.com/dhruvtv/copylinkaddress
 */

(() => {
  // Create invisible element to hold the link address
  const linkAddressSpan = document.createElement('span');
  linkAddressSpan.id = 'copylAddress';
  linkAddressSpan.style.cssText = 'position: absolute; left: -9999em; display: inline-block;';

  // Track previous caret position for restoration
  let previousCaretPosition = -1;

  // Programmatically select the content of an element
  function selectElement(el) {
    // Backup current selection position if in an input
    if (window.getSelection().rangeCount > 0) {
      previousCaretPosition = document.activeElement.selectionStart;
    }

    const range = document.createRange();
    range.selectNodeContents(el);

    // Clear any existing selection
    if (window.getSelection().rangeCount > 0) {
      window.getSelection().removeAllRanges();
    }

    // Add our new selection
    window.getSelection().addRange(range);
  }

  // Clear the link address and restore previous selection
  function clearLinkAddress() {
    if (linkAddressSpan.textContent) {
      linkAddressSpan.textContent = '';
      linkAddressSpan.blur();
      window.getSelection().removeAllRanges();
    }

    // Restore previous caret position if it was in an input
    if (previousCaretPosition !== -1) {
      document.activeElement.selectionStart = previousCaretPosition;
      previousCaretPosition = -1;
    }
  }

  // Handle mouseenter on links
  function handleLinkEnter(e) {
    // e.target might be a text node, so get the element first
    const target = e.target instanceof Element ? e.target : e.target.parentElement;
    if (!target) return;
    
    const link = target.closest('a');
    if (!link) return;

    // Don't interfere if user already has something selected
    if (window.getSelection().toString()) {
      return;
    }

    // Get the href attribute
    const href = link.href;
    if (!href) return;

    // Set the invisible span's text to the link address
    linkAddressSpan.textContent = href;

    // Select it so Cmd-C/Ctrl-C will copy it
    selectElement(linkAddressSpan);
  }

  // Handle mouseleave on links
  function handleLinkLeave(e) {
    // e.target might be a text node, so get the element first
    const target = e.target instanceof Element ? e.target : e.target.parentElement;
    if (!target) return;
    
    const link = target.closest('a');
    if (!link) return;

    clearLinkAddress();
  }

  // Show a toast notification with the copied link
  function showToast(text) {
    const toast = document.createElement('div');
    toast.textContent = `📋 ${text}`;
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
    `;

    document.body.appendChild(toast);

    // Fade in
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        toast.remove();
      }, 200);
    }, 3000);
  }

  // Handle copy event (Cmd-C / Ctrl-C)
  function handleCopy(e) {
    // Only show toast if we have a link address selected
    if (linkAddressSpan.textContent && window.getSelection().toString() === linkAddressSpan.textContent) {
      showToast(linkAddressSpan.textContent);
    }
  }

  // Initialize the userscript
  function init() {
    // Append the invisible span to body
    if (!document.body) {
      // If body doesn't exist yet, wait for it
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    document.body.appendChild(linkAddressSpan);

    // Use event delegation on document level
    document.addEventListener('mouseenter', handleLinkEnter, true);
    document.addEventListener('mouseleave', handleLinkLeave, true);

    // Listen for copy events
    document.addEventListener('copy', handleCopy);

    // Clear on page unload
    window.addEventListener('beforeunload', clearLinkAddress);
  }

  // Start immediately if document is already ready, otherwise wait
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

