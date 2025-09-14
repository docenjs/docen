# Wordprocessing Fields

Date and Time Field Formatting

Date and time field formatting switches have the following format:

\@ _switch argument_

A date and time field switch argument is made up of a series of "picture items." The most commonly used are below.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.4.1.

### Date and Time Field Switch Picture Items:

| Picture Item    | Description                                                                                                                                               |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| d               | Formats the day of the week or day of the month as a number without a leading zero for single-digit days.                                                 |
| dd              | Formats the day of the month as a two-digit number with a leading zero for single-digit days.                                                             |
| ddd             | Formats the day of the week in its abbreviated form according to the language specified by the lang element on the run containing the field instructions. |
| dddd            | Formats the day of the week as its full name according to the language specified by the lang element on the run containing the field instructions.        |
| M               | Formats the month as a number without a leading zero for single-digit months.                                                                             |
| MM              | Formats the month as a number with a leading zero for single-digit months.                                                                                |
| MMM             | Formats the month in its abbreviated form according to the language specified by the lang element on the run containing the field instructions.           |
| MMMM            | Formats the month as its full name according to the language specified by the lang element on the run containing the field instructions.                  |
| W               | Formats the day of the week in an abbreviated form according to the language specified by the lang element on the run containing the field instructions.  |
| yy              | Formats the year as a 2-digit number.                                                                                                                     |
| yyyy            | Formats the year as a 4-digit number.                                                                                                                     |
| hor H           | Formats the hour on a 12-hour clock without a leading zero for single-digit hours.                                                                        |
| hh              | Formats the hour on a 12-hour clock with a leading zero for single-digit hours.                                                                           |
| H               | Formats the hour on a 24-hour clock without a leading zero for single-digit hours.                                                                        |
| HH              | Formats the hour on a 24-hour clock with a leading zero for single-digit hours.                                                                           |
| m               | Formats the minutes without a leading zero for single-digit minutes.                                                                                      |
| mm              | Formats the minutes with a leading zero for single-digit minutes.                                                                                         |
| s               | Formats the seconds without a leading zero for single-digit minutes.                                                                                      |
| ss              | Formats the minutes as a two-digit number with a leading zero for single-digit seconds.                                                                   |
| am/pm or AM/PM  | Formats the uppercase 12-hour clock indicators according to the language specified by the lang element on the run containing the field instructions.      |
| Other character | Includes the specified character in the result at that position. E.g., colon (:), hyphen (-), slash (/), and space.                                       |
| 'text'          | Includes _text_ in the result.                                                                                                                            |

Below are some examples of date and time for US-English.

### Date and Time Switch Examples:

| Switch                           | Result                    |
| -------------------------------- | ------------------------- |
| DATE \@ "M/d/yyyy"               | 1/3/2006                  |
| DATE \@ "dddd, MMMM dd, yyyy"    | Tuesday, January 03, 2006 |
| DATE \@ "MMMM d, yyyy"           | January 3, 2006           |
| DATE \@ "M/d/yy"                 | 1/3/06                    |
| DATE \@ "yyyy-MM-dd"             | 2006-01-03                |
| DATE \@ "d-MMM-yy"               | 3-Jan-06                  |
| DATE \@ "M.d.yyyy"               | 1.3.2006                  |
| DATE \@ "MMM. d, yy"             | Jan. 3, 06                |
| DATE \@ "d MMMM yyyy"            | 3 January 2006            |
| DATE \@ "MMMM yy"                | January 06                |
| DATE \@ "M/d/yyyy h:mm am/pm"    | 1/3/2006 5:28 PM          |
| DATE \@ "M/d/yyyy h:mm:ss am/pm" | 1/3/2006 5:28:34 PM       |
| DATE \@ "h:mm am/pm"             | 5:28 PM                   |
| DATE \@ "h:mm am/pm"             | 5:28:34 PM                |
| DATE \@ "HH:mm"                  | 17:28                     |
| DATE \@ "'Today is 'HH:mm:ss"    | Today is 17:28:34         |
