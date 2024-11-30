// Name: Menu Items

import { de } from "@faker-js/faker/.";
import "@johnlindquist/kit"
import { Choice } from "@johnlindquist/kit";

const CONFIG = {
  ignoreAppleMenu: true,
  skipDisabledItems: true,
  maxProcessedChildren: 100,
}

let virtualKeys = {
  0x24: "↩", // kVK_Return
  0x4c: "⌤", // kVK_ANSI_KeypadEnter
  0x47: "⌧", // kVK_ANSI_KeypadClear
  0x30: "⇥", // kVK_Tab
  0x31: "␣", // kVK_Space
  0x33: "⌫", // kVK_Delete
  0x35: "⎋", // kVK_Escape
  0x39: "⇪", // kVK_CapsLock
  0x3f: "fn", // kVK_Function
  0x7a: "F1", // kVK_F1
  0x78: "F2", // kVK_F2
  0x63: "F3", // kVK_F3
  0x76: "F4", // kVK_F4
  0x60: "F5", // kVK_F5
  0x61: "F6", // kVK_F6
  0x62: "F7", // kVK_F7
  0x64: "F8", // kVK_F8
  0x65: "F9", // kVK_F9
  0x6d: "F10", // kVK_F10
  0x67: "F11", // kVK_F11
  0x6f: "F12", // kVK_F12
  0x69: "F13", // kVK_F13
  0x6b: "F14", // kVK_F14
  0x71: "F15", // kVK_F15
  0x6a: "F16", // kVK_F16
  0x40: "F17", // kVK_F17
  0x4f: "F18", // kVK_F18
  0x50: "F19", // kVK_F19
  0x5a: "F20", // kVK_F20
  0x73: "↖", // kVK_Home
  0x74: "⇞", // kVK_PageUp
  0x75: "⌦", // kVK_ForwardDelete
  0x77: "↘", // kVK_End
  0x79: "⇟", // kVK_PageDown
  0x7b: "◀︎", // kVK_LeftArrow
  0x7c: "▶︎", // kVK_RightArrow
  0x7d: "▼", // kVK_DownArrow
  0x7e: "▲", // kVK_UpArrow
};

// Menu item attributes:
// "AXEnabled",
// "AXFrame",
// "AXParent",
// "AXChildren",
// "AXSize",

// "AXRole",
// "AXMenuItemPrimaryUIElement",
// "AXServesAsTitleForUIElements",
// "AXTitle",
// "AXPosition",

// "AXMenuItemCmdGlyph",
// "AXMenuItemCmdModifiers",
// "AXMenuItemCmdVirtualKey",
// "AXMenuItemCmdChar",
// "AXMenuItemMarkChar",
// "AXSelected",

// "AXIdentifier"

// let res = await applescript(script);
let res = await jxa(/* js */`
  let systemEvents = Application('System Events');
  let frontmostApp = systemEvents.processes.whose({ frontmost: true })[0];
  let menuBar = frontmostApp.menuBars[0];
  let rootMenuItems = menuBar.menuBarItems.name();

  let debug;

  let menuItems = [];
  for (let rootMenuItem of rootMenuItems) {
    let processedChildren = 0;
    if (${CONFIG.ignoreAppleMenu} && rootMenuItem === "Apple") continue;
    if (rootMenuItem !== "View") { continue }
    let menu = menuBar.menuBarItems[rootMenuItem].menus[0]; // there's only 0
    for (let subItem of menu.menuItems()) {
      let subItemName = subItem.name();
      if (!subItemName) continue; // remove dividers
      let enabled = subItem?.attributes.byName("AXEnabled")?.value() || false;
      if (${CONFIG.skipDisabledItems} && !enabled) continue;

      if (subItemName === "Appearance") {
        let attributes = subItem.attributes.name()
        let cmdChar = subItem?.attributes.byName("AXMenuItemCmdChar")?.value() || ""; // e.g. "N"
        let cmdVirtualKey = subItem?.attributes.byName("AXMenuItemCmdVirtualKey")?.value() || "";
        let cmdModifiers = subItem?.attributes.byName("AXMenuItemCmdModifiers")?.value() || ""; // e.g. 6
        let markChar = subItem?.attributes.byName("AXMenuItemMarkChar")?.value() || ""; // e.g. "⌘N"
        let children = subItem.attributes.byName("AXChildren")?.value() || [];
        debug = JSON.stringify({ subItemName, children });
      }

      let cmdChar = subItem?.attributes.byName("AXMenuItemCmdChar")?.value() || ""; // e.g. "N"
      let cmdVirtualKey = subItem?.attributes.byName("AXMenuItemCmdVirtualKey")?.value() || ""; // e.g. 124 for "▶︎"
      let cmdModifiers = subItem?.attributes.byName("AXMenuItemCmdModifiers")?.value() || ""; // e.g. 6
      menuItems.push({
        name: subItemName,
        path: [rootMenuItem, subItemName].join(" > "),
        enabled,
        cmdModifiers,
        cmdChar,
        cmdVirtualKey,
      });

      // TODO: Get nested children using AXChildrenAttribute?
      // Shortcuts: https://github.com/BenziAhamed/Menu-Bar-Search/blob/master/menu/Sources/menu/AX.swift#L159
    }
  }
  debug ?? JSON.stringify({ menuItems });
`)


console.log("==============xxx====xxxx==================");
console.log(JSON.stringify(res, null, 2));

let choices: Choice[] = res.menuItems?.map((item) => {
  let mods = modsToText(item.cmdModifiers);
  let shortcut = ""
  if (item.cmdVirtualKey) {
    shortcut = mods + virtualKeys[item.cmdVirtualKey];
  } else {
    shortcut = mods + item.cmdChar
  }

  return {
    name: item.path,
    tag: shortcut,
  }
})
let which = await arg("Choose a menu item", choices);


// inspect(res);


/**
 * Convert a MacOS modifier mask to a human-readable string.
 */
function modsToText(modifiers: number) {
  if (modifiers === 0x18) return "fn";
  let result = [];
  if ((modifiers & 0x04) > 0) result.push("⌃"); // Control key
  if ((modifiers & 0x02) > 0) result.push("⌥"); // Option key
  if ((modifiers & 0x01) > 0) result.push("⇧"); // Shift key
  if ((modifiers & 0x08) === 0) result.push("⌘"); // Command key
  return result.join("");
}




// Inspired by Kit's "applescript" function
async function jxa(script: string) {
  await writeFile(kenvTmpPath("tmp.jxa"), script);
  let { stdout, stderr } =  await execa("osascript", ["-l", "JavaScript", kenvTmpPath("tmp.jxa")]);
  if (stderr) {
    throw new Error(stderr);
  }
  // console.log({ stdout });
  try {
    return JSON.parse(stdout);
  } catch (error) {
    console.log({ stdout });
    return stdout;
  }
}

// NSWorkspace.shared.menuBarOwningApplication
// NSRunningApplication(processIdentifier: args.pid)

// ./menu \
// -cache 2 \
// -max-children "$maxItemsPerMenu" \
// -max-depth "$maxSubMenusToSearch" \
// -show-disabled "$showDisabledItems" \
// -show-apple-menu "$showAppleMenuItems" \
// -async \
// -recache "$recacheOnStartup" \
// -query "{query}"

// appFilters {
//   app: "BibDesk"
//   showDisabledMenuItems: true
// }

// appFilters {
//     app: "Safari"
//     ignoreMenuPaths {
//         path: "History"
//     }
//     ignoreMenuPaths {
//         path: "Bookmarks"
//     }
// }

// appFilters {
//     app: "Google Chrome"
//     disabled: true
// }
