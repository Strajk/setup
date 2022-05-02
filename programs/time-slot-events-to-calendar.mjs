import { runAppleScript } from "run-applescript"
import dayjs from "dayjs"

// Customize
// =========
const CALENDAR = "Plan" // TODO: Maybe take from args?
const DEFAULT_DURATION = 90 // minutes

const INPUT_SPRING = `
🏋️‍ Gym Hardcore
🏋️‍ Gym Nightmare
🐵 Calisthenics
🐵 Calisthenics
🚲 Bike tempo|120
🚲 Bike long|240
🚲 Bike intervals
👟‍ Run|60
👟‍ Run|60
`

const INPUT_SUMMER = `
🏋️‍ Gym Hardcore
🐵 Calisthenics
🚲 Bike tempo|120
🚲 Bike long|240
🚲 Bike intervals
👟‍ Run|60
👟‍ Run|60
👟‍ Run
👟‍ Run
`

const INPUT_WINTER = `
🏋️‍ Gym Hardcore
🏋️‍ Gym Hardcore
🏋️‍ Gym Nightmare
🐵 Calisthenics
🚲 Bike tempo|120
🚲 Bike intervals
👟‍ Run|60
`

const items = INPUT_SPRING.trim().split("\n").map(line => line.trim())

const endOfWeek = dayjs().endOf("week").add(1, "day")
let cursorTime = endOfWeek.set("hour", 6).set("minute", 0).set("second", 0)

for (const item of items) {
  const [name, duration = DEFAULT_DURATION] = item.split("|")

  const startDate = cursorTime
  const endDate = cursorTime.add(parseInt(duration), "minutes")

  const startDateString = startDate.format("YYYY-MM-DD HH:mm:ss")
  const endDateString = endDate.format("YYYY-MM-DD HH:mm:ss")

  const appleScript = `
    to convertDate(textDate)
      set resultDate to the current date
      set the month of resultDate to (1 as integer)
      set the day of resultDate to (1 as integer)
      
      set the year of resultDate to (text 1 thru 4 of textDate)
      set the month of resultDate to (text 6 thru 7 of textDate)
      set the day of resultDate to (text 9 thru 10 of textDate)
      set the time of resultDate to 0
      
      if (length of textDate) > 10 then
        set the hours of resultDate to (text 12 thru 13 of textDate)
        set the minutes of resultDate to (text 15 thru 16 of textDate)
        
        if (length of textDate) > 16 then
          set the seconds of resultDate to (text 18 thru 19 of textDate)
        end if
      end if
      
      return resultDate
    end convertDate

    tell application "Calendar"
      set cal to first calendar whose name is "${CALENDAR}"
      set startDate to my convertDate("${startDateString}")
      set endDate to my convertDate("${endDateString}")
      make new event at cal with properties {summary:"${name}", start date:startDate, end date:endDate}
    end tell
  `

  const res = await runAppleScript(appleScript)
  console.log(res)

  cursorTime = endDate
}
