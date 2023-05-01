#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { execSync } from 'child_process';

if (process.platform !== 'darwin') throw new Error('Only macOS is supported');
if (!process.env.MOCHI_API_TOKEN) throw new Error('MOCHI_API_TOKEN env var is required');

// ✏️ Edit this to change the deck
const DECK_ID = "2ivND95W"; // "Inbox"

// inspired by https://github.com/udarrr/clipboard-sys/
function getClipboardImage() {
  const tmpImagePath = path.join(os.tmpdir(), 'temp.png');
  fs.writeFileSync(tmpImagePath, Buffer.from([])); // create empty file
  const appleScript = `
    on run argv
        set d to the clipboard as «class PNGf»
        set fid to open for access ((item 1 of argv) as string) with write permission 
        write d to fid 
        close access fid
    end run
  `
  try {
    execSync(`osascript -ss -e '${appleScript}' ${tmpImagePath}`);
  } catch (err) {
    console.error(err);
    throw new Error('Failed to read image from clipboard');
  }
  return fs.readFileSync(tmpImagePath).toString('base64');
}

let clipboardType = 'text'
let clipboardContent;
let imageData;
try {
  clipboardContent = execSync(`osascript -e 'the clipboard as string'`).toString().trim();
} catch (err) {
  try {
    imageData = getClipboardImage();
    clipboardType = 'image';
  } catch (err2) {
    console.error(err2);
    throw new Error('Failed to read clipboard');
  }
}

const imageFilename = new Date().toISOString().replace(/:/g, '').replace(/-/g, '').split('.')[0] + '.png'; // e.g. "20210822T180000.png"
const apiRes = await fetch(`https://app.mochi.cards/api/cards/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(process.env.MOCHI_API_TOKEN + ':').toString('base64')}`,
  },
  body: JSON.stringify({
    "deck-id": DECK_ID,
    "content": clipboardType === "text" ? clipboardContent : `![](@media/${imageFilename})`,
    "attachments": clipboardType === "text" ? undefined : [{ "file-name": imageFilename, "content-type": "image/png", "data": imageData }]
  })
})

const apiJson = await apiRes.json()
if (apiJson.errors?.length || !apiRes.ok || !apiJson.id) throw new Error('Failed to create card')

console.log(`Mochi card created 🎉`)
