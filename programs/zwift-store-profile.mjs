#!/usr/bin/env node --experimental-fetch
/* BEWARE: Requires ZWIFT_USERNAME and ZWIFT_PASSWORD to be set either in ~/.secrets or in env vars */

import fs from "node:fs"
import assert from 'node:assert';
import os from 'node:os';
import jwtDecode from "jwt-decode";
import { config } from 'dotenv';

const DATA_FILE_PATH = `${os.homedir()}/zwift-data.csv` // TODO: Make this configurable

config({ path: `${os.homedir()}/.secrets` }) // file containing ZWIFT_USERNAME and ZWIFT_PASSWORD
const username = process.env.ZWIFT_USERNAME
const password = process.env.ZWIFT_PASSWORD

let accessToken = process.env.ZWIFT_ACCESS_TOKEN
let refreshToken = process.env.ZWIFT_REFRESH_TOKEN

if (!accessToken || jwtDecode(accessToken).exp < Date.now() / 1000) { // access token either doesn't exist or is expired
  if (refreshToken && jwtDecode(refreshToken).exp > Date.now() / 1000) { // refresh token exists and is not expired
    const res = await fetch('https://secure.zwift.com/auth/realms/zwift/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        "client_id": "Zwift Game Client",
        "grant_type": "refresh_token",
        "refresh_token": refreshToken,
      }).toString(),
    })
    const resJson = await res.json()
    accessToken = resJson.access_token
    refreshToken = resJson.refresh_token
  } else if (username && password) {
    const res = await fetch('https://secure.zwift.com/auth/realms/zwift/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        "client_id": "Zwift Game Client",
        "grant_type": "password",
        "username": username,
        "password": password,
      }).toString(),
    })
    const resJson = await res.json()
    accessToken = resJson.access_token
    refreshToken = resJson.refresh_token
    // TODO: Maybe store the refresh token somewhere? Maybe directly to the .secrets file?
  } else {
    throw new Error('No access token, refresh token or username/password provided')
  }
}

assert(accessToken, 'Still no access token')

const apiRes = await fetch("https://us-or-rly101.zwift.com/api/profiles/me", {
  "headers": {
    "accept": "application/json",
    "accept-language": "en-US,en;q=0.9,cs;q=0.8,sk;q=0.7",
    "authorization": `Bearer ${accessToken}`,
    "cache-control": "no-cache",
    "source": "my-zwift",
    "x-forwarded-for": "null",
    "x-real-ip": "null",
    "zwift-api-version": "2.5"
  },
  "referrer": "https://www.zwift.com/",
  "referrerPolicy": "strict-origin-when-cross-origin",
  "body": null,
  "method": "GET",
  "mode": "cors",
  "credentials": "include"
});

assert(apiRes.status === 200, "API request failed");

let apiData
try {
  apiData = await apiRes.json()
} catch (err) {
  let apiText = await apiRes.text()
  console.error('Invalid API response', apiText)
  process.exit(1)
}

const output = [
  new Date().toISOString(),
  apiData.totalExperiencePoints,
  apiData.totalGold,
  apiData.totalDistance,
  apiData.totalDistanceClimbed,
]

if (fs.existsSync(DATA_FILE_PATH)) {
  const lines = fs.readFileSync(DATA_FILE_PATH, 'utf8').split('\n').filter(Boolean)
  const lastLine = lines[lines.length - 1]
  const lastLineData = lastLine.split(',')
  const lastLineDate = lastLineData[0]
  const lastLineXp = lastLineData[1]
  console.log(`${lastLineXp} XP -> ${apiData.totalExperiencePoints} XP`)
} else {
  fs.writeFileSync(DATA_FILE_PATH, "date,xp,coins,distance,climbed\n", "utf-8")
}
fs.appendFileSync(DATA_FILE_PATH, output.join(",") + "\n", "utf-8")

/* Helpers */
/* === */
function unixTimeToHuman (unixTime) {
  const date = new Date(unixTime * 1000)
  return date.toISOString()
}
