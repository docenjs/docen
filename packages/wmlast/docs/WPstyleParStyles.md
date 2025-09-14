# Wordprocessing Styles

Defining a Style - Paragraph Styles

Paragraph styles apply to the contents of an entire paragraph as well as to the paragraph mark. They can apply to both character properties for text within the paragraph as well as paragraph properties related to positioning and appearance of the paragraph. (So the style element can have both a rPr element and a pPr element.) They have a type attribute value of paragraph. They are referenced by the <w:pStyle> element within a paragraph's properties element (<w:pPr>). Finally, unlike character styles, paragraph styles can specify the style to be used for paragraphs following the current paragraph (using the <w:next> element).

<w:style w:type="paragraph" w:styleId="TestParagraphStyle">

<w:name w:val="Test Paragraph Style"/>

<w:pPr>

<w:spacing w:line="480" w:lineRule="auto"/>

<w:ind w:firstLine="1440"/>

</w:pPr>

<w:rPr>

<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/>

<w:color w:val="FFF200"/>

<w:sz w:val="40"/>

</w:rPr>

</w:style>

The above paragraph style is then applied in content as shown below.

<w:p>

<w:pPr>

<w:pStyle w:val="TestParagraphStyle"/>

</w:pPr>

<w:r>

<w:t xml:space="preserve">This text is styled</w:t>

</w:r>

</w:p>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.7.8.

### Child Elements of Paragraph Styles (<w:style w:type="paragraph">):

| Element | Description                                                                                                                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| rPr     | For the details of the run and paragraph properties that are specified within rPr and pPr of a paragraph style, see [Text - Formatting](WPtextFormatting.md) and [Paragraphs - Properties](WPparagraphProperties.md). |

### Related HTML/CSS property:

Below is a style definition for a paragraph that might appear in an external stylesheet.

.myParagraphStyle {

margin:5px 5px;

border-color:#000000;

background-color:#FF6699

padding: 10px;

border-style:dotted;

border-width:2px;

}

The style is then applied as shown below.

<div class="myparagraphStyle">This is a styled paragraph.</div>

HTML/CSS Example:

This is a styled paragraph.
