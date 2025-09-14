# PresentationML Slides - Properties - Fills, Outlines, Fonts, Effects

The formatting of presentations can be specified at many different places using a combination of styles and themes, as well as direct formatting which superseded those styles and themes. Themes specify properties such as the fill color properties of shapes, outline properties of shapes, fonts, and shape effects.

A theme (also called a shared style sheet) is found in a separate part in the package (within a theme subfolder). The theme that is applied to the presentation is specified within a relationship within the presentation.xml.rels file for the presentation. Multiple themes may be contained within a package, but only one is referenced within the presentation.xml.rels file. The structure of a theme is defined within the main drawingML specification. See [DrawingML - Styles](drwSp-styles.md) for more on the components of a theme.

Most of the content for a presentation is contained within shapes and pictures. Consequently, much of the styling for the slides is determined at the shape and picture level. The <p:style> element, which is a child of the shape element <p:sp>, specifies the styles to be applied to the shape. The style elements (<a:lnRef>, <a:fillRef>, <a:effectRef>, and <a:fontRef>) all reference corresponding theme elements with the index or idx attribute. For example, <a:fillRef idx="1"> within the <p:style> element of a shape references the first fill style defined within the <a:fillStyleLst> of the theme part.

The styles specified by the theme and referenced by a shape's <p:style> element may, of course, be overridden. These overrides are found within the properties element of the item in question. For example, to specify a background color that is different from one specified within the theme, a fill element would be placed within the <p:spPr> element for the shape. In the example below, a solid fill is specified using RGB values (45D768), highlighted in red. To change the text color or font value, values would be set within the <a:rPr> element for the relevant run within the paragraph in the shape. In the example below, the font type and color styles have been overridden in the run properties element, shown in purple.

<p:sp>

. . .

<p:spPr>

. . .

<a:solidFill>

<a:srgbClr val="45D768"/>

</a:solidFill>

</p:spPr>

<p:style>

<a:lnRef idx="2">

<a:schemeClr val="accent1">

<a:shade val="50000"/>

</a:schemeClr>

</a:lnRef>

<a:fillRef idx="1">

<a:schemeClr val="accent1"/>

</a:fillRef>

<a:effectRef idx="0">

<a:schemeClr val="accent1"/>

</a:effectRef>

<a:fontRef idx="minor">

<a:schemeClr val="lt1"/>

</a:fontRef>

</p:style>

<p:txBody>

<a:bodyPr rtlCol="0" anchor="ctr"/>

<a:lstStyle/>

<a:p>

<a:pPr algn="ctr"/>

<a:r/>

<a:rPr lang="en-US" dirty="0" smtClean="0">

<a:solidFill>

<a:srgbClr val="B9477B"/>

</a:solidFill>

<a:latin typeface="Arial Black" pitchFamily="34" charset="0"/>

</a:rPr>

<a:t>This shape has a custom fill color.</a:t>

</a:r/>

</a:p>

</p:txBody>

![Slide styles - bgPr](pptxImages\ppSlide-styles1.gif)

The line, fill, and font styles as defined in the theme are shown in the context of the theme part below. (The effect style ref specifies an index of 0 (<a:effectRef idx="0"> attribute), so no effect style is used.)

<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Flow">

<a:themeElements>

<a:clrScheme name="Flow">

. . .

</a:clrScheme>

<a:fontScheme>

<a:majorFont>

. . .

</a:majorFont>

<a:minorFont>

. . .

</a:minorFont>

</a:fontScheme>

<a:fmtScheme>

<a:fillStyleLst>

. . .

</a:fillStyleLst>

<a:lnStyleLst>

. . .

</a:lnStyleLst>

<a:effectStyleLst>

. . .

</a:effectStyleLst>

<a:bgFillStyleLst>

. . .

</a:bgFillStyleLst>

</a:fmtScheme>

</a:themeElements>

. . .

</a:theme>

Footer
