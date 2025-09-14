# Wordprocessing Tables

Borders

Table borders are defined with the <w:tblBorders> element. Child elements of this element specify the kinds of border--bottom, end ('right' in the previous version of the standard), insideH, insideV, start ('left' in the previous version of the standard), and top.

<w:tblPr>

<w:tblBorders>

<w:top w:val="single" w:sz="12" w:space="0" w:color="FF0000" />

<w:start w:val="single" w:sz="24" w:space="0" w:color="00FF00" />

<w:bottom w:val="single" w:sz="12" w:space="0" w:color="0000FF" />

<w:end w:val="single" w:sz="24" w:space="0" w:color="000000" />

<w:insideH w:val="single" w:sz="24" w:space="0" w:color="CC0000" />

<w:insideV w:val="single" w:sz="24" w:space="0" w:color="666666" />

</w:tblBorders>

</w:tblPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.39.

Word 2007 Example:

![Table Borders](images\wp-tblBorders-1.gif)

---

### Elements:

| Element | Description                                                                                                                                                                                                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| top     | Specifies the border displayed at the top of a table. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.77.                                                                                                                                                          |
| bottom  | Specifies the border displayed at the bottom of a table. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.4.                                                                                                                                                        |
| start   | Specifies the border displayed to the left for left-to-right tables and right for right-to-left tables. ![](images/versionConflict3.png)Note: In the previous version of the standard, this element was left. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.37.  |
| end     | Specifies the border displayed on the right for left-to-right tables and left for right-to-left tables. ![](images/versionConflict3.png)Note: In the previous version of the standard, this element was right. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.13. |
| insideH | Specifies the border displayed on all inside horizontal table cell borders. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.23.                                                                                                                                    |
| insideV | Specifies the border displayed on all inside vertical table cell borders. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.25.                                                                                                                                      |

The display of table borders is subject to conflict resolution with the table row and cell border definitions. See [Table Border Conflicts](WPtableCellBorderConflicts.md) and [tcBorders](WPtcBorders.md).

### Attributes of child elements:

The most commonly used attributes are below. (The theme-related and frame attributes have been omitted.)

| Attribute | Description                                                                                                                                                                                                                                                                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| color     | Specifies the color of the border. Values are given as hex values (in RRGGBB format). No #, unlike hex values in HTML/CSS. E.g., color="FFFF00". A value of auto is also permitted and will allow the consuming word processor to determine the color.                                                                                                                   |
| shadow    | Specifies whether the border should be modified to create the appearance of a shadow. For right and bottom borders, this is done by duplicating the border below and right of the normal location. For the right and top borders, this is done by moving the border down and to the right of the original location. Permitted values are true and false.                 |
| space     | Specifies the spacing offset. Values are specified in points (1/72nd of an inch).                                                                                                                                                                                                                                                                                        |
| sz        | Specifies the width of the border. Table borders are line borders (see the val attribute below), and so the width is specified in eighths of a point, with a minimum value of two (1/4 of a point) and a maximum value of 96 (twelve points). (Page borders can alternatively be art borders, with the width is given in points and a minimum of 1 and a maximum of 31.) |
| val       | Specifies the style of the border. Table borders can be only line borders. (Page borders can also be art borders.) Possible values are:                                                                                                                                                                                                                                  |

- single \- a single line
- dashDotStroked \- a line with a series of alternating thin and thick strokes
- dashed \- a dashed line
- dashSmallGap \- a dashed line with small gaps
- dotDash \- a line with alternating dots and dashes
- dotDotDash \- a line with a repeating dot - dot - dash sequence
- dotted \- a dotted line
- double \- a double line
- doubleWave \- a double wavy line
- inset \- an inset set of lines
- nil \- no border
- none \- no border
- outset \- an outset set of lines
- thick \- a single line
- thickThinLargeGap \- a thick line contained within a thin line with a large-sized intermediate gap
- thickThinMediumGap \- a thick line contained within a thin line with a medium-sized intermediate gap
- thickThinSmallGap \- a thick line contained within a thin line with a small intermediate gap
- thinThickLargeGap \- a thin line contained within a thick line with a large-sized intermediate gap
- thinThickMediumGap \- a thick line contained within a thin line with a medium-sized intermediate gap
- thinThickSmallGap \- a thick line contained within a thin line with a small intermediate gap
- thinThickThinLargeGap \- a thin-thick-thin line with a large gap
- thinThickThinMediumGap \- a thin-thick-thin line with a medium gap
- thinThickThinSmallGap \- a thin-thick-thin line with a small gap
- threeDEmboss \- a three-staged gradient line, getting darker towards the paragraph
- threeDEngrave \- a three-staged gradient like, getting darker away from the paragraph
- triple \- a triple line
- wave \- a wavy line

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.18.2.

### Related CSS property:

border-collapse:collapse;  
border-bottom:4px dashed #0000FF;  
border-top:6px double #FF0000;  
border-left:5px solid #00FF00;  
border-right:5px solid #666666;

CSS Example:

| AAA | BBB | CCC |
| --- | --- | --- |
| EEE | FFF | DDD |
