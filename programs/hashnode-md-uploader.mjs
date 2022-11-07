#!/usr/bin/env node
// @parameters file workspace
// above line is Nota app extension syntax, feel free to ignore and run the script as basic node:
// node ./hashnode-md-uploader.mjs /path/to/markdown.md

import path from "path"
import fs from "fs"
import { execSync } from "child_process"
import fetch, { FormData, fileFromSync } from "node-fetch" // TODO: Try to replace with native

// If you don't like env variables, override following:
// 🚨🚨🚨 DO NOT COMMIT if you are sharing the code
// process.env.HASHNODE_JWT=""
// process.env.HASHNODE_PUBLICATION_ID=""
// process.env.HASHNODE_TOKEN=""

// To obtain JWT
// 1. Open https://hashnode.com
// 2. Open DevTools
// 3. Go to Application tab
// 4. Go to Cookies
// 5. Copy value of "jwt" cookie (245 characters)
const JWT = process.env.HASHNODE_JWT;

// To obtain Publication ID
// Go to https://hashnode.com/settings/blogs
// Click on "Dashboard" button of the blog you want to upload to
// Copy ID from the URL, e.g. https://hashnode.com/<id>/dashboard
const PUBLICATION_ID = process.env.HASHNODE_PUBLICATION_ID;

// To obtain Hashnode API token
// 1. Open https://hashnode.com/settings/developer
// 2. Click on "Generate New Token" button or use the existing one
const HASHNODE_TOKEN = process.env.HASHNODE_TOKEN;

if (!JWT || !PUBLICATION_ID || !HASHNODE_TOKEN) {
  console.error("Please fill in the required environment variables")
  throw new Error("Please fill in the required environment variables")
}

const docPath = process.argv[2] // e.g. /path/to/markdown.md
const rootDir = process.argv[3] ?? '' // e.g. /users/<username>/documents/blog – important when assets paths are absolute within rootDir, as Nota app does

if (!docPath) throw new Error("No document path provided")

const docDirname = path.dirname(docPath) // e.g. /users/<username>/documents/blog/2022
const docBasename = path.basename(docPath, ".md") // e.g. My Blog Post

const docContent = fs.readFileSync(docPath, "utf-8")
let docContentModified = docContent // starts as a copy of a the original, will be modified in-place

const imagePaths = getImagesFromMarkdownDoc(docPath)
const imageUrls = [] // will be populated with URLs of uploaded images

imagePaths.forEach(async (imagePath, i) => {
  const imageType = path.extname(imagePath).slice(1) // e.g. `png` or `jpg`
  const imageFullPath = imagePath.startsWith(`/`)
    ? path.join(rootDir, imagePath) // Some apps, like Nota, use absolute paths within rootDir, like `/assets/image.png`
    : path.join(docDirname, imagePath) // Other apps, like Typora, use relative paths, like `./assets/image.png`

  // 1. Get info from Hashnode about Amazon S3 bucket where to upload the image
  const metaRes = await fetch(`https://hashnode.com/api/upload-image?imageType=${imageType}`, {
    "headers": {
      cookie: Object.entries({
        jwt: JWT,
        // Following seems to be important, but it's really not
        // 'hn-cookie-username': '...',
        // 'hn-user': '...',
      }).map(([key, value]) => `${key}=${value}`).join("; "),
    },
  });

  const {
    url, // https://s3.amazonaws.com/cloudmate-test
    fields // { key, bucket, X-Amz-Algorithm, X-Amz-Credential, X-Amz-Date, ... }
  } = await metaRes.json()

  // 2. Upload image to provided Amazon S3 bucket
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) formData.append(key, value)
  formData.append("file", fileFromSync(imageFullPath))
  const uploadRes = await fetch(url, {
    method: "POST",
    // Weirdly, correctly setting content-type to multipart/form-data will case `The body of your POST request is not well-formed multipart/form-data.`
    // headers: { "content-type": "multipart/form-data;" },
    body: formData
  })

  if (uploadRes.status !== 204) {
    console.log("Upload failed!")
    console.log(await uploadRes.text())
    return
  }

  const imageCdnUrl = `https://cdn.hashnode.com/${fields.key}`;
  console.log(`Upload success! ${imageCdnUrl}`)
  imageUrls.push(imageCdnUrl)

  // 3. Replace the local image path with the CDN URL
  docContentModified = docContentModified.replace(imagePath, imageCdnUrl)
})

// Save the modified Markdown file, uncomment for debugging purposes
// fs.writeFileSync(docPath + `.modified.md`, docContentModified, "utf-8")

// 4. Publish modified Markdown file to Hashnode
const publishRes = await fetch('https://api.hashnode.com', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: HASHNODE_TOKEN,
  },
  body: JSON.stringify({
    // TODO: Create as Draft by default
    query: `
      mutation createPublicationStory($input: CreateStoryInput!, $publicationId: String!) {
        createPublicationStory(input: $input, publicationId: $publicationId) {
          code
          success
          message
          post {
            cuid,
            slug,
            title,
            dateAdded,
            publication {
             domain
            }
          }
        }
      }
    `,
    variables: {
      publicationId: PUBLICATION_ID,
      input: {
        title: `${docBasename}`,
        contentMarkdown: docContentModified,
        // Available tags: https://github.com/Hashnode/support/blob/main/misc/tags.json
        tags: [
          // {
          //   _id: '56744723958ef13879b9549b',
          //   slug: 'testing',
          //   name: 'Testing',
          // },
        ],
        coverImageURL: imageUrls[0], // first image as Cover - not great, not terrible
      },
    },
  }),
}).then(res => res.json())

if (!publishRes?.data?.createPublicationStory?.success) {
  console.log("Publish failed!")
  console.log(publishRes)
  process.exit(1)
}

// 5. Open the published post in the browser
const url = `https://hashnode.com/edit/${publishRes.data.createPublicationStory.post.cuid}`
console.log(`Published to ${url}`)
execSync(`open ${url}`)


// TODO: Use proper parser, like markdown-it or remark
function getImagesFromMarkdownDoc(filePath) {
  const doc = fs.readFileSync(filePath, "utf-8")
  const images = doc.matchAll(/!\[(.*)]\((.*)\)/g) // capture both image title and path, for future
  return [...images].map(match => match[2]) // but return only the paths for now
}


