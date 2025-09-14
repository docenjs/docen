# Wordprocessing Tables

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Cell Properties - Borders

Cell borders are specified with the <tcBorders> element within <w:tcPr/>. Eight different borders can be specified as child elements.

![](images/note.png)Note: The actual appearance of cell borders depends upon factors such as cell spacing for the table. If the [tblCellSpacing](WPtableCellSpacing.md) value is non-zero, then the cell border will always be displayed. Otherwise, the display of the border is subject to a conflict resolution algorithm. See [Table Border Conflicts](WPtableCellBorderConflicts.md).

<w:tcPr>

<w:tcBorders>

<w:top w:val="double" w:sz="24" w:space="0" w:color="FF0000">

<w:start w:val="double" w:sz="24" w:space="0" w:color="FF0000">

<w:bottom w:val="double" w:sz="24" w:space="0" w:color="FF0000">

<w:end w:val="double" w:sz="24" w:space="0" w:color="FF0000">

<w:tl2br w:val="double" w:sz="24" w:space="0" w:color="FF0000">

</w:tcBorders>

<w:tcPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.67.

![Sample table cell borders](images\wp-tableCellBorders-1.gif)

---

### Elements:

| Element | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| top     | Specifies the border displayed at the top of the cell. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.75.                                                                                                                                                                                                                                                                                                                                                                           |
| bottom  | Specifies the border displayed at the bottom of a cell. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.3.                                                                                                                                                                                                                                                                                                                                                                           |
| start   | Specifies the border displayed on the leading edge of the cell (left for left-to-right tables and right for right-to-left tables). ![](images/versionConflict3.png)Note: In the previous version of the standard, this element was left. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.34.                                                                                                                                                                                         |
| end     | Specifies the border displayed on the trailing edge of the cell (right for left-to-right tables and left for right-to-left tables). ![](images/versionConflict3.png)Note: In the previous version of the standard, this element was right. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.12.                                                                                                                                                                                       |
| insideH | Specifies the border to be displayed on all interior horizontal edges of the cell. Note that this is mostly useless in the case of individual cells, as there is no concept of interior edge for individual cells. However, it is used to determine cell borders to apply to a specific group of cells as part of table conditional formatting in a table style, e.g., the inside edges on the set of cells in the first column. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.24. |
| insideV | Specifies the border to be displayed on all interior vertical edges of the cell. Note that this is mostly useless in the case of individual cells, as there is no concept of interior edge for individual cells. However, it is used to determine cell borders to apply to a specific group of cells as part of table conditional formatting in a table style, e.g., the inside edges on the set of cells in the first column. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.26.   |
| tl2br   | Specifies the border to be displayed on the top left side to bottom right diagonal within the cell. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.74.                                                                                                                                                                                                                                                                                                                              | ![Sample table cell diagonal border](images\wp-tableCellBorders-2.gif) |

---

tr2bl | Specifies the border to be displayed on the top right to bottom left diagonal within the cell. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.80.

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

---

# Related Open Document Format (ODF) Property:

Cell borders can be set by adding the fo:border, fo:border-bottom, fo:border-left, fo:border-right, and fo:border-top attributes to the <style:table-cell-properties> element for the style applied to the cell. Note that for double borders, there are additional attributes of <style:table-cell-properties>, such as style:border-line-width-bottom, etc., that enable the setting of widths for the inner and outer lines, as well as the space between them.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) §§ 17.18, 20.176.2 - 20.176.6 .

<style:style style:name="Table1.A1" style:family="table-cell">

<style:table-cell-properties fo:border-left="0.12in solid #6666FF" fo:border-right="0.12in solid #6666FF" fo:border-top="none" fo:border-bottom="none"/>

<style:background-image/>

</style:table-cell-properties>

</style:style>

# Related HTML/CSS Property:

Note that HTML rows cannot have borders--only tables and cells.

<table style="width: 100%; height:50px; border-collapse:separate; border-spacing:10px; empty-cells:show;">

<tr>

<td>style="border-bottom:1px double #FF00FF; border-top:1px dashed #FFFF00; border-left:2px solid #FF0000; border-right:2px groove #CCCC00;">AAA</td>

<td>style="border-bottom:3px dotted #00FF66; border-top:3px double #FF00FF; border-left:2px solid #FF0000; border-right:2px outset #9933FF;">BBB</td>

. . .

</tr>

. . .

</table>

CSS Example:

| AAA | BBB | CCC |
| --- | --- | --- |
| EEE | FFF | DDD |
