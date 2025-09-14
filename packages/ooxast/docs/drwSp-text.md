# DrawingML Shapes

Text

Text to be contained within a shape is specified with a <p:txBody> or <xdr:txBody> element, which is a child element of <p:sp> or <xdr:sp>, respectively. Note that it is within the spreadsheetDrawing (prefix 'xdr') or main presentation namespace (prefix p), not in the main drawingML namespace (prefix 'a'). However, its child elements are within the main drawingML namespace.

There are three components of text within a shape, corresponding to the three child elements:

1. <a:bodyPr> \- the body properties. [ Shapes - Text - Body Properties](drwSp-text-bodyPr.md).
2. <a:lstStyle> \- the text list properties, if any. [Shapes - Text - List Properties](drwSp-text-lstPr.md)
3. <a:p> \- one or more text paragraphs. See [ Shapes - Text - Paragraphs](drwSp-text-paragraph.md).

Below is an example of a shape with text.

<p:sp macro="" textlink="">

. . .

<p:spPr>

. . .

</p:spPr>

<p:style>

. . .

</p:style>

<p:txBody>

<a:bodyPr vertOverflow="clip" rtlCol="0" anchor="ctr"/>

<a:lstStyle/>

<a:p>

<a:pPr algn="l"/>

<a:r>

<a:rPr lang="en-US" sz="1100">

. . .

</a:rPr>

<a:t>This is a paragraph of text within the shape.</a:t>

</a:r>

</a:p>

<a:p>

<a:pPr algn="ctr"/>

<a:r>

<a:rPr lang="en-US" sz="1100">

. . .

</a:rPr>

<a:t>This is the second paragraph.</a:t>

</a:r>

<a:endParaRPr lang="en-US" dirty="0">

. . .

</a:endParaRPr>

</a:p>

</p:txBody>

</p:sp>

![Shape with text in presentation](drwImages\drwSp-text1.gif)
