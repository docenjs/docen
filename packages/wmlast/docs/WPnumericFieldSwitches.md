# Wordprocessing Fields

Numeric Field Formatting

Numeric field formatting switches have the following format:

\\# _switch argument_

A numeric field switch argument is made up of a series of "picture items." The most commonly used are below. (Note that the [general formatting switches](WPgeneralFieldSwitches.md) also have formats that apply to numeric fields.)

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.4.2.

### Numeric Field Switch Picture Items:

| Picture Item | Description                                                                                                                                 | Examples                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| 0            | Specifies a numeric position to display.                                                                                                    | =4+5 \\# 00.00 displays "09.00".       |
| #            | Specifies a numeric position to display, and if the result doesn't include a digit in the position, a space is displayed.                   | =9+6 \\# $###  displays "$ 15".        |
| x            | Drops digits to the left of the x plaeholder. If the placeholder is to the right of the decimal point, the result is rounded to that place. | =111053+111439 \\# x## displays "492". |

=1/8 \\# 0.00x displays "0.125".  
=3/4 \\# .x displays ".8".  
. | Indicates the decimal point in US English. | =95.4 \\# $###.00  displays "$ 95.40".  
, | Separates groups of three digits. | =2456800 \\# $#,###,###  displays "$ 2,456,800".

- | Prepends a minus sign to a negative result, or prepends a space if the result is positive or 0. | =80-90 \\# -## displays "-10".  
  =90-80 \\# -## displays "10".

* | Prepends a plus sign to a positive result, a minus sign to a negative result, or a space if the result is 0. | =90-80 \\# +## displays "+10".  
  =80-90 \\# +## displays "-10".  
  Other characters | Includes the specified character in the position. | =33 \\# ##% displays "33%".  
  'text' | Includes text in the result. | =Price\*15% \\# "$##0.00 'is the sale tax' might display "$ 3.98 is the sales tax".  
  'numbered item' | Includes, in Arabic numerals, the number of the preceding item numbered as a caption. | =SUM(A1:D4) \\# "##.00 'is the total of Table' 'table'" displays "456.34 is the total of Table 2".  
  _positive result_ ; _negative result; zero result_ | Specifies different formats for positive and negative results. To also specify a format for a zero result, add another semi-colon-separated picture. | =Sales95 \\# "$#,##0.00; -$#,##.00; $0 displays, e.g., $5,320.00 for a positive value, -$5,320.00 for a negative value, and $0 for a zero value.
