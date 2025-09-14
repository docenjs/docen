# Wordprocessing Paragraphs

Borders

Paragraph borders are defined with the <w:pBdr> element. Child elements of this element specify the kinds of border--left, right, bottom, top, and between.

<w:pPr>

<w:pBdr>

<w:top w:val="single" w:sz="24" w:space="1" w:color="FF0000" />

<w:bottom w:val="single" w:sz="24" w:space="1" w:color="FF0000" />

<w:left w:val="single" w:sz="24 w:space="1" w:color="0000FF" />

<w:right w:val="single" w:sz="24 w:space="1" w:color="0000FF" />

</w:pBdr>

</w:pPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.24.

Word 2007 Example:

![Simple Indent](images\wp-pBrd-1.gif)

---

### Elements:

| Element | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| top     | Specifies the border displayed above a set of paragraphs which have the same set of paragraph border settings. Note that if the adjoining paragraph has identical border settings and a between border is specified, a single between border will be used instead of the bottom border for the first and a top border for the second. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.42.                                            |
| bottom  | Specifies the border displayed below a set of paragraphs which have the same set of paragraph border settings. Note that if the adjoining paragraph has identical border settings and a between border is specified, a single between border will be used instead of the bottom border for the first and a top border for the second. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.7.                                             |
| left    | Specifies the border displayed to the left of the page around the paragraph, regardless of the paragraph direction. The border spans the length of the top or between border at the top and the bottom or between border at the bottom. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.17.                                                                                                                                          |
| right   | Specifies the border displayed to the right of the page around the paragraph, regardless of the paragraph direction. The border spans the length of the top or between border at the top and the bottom or between border at the bottom. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.28.                                                                                                                                         |
| between | Specifies the border between each paragraph in a set of paragraphs which have the same set of paragraph border settings. So if adjoining paragraphs have identical border settings, then there will be one border between them as specified by the between element. Otherwise the first paragraph will use its bottom border and the following paragraph will use its top border. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.5. |

### Attributes of child elements:

The most commonly used attributes are:

| Attribute | Description                                                                                                                                                                                                                                                                                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| color     | Specifies the color of the border. Values are given as hex values (in RRGGBB format). No #, unlike hex values in HTML/CSS. E.g., color="FFFF00". A value of auto is also permitted and will allow the consuming word processor to determine the color.                                                                                                                       |
| shadow    | Specifies whether the border should be modified to create the appearance of a shadow. For right and bottom borders, this is done by duplicating the border below and right of the normal location. For the right and top borders, this is done by moving the border down and to the right of the original location. Permitted values are true and false.                     |
| space     | Specifies the spacing offset. Values are specified in points (1/72nd of an inch).                                                                                                                                                                                                                                                                                            |
| sz        | Specifies the width of the border. Paragraph borders are line borders (see the val attribute below), and so the width is specified in eighths of a point, with a minimum value of two (1/4 of a point) and a maximum value of 96 (twelve points). (Page borders can alternatively be art borders, with the width is given in points and a minimum of 1 and a maximum of 31.) |
| val       | Specifies the style of the border. Paragraph borders can be only line borders. (Page borders can also be art borders.) Possible values are:                                                                                                                                                                                                                                  |

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

Word 2007 Example:

<w:pPr>

<w:pBdr>

<w:top w:val="single" w:sz="24" w:space="1" w:color="FF0000" />

<w:bottom w:val="single" w:sz="24" w:space="1" w:color="FF0000" />

<w:between w:val="single" w:sz="24" w:space="1" w:color="0000FF" />

</w:pBdr>

</w:pPr>

<w:pPr>

<w:pBdr>

<w:top w:val="single" w:sz="24" w:space="1" w:color="FF0000" />

<w:bottom w:val="single" w:sz="24" w:space="1" w:color="FF0000" />

<w:between w:val="single" w:sz="24" w:space="1" w:color="0000FF" />

</w:pBdr>

</w:pPr>

![Simple Indent](images\wp-pBrd-2.gif)

---

Another Word 2007 Example:

<w:pPr>

<w:pBdr>

<w:top w:val="double" w:sz="16" w:space="1" w:color="FF00FF" />

<w:bottom w:val="dotDotDash" w:sz="8" w:space="1" w:color="00FF00" />

</w:pBdr>

</w:pPr>

![Simple Indent](images\wp-pBrd-3.gif)

---

### Related CSS property:

border-top-width: 5px;  
border-top-style: solid;  
border-top-color: #0000FF;  
border-left-width: 10px;  
border-left-color: #000000;  
border-left-style: double;

CSS Example:

voice the spell is broken. We have delivered them: they have overcome death and return to share our life.

And so it is with our own past. It is a labour in vain to attempt to recapture it: all the efforts of our intellect must prove futile.

The past is hidden somewhere outside the realm, beyond the reach of intellect, in some material

Related Open Office (ODF) Property:

<w:pPr>

<w:pBdr>

<w:top w:val="single" w:sz="24" w:space="1" w:color="FF0000" />

<w:bottom w:val="single" w:sz="24" w:space="1" w:color="FF0000" />

<w:between w:val="single" w:sz="24" w:space="1" w:color="0000FF" />

</w:pBdr>

</w:pPr>
