# Wordprocessing Sections

Borders

Borders for each page of a section are defined with the <w:pgBorders> element. Child elements of this element specify the kinds of border--left, right, bottom, and top.

<w:pgBorders w:offsetFrom="page">

<w:top w:val="double" w:sz="4" w:space="24" w:color="C00000"/>

<w:bottom w:val="double" w:sz="4" w:space="24" w:color="C00000"/>

<w:left w:val="single" w:sz="8" w:space="24" w:color="548DD4"/>

<w:right w:val="single" w:sz="8" w:space="24" w:color="548DD4"/>

</w:pgBorders>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.6.10.

Word 2007 Example:

![Section Page Borders](images\wp-section-pgBorders-1.gif)

---

### Attributes

| Element | Description                                                          |
| ------- | -------------------------------------------------------------------- |
| display | Specifies on which pages to display the border. Possible values are: |

- allPages
- firstPage
- notFirstPage

offsetFrom | Specifies how the relative positioning of the borders should be calculated. Possible values are:

- page - the space attribute on each border is interpreted as the distance from the edge of the page that should be left before the page border
- text - the space attribute on each border is interpreted as the distance from the text margins that should be left before the page border

zOrder | Specifies whether the page border is positioned above or below intersecting text and objects. Possible values are:

- back \- the page border is to be rendered beneath any text
- front \- the page border is to be rendered above any text

### Elements:

| Element | Description                                                                                                                                                                            |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| top     | Specifies the border for the top of the page for each page in the section. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.6.21.        |
| bottom  | Specifies the border for the bottom of the page for each page in the section. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.6.2.      |
| left    | Specifies the border for the left side of the page for each page in the section. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.6.7.   |
| right   | Specifies the border for the right side of the page for each page in the section. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.6.15. |

### Attributes of child elements:

The most commonly used attributes are below (theme-related attributes are omitted):

| Attribute | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| color     | Specifies the color of the border. Values are given as hex values (in RRGGBB format). No #, unlike hex values in HTML/CSS. E.g., color="FFFF00". A value of auto is also permitted and will allow the consuming word processor to determine the color.                                                                                                                                                                                                                                                                                                                                                                       |
| id        | Used to define a customer border image. It specifies the relationship ID for the relationship that contains the border image. The image is contained within a separate part of the package. E.g., <w:bottom w:val="custom" r:id="rIdCustomBottomBorder" . . ./>. The relationship with ID of rIdCustomBottomBorder must contain the image. Note that the relationship targeted by the attribute must be of type http://purl.oclc.org/ooxml/officeDocument/relationships/image or the document will be non-conformant. ![](images/versionConflict3.png)Note: Earlier versions of the standard did not support this attribute. |
| shadow    | Specifies whether the border should be modified to create the appearance of a shadow. For right and bottom borders, this is done by duplicating the border below and right of the normal location. For the right and top borders, this is done by moving the border down and to the right of the original location. Permitted values are true and false.                                                                                                                                                                                                                                                                     |
| space     | Specifies the spacing offset. Values are specified in points (1/72nd of an inch).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| sz        | Specifies the width of the border. If the border is a line border, the size is specified in eights of a point, with a minimum value of two (1/4 of a point) and a maximum value of 96 (twelve points). If the border is an art border, the width is given in points and a minimum of 1 and a maximum of 31.                                                                                                                                                                                                                                                                                                                  |
| val       | Specifies the style of the border. Page borders can be line borders or art borders. Possible line border values are:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

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

For the possible art borders, see the specification at ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.18.2.

### Related HTML/CSS property:

HTML has no notion of pages, and so no page borders. See the discussion of [paragraph borders](WPborders.md).
