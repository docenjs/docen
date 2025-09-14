# Wordprocessing Text

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Formatting

Run formatting is specified with elements within the <w:rPr> element.

<w:rPr>

<w:b w:val="true"/>

<w:u w:val="single"/>

</w:rPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.28.

![Sample text formatting](images\wp-text-formatting-1.gif)

---

Some of the most commonly used formatting elements are below. Other text formatting, such as spacing, shading, and borders, is covered in separate pages.

### Elements:

| Element | Description                                                                                                                                                                                           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| b       | Specifies that the text of the text run is to be bold: <w:b />. This is a toggle property. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.1.      |
| i       | Specifies that the text of the text run is to be italics: <w:i />. This is a toggle property. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.16.  |
| caps    | Specifies that any lowercase characters are to be displayed as their uppercase equivalents. It cannot appear with smallCaps in the same text run: <w:caps w:val="true" />. This is a toggle property. | ![caps](images\wp-caps-1.gif) |

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.5.

color | Specifies the color to be used to display text: <w:color w:val="FFFF00" /> Possible attributes are themeColor, themeShade, themeTint, and val. The val attribute specifies the color as a hex value in RRGGBB format, or auto may be specified to allow the consuming software to determine the color. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.6.  
dstrike | Specifies that the contents are to be displayed with two horizontal lines through each character: <w:dstrike w:val="true"/>. It cannot appear with strike in the same text run. This is a toggle property. | ![dstrike](images\wp-dstrike-1.gif)

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.37.

emboss | Specifies that the content should be displayed as if it were embossed, making text appear as if it is raised off of the page: <w:emboss w:val="true" />. This is a toggle property. | ![Embossed text](images\wp-embossedText-1.gif)

---

![](images/note.png) Note: The above example specifies emboss, but also sets the color to white: <w:emboss/><w:color w:val="FFFFFF"/>. That seems to be necessary else the result looks like imprint.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.13.

imprint | Specifies that the content should be displayed as it it were imprinted (or engraved) into the page: <w:imprint w:val="true"/>. This may not be present with either emboss or outline. This is a toggle property. | ![Embossed text](images\wp-imprint-1.gif)

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.18.

outline | Specifies that the content should be displayed as if it had an outline. A one-pixel border is drawn around the inside and outside borders of each character. <outline w:val="true"/>. This is a toggle property. | ![text outline](images\wp-outline-1.gif)

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.23.

rStyle | Specifies the style ID of the character style to be used to format the contents of the run. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.29.  
shadow | Specifies that the content should be displayed as if each character has a shadow: <w:shadow w:val="true"/>. For left-to-right text, the shadow is beneath the text and to its right. shadow may not be present with either emboss or imprint. This is a toggle property. | ![Embossed text](images\wp-textShadow-1.gif)

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.31.

smallCaps | Specifies that any lowercase characters are to be displayed as their uppercase equivalents in a font size two points smaller than the specified font size: <w:smallCaps w:val="true"/>. It cannot appear with caps in the same text run. This is a toggle property. | ![small caps](images\wp-smallCaps-1.gif)

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.33.

strike | Specifies that the contents are to be displayed with a horizontal line through the center of the line: <w:strike w:val="true"/>. It cannot appear with dstrike in the same text run. This is a toggle property. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.37.  
sz | Specifies the font size in half points: <w:sz w:val="28"/>. Note that szCs is used for complex script fonts such as Arabic. The single attribute val specifies a measurement in half-points (1/144 of an inch). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.38.  
u | Specifies that the content should be displayed with an underline: <w:u w:val="double"/>. The most common attributes are below (the theme-related attributed are omitted):

- color \- specifies the color for the underlining. Values are given as hex values (in RRGGBB format). No #, unlike hex values in HTML/CSS. E.g., color="FFFF00". A value of auto is also permitted and will allow the consuming word processor to determine the color based on the context.
- val \- Specifies the pattern to be used to create the underline. Possible values are:
  - dash \- a dashed line
  - dashDotDotHeavy \- a series of thick dash, dot, dot characters
  - dashDotHeavy \- a series of thick dash, dot characters
  - dashedHeavy \- a series of thick dashes
  - dashLong \- a series of long dashed characters
  - dashLongHeavy \- a series of thick, long, dashed characters
  - dotDash \- a series of dash, dot characters
  - dotDotDash \- a series of dash, dot, dot characters
  - dotted \- a series of dot characters
  - dottedHeavy \- a series of thick dot characters
  - double \- two lines
  - none \- no underline
  - single \- a single line
  - thick \- a single think line
  - wave \- a single wavy line
  - wavyDouble \- a pair of wavy lines
  - wavyHeavy \- a single thick wavy line
  - words \- a single line beneath all non-space characters

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.40.  
vanish | Specifies that the content is to be hidden from display at display time. <vanish/>. This is a toggle property. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.41.  
vertAlign | Subscript and superscript. <vertAlign w:val="superscript"/>. The single attribute is val. Permitted values are:

- baseline \- regular vertical positioning
- subscript \- lowers the text below the baseline and changes it to a small size
- superscript \- raises the text above the baseline and changes it to a smaller size

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.42.

---

# Related Open Document Format (ODF) Property:

In the OpenDocument format, formatting properties (even "manual" or direct styling) are stored in styles (<style:style>). The styles are stored in the same file as the content that references the style or in the separate file styles.xml. A style may contain a <style:text-properties> element, which stores the text properties of the style. The actual properties are stored as attributes of <style:text-properties>.

<style:style style:name="P1" style:family="paragraph" style:parent-style-name="Standard">

<style:text-properties fo:font-weight="bold" style:font-weight-asian="bold" style:font-weight-complex="bold"/>

</style:style>

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 16.27.28.

| Text Property         | ODF Implementation [attribute of <style:text-properties/>]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bold                  | fo:font-weight. Possible values are normal, bold, 100, 200, etc. through 900. E.g., <style:text-properties fo:font-weight="bold" . . ./>. Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 20.186.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| italics               | fo:font-style. Possible values are italic, normal, and oblique. E.g., <style:text-properties fo:font-style="italic" . . ./> Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 20.184.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| capitalization        | fo:text-transform. Possible values are none, lowercase, uppercase, and capitalize. E.g., <style:text-properties fo:text-transform="uppercase"/>. Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 20.220.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| color                 | fo:font-color. Possible values are in the form #rrggbb. E.g., <style:text-properties fo:font-color="#FF6600" . . ./> Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 20.180.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| strike through        | style:text-line-through-style. Possible values are none, dash, dot-dash, dot-dot-dash, dotted, long-dash, solid, and wave. E.g., <style:text-properties style:text-line-through-style="solid"/>. Other related attributes determine such properties as the color and width of the line. The accompanying style:text-line-through-type attribute can specify whether the line is single or double. E.g., the following will create a double strike through: <style:text-properties style:text-line-through-style="solid" style:text-line-through-type="double"/>. Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 20.363.                                                                                                                                                       |
| shadow                | fo:text-shadow. Possible values are none or those specified in the XSL 1.0 spec. at 7.16.5-- that is, a string consisting of two length values for the shadow offset plus an optional blur radius and optional color. E.g., <fo:text-shadow="1pt 1pt"/>. Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 20.219.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| small caps            | fo:font-variant. Possible values are normal or small-caps. E.g., <fo:font-variant="small-caps"/>. Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 20.185.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| size                  | fo:font-size. Values are either an absolute size or a percentage. E.g., <fo:font-size="18pt"/>. Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 20.183.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| underline             | style:text-underline-style. Possible values are none, dash, dot-dash, dot-dot-dash, dotted, long-dash, solid, and wave. E.g., <style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"/>. Other related attributes determine other properties of the underline. E.g., style:text-underline-color determines the color; style:text-underline-mode determines whether the underline applies to words or also to spaces between words; style:text-underline-type determines whether the underline is single or double; style:text-underline-with determines the width with possible values of auto, bold, thin, medium, thick, a percent, or a positive number. Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) §§ 20.378-382. |
| hidden                | text:display. Possible values are condition (text is displayed under the condition specified in the text:condition attribute), none, and true. E.g., <text:display="none"/>. Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 20.417.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| superscript/subscript | style:text-position. It may have one or two values separated by a space. The first specifies the vertical text position as a percentage of the current font height or it takes the value sub or super. Negative percentages place the text below the baseline. The second value, if present, specifies the font height as a percentage of the current font height. E.g., <style:text-position="super 58%"/>. Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 20.374.                                                                                                                                                                                                                                                                                                           |

---

# Related HTML/CSS Property:

font-weight:bold;  
font-style:italic;  
text-decoration:line-through;  
text-decoration:underline;  
text-transform:uppercase;  
font-size: 16px;  
color: #00FF00;  
text-shadow:2px 2px #FF0000; [not supported in IE]  
&ltsup>return&lt/sup> to &ltsub>share our life&lt/sub>  
visibility: hidden or display:none

CSS Example:

Then they start and tremble, they call us by our name, and as soon as we have recognized their voice the spell is broken. We have delivered them: they have overcome death and return to share our life. And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile.
