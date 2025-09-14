# WordprocessingText

Text Spacing and Kerning

There are a handful of text properties which affect text spacing. Each is applied with child elements within the <rPr> element. Other text formatting, such as bold, size, shading, and borders, is covered in separate pages.

![](images/note.png) Note: Whitespace in XML is not always preserved. As with any XML, to preserve spaces in OOXML, the space attribute must be set to preserve: <w:t xml:space="preserve">.

### Elements:

| Element | Description                                                                                                                                                                                                                                                                                                                              |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| spacing | Specifies the amount of character pitch to be added or removed after each character. <spacing w:val="200"/>. The single attribute is val. It specifies a positive or negative measurement in twentieths of a point (equivalent to 1/1440th of an inch). Compare spacing with the w property, which stretches or expanded each character. | ![spacing (character spacing adjustment)](images\wp-text-spacing-1.gif) |

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.35.

w | Specifies the amount to stretch or compress each character. <w w:val="200%"/>. The single attribute is val. Note the minimum value is 1% and the maximum is 600%. Compare w with the spacing property, which expands/compresses the text by adding additional character pitch but not changing the width of the characters. | ![character expansion or compression)](images\wp-w-1.gif)

---

![](images/versionConflict3.png) Note: The 2006 version specifies that the value of the val without a percent sign (%) [<w w:val="200"/>], but the 2011 version added the percent sign (%) [<w w:val="200%"/>]. Including the percent sign causes an error in Microsoft Word 2007.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.43.

kern | Specifies whether font kerning should be applied to the text. Kerning is the process of adjusting the spacing between characters in a proportional font. It moves the letters closer together. It is specified with the <w:kern> element. <w:rPr> <w:kern w:val="22"/> <w:sz w:val="28"/> </w:rPr> The single attribute is val. It specifies the smallest font size which will have kerning automatically adjusted. If the font size as specified by the sz element is smaller than the value specified by the val attribute, then no kerning will be applied. The attribute value is specified in half-points (1/144 of an inch). | ![text kerning](images\wp-text-kerning-1.gif)

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.19.

fitText | Specifies that the content is to be resized to fit the width specified by the val attribute rather than automatically displayed based on the width of the content. The expansion or contraction is performed by increasing or decreasing the size of each character. <fitText w:id="50" w:val="1440"/>. | ![fitText](images\wp-fitText-1.gif)

---

| Attribute | Description                                                                                                                                                                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id        | Specifies an id to be used to link multiple runs containing fitText elements. This enables multiple contiguous runs to be broken apart for differences in formatting while retaining their fitText property. If the runs are not contiguous, then the attribute is ignored. |
| val       | Specifies the width that the run must fit into, in twentieths of a point.                                                                                                                                                                                                   |

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.14.

### Related CSS property:

<div style="letter-spacing: 10px;">Then they start and tremble,</div>   
<div style="word-spacing: 10px;"> they call us by our name, and as soon as we have recognized their voice the spell</div>   
<div> is broken. We have delivered them;</div>   
<div style="max-width:50px">they have overcome death and return to share our life.</div>

CSS Example:

Then they start and tremble,

they call us by our name, and as soon as we have recognized their voice the spell

is broken. We have delivered them;

they have overcome death and return to share our life.
