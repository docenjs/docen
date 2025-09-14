# Wordprocessing Styles

Defining Default Formatting

A default set of properties which are inherited by every paragraph and run within the document may be specified with the docDefaults within the styles root element of the styles part. These default properties will define the formatting unless they are overridden by other styles or by direct formatting. Note that if the docDefaults is not specified, then the application can define defaults.

<w:docDefaults>

<w:rPrDefault>

<w:rPr>

<w:b/>

</w:rPr>

</w:rPrDefault>

<w:pPrDefault/>

<w:pPr>

<w:jc w:val="center"/>

</w:pPr>

</w:pPrDefault>

</w:docDefaults>

The above default style specifies a default paragraph property of centered text and a default run property of bold text.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.7.5.

### Child Elements:

| Element    | Description                                                                                                                                                                                                                                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pPrDefault | Specifies a set of default paragraph properties. The actual properties are stored within a child pPr element. See [Paragraphs - Properties](WPparagraphProperties.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.7.5.3. |
| rPrDefault | Specifies a set of default run properties. The actual properties are stored within a child rPr element. See [Text - Formatting](WPtextFormatting.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.7.5.4.                  |

### Related HTML/CSS property:

<ol>

<li style="list-style-type:upper-roman;">This is the first level.</li>

<li style="list-style-type:upper-alpha; margin-left:2cm;">This is the second level.</li>

<li style="list-style-type:decimal; margin-left:4cm;">This is the third level.</li>

</ol>

HTML/CSS Example:

1. This is the first level.
2. This is the second level.
3. This is the third level.
