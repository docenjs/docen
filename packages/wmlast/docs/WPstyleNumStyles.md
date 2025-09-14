# Wordprocessing Styles

Defining a Style - Numbering Styles

Numbering styles are different from other style types. In a sense, they are really only references to numbering properties defined within a numbering definition (abstractNum) within the numbering part. Numbering styles are not directly referenced by content -- they are only directly referenced by numbering definitions. See [Numbering - Overview](WPnumbering.md) and [Numbering - Defining an Overall Numbering Scheme](WPnumberingAbstractNum.md). Below is a sample numbering style.

<w:style w:type="numbering" w:styleId="TestNumberingStyle">

<w:name w:val="Test Numbering Style"/>

<w:pPr>

<w:numPr>

<w:numId w:val="1"/>

</w:numPr>

</w:pPr>

</w:style>

The style defines only a single paragraph property, which is a reference via the numPr element to a numbering definition. The numId within numPr refers to a numbering definition instance (num within the numbering part), which will in turn refer to another numbering definition which defines the actual properties for a multi-level format. Below is an example of how the style is referenced in the numbering part.

<w:abstractNum w:abstractNumId="0">

<w:multiLevelType w:val="multilevel"/>

<w:numStyleLink w:val="TestNumberingStyle"/>

</w:abstractNum>

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
