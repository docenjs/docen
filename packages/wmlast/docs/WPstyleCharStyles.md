# Wordprocessing Styles

Defining a Style - Character Styles

Character styles apply to the contents of one or more runs of text. They have a type attribute value of character. They are referenced by the <w:rStyle> element within a run's properties element (<w:rPr>).

<w:style w:type="character" w:styleId="TestCharacterStyle">

<w:name w:val="Test Character Style"/>

<w:rPr>

<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/>

<w:color w:val="FFF200"/>

<w:u w:val="single"/>

</w:rPr>

</w:style>

The above character style is then applied in content as shown below.

<w:p>

<w:r>

<w:rPr>

<w:rStyle w:val="TestCharacterStyle"/>

</w:rPr>

<w:t xml:space="preserve">This text is styled</w:t>

</w:r>

</w:p>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.7.9.

### Child Elements of Character Styles (<w:style w:type="character">):

There is only one element.

| Element | Description                                                                                                                                                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| rPr     | For the details of the run or text properties that are specified within rPr, see [Text - Formatting](WPtextFormatting.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.7.9.1. |

Below is a style definition for text that might appear in an external stylesheet.

.myTextStyle {

font-size:18px;

color:#FF9900;

font-style:italic;

font-family:Verdana, Arial, Helvetica, sans-serif;

background-color:#999966

}

The style is then applied as shown below.

<div><span class="myTextStyle">This is styled text.</span></div>

HTML/CSS Example:

This is styled text.
