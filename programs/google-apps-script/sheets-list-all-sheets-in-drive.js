/* global DriveApp, SpreadsheetApp, MimeType */

// eslint-disable-next-line no-unused-vars
function overviewGenerate() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const activeSheet = activeSpreadsheet.getActiveSheet()

  // UI: Loading
  activeSheet.getRange(1, 1).setValue("Loading, please wait – this will take some time.")

  // Loop through all the files and add the values to the spreadsheet.
  const files = DriveApp.getFilesByType(MimeType.GOOGLE_SHEETS)

  // Set up the spreadsheet to display the results
  const FIELDS = {
    URL: ["getUrl"],
    Name: ["getName"],
    LastUpdated: ["getLastUpdated"],
    Owner: ["getOwner.getName"],
    Trashed: ["isTrashed"],
    Stared: ["isStarred"],
    ShareableByEditors: ["isShareableByEditors"],
    getViewers: ["getViewers"],
    Size: ["getSize"],
    SharingPermission: ["getSharingPermission"],
    SharingAccess: ["getSharingAccess"],
  }

  const headers = Object.keys(FIELDS)
  activeSheet.getRange(1, 1, 1, headers.length).clear()
  activeSheet.getRange(1, 1, 1, headers.length).setValues([headers])

  let i = 0
  while (files.hasNext()) {
    i++
    const file = files.next()
    if (activeSpreadsheet.getId() === file.getId()) continue // Ignore self
    const values = []
    Object.entries(FIELDS).forEach(([key, spec]) => {
      let value
      try {
        value = spec[0].split(".").reduce((acc, x) => {
          return acc[x]()
        }, file)
      } catch (err) {
        value = `no value for ${key}`
      }
      values.push(value)
    })
    activeSheet.getRange(i + 1, 1, 1, headers.length).setValues([values])
  }
}
