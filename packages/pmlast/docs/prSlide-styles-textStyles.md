# PresentationML Slides - Properties - Text and Notes Styles

## Text Styles

The formatting of text within a presentation is specified on the master slide, within a <p:txStyles> element, which is a child of <p:sldMaster>, the root element of the master slide. Within the <p:txStyles> element the styles for body text, title text, and other text are specified in corresponding child elements <p:bodyStyle>, <p:titleStyle>, and <p:otherStyle>. Each of these three main style types has the same model. Each may specify a set of default paragraph properties (within <a:defPPr>) which are applied when no other properties are specified, and each may specify list styles for levels 1 through 9 (<a:lvl1pPr> through <a:lvl9pPr>). Note that these are within the main drawingML namespace with prefix 'a'. A list of possible properties (sometimes specified as child elements and sometimes as attributes) of the levels and default properties is below, with links for more details at the related discussion of [list styles in drawingML](drwSp-text-lstPr.md).

## Notes Style

The formatting of text within a notes slide is specified on the notes master, within a <p:notesStyles> element, which is a child of <p:notesMaster>, the root element of the notes master. Within the <p:notesStyles> there may be a set of default paragraph properties (within <a:defPPr>) which are applied when no other properties are specified. There may also be a list of styles for levels 1 through 9 (<a:lvl1pPr> through <a:lvl9pPr>). Note that these are within the main drawingML namespace with prefix 'a'. A list of possible properties (sometimes specified as child elements and sometimes as attributes) of the levels and default properties is below, with links for more details at the related discussion of [list styles in drawingML](drwSp-text-lstPr.md).

| Element                                                       | Description                                                                             |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| <a:buAutoNum/> (auto-numbering bullet)                        | See [DrawingML - Bullets and Numbering](drwSp-text-paraProps-numbering.md).             |
| <a:buBlip> (picture bullet)                                   | See [DrawingML - Bullets and Numbering](drwSp-text-paraProps-numbering.md).             |
| <a:buChar/> (character bullet)                                | See [DrawingML - Bullets and Numbering](drwSp-text-paraProps-numbering.md).             |
| <a:buClr> (color of bullets)                                  | See [DrawingML - Bullets and Numbering](drwSp-text-paraProps-numbering.md).             |
| <a:buClrTx> (color of bullets is same as text run)            | See [DrawingML - Bullets and Numbering](drwSp-text-paraProps-numbering.md).             |
| <a:buFont/> (font for bullets)                                | See [DrawingML - Bullets and Numbering](drwSp-text-paraProps-numbering.md).             |
| <a:buFontTx> (font for bullets is same as text run)           | See [DrawingML - Bullets and Numbering](drwSp-text-paraProps-numbering.md).             |
| <a:buNone> (no bullet)                                        | See [DrawingML - Bullets and Numbering](drwSp-text-paraProps-numbering.md).             |
| <a:buSzPct> (size in percentage of bullet characters)         | See [DrawingML - Bullets and Numbering](drwSp-text-paraProps-numbering.md).             |
| <a:buSzPts/> (size in points of bullet characters)            | See [DrawingML - Bullets and Numbering](drwSp-text-paraProps-numbering.md).             |
| <a:buSzTx> (size of bullet characters to be size of text run) | See [DrawingML - Bullets and Numbering](drwSp-text-paraProps-numbering.md).             |
| <a:defRPr> (default text run properties)                      | See [DrawingML - List Properties and Default Style](drwSp-text-lstPr.md).               |
| <a:lnSpc> (line spacing)                                      | See [DrawingML - Text - Spacing, Indents and Margins](drwSp-text-paraProps-margins.md). |
| <a:spcAft> (spacing after the paragraph)                      | See [DrawingML - Text - Spacing, Indents and Margins](drwSp-text-paraProps-margins.md). |
| <a:spcBef> (spacing before the paragraph)                     | See [DrawingML - Text - Spacing, Indents and Margins](drwSp-text-paraProps-margins.md). |
| <a:tabLst> (list of tab stops in a paragraph)                 | See [DrawingML - Text - Alignment, Tabs, Other](drwSp-text-paraProps-align.md).         |

| Attribute                                                                                            | Description                                                                             |
| ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| algn (alignment)                                                                                     | See [DrawingML - Text - Alignment, Tabs, Other](drwSp-text-paraProps-align.md).         |
| defTabSz (default tab size)                                                                          | See [DrawingML - Text - Alignment, Tabs, Other](drwSp-text-paraProps-align.md).         |
| fontAlgn (font alignment)                                                                            | See [DrawingML - Text - Alignment, Tabs, Other](drwSp-text-paraProps-align.md).         |
| hangingPunct (specifies the handling of hanging text)                                                | See [DrawingML - Text - Alignment, Tabs, Other](drwSp-text-paraProps-align.md).         |
| indent (indentation for the first line of text)                                                      | See [DrawingML - Text - Spacing, Indents and Margins](drwSp-text-paraProps-margins.md). |
| latinLnBrk (specifies whether to break words)                                                        | See [DrawingML - Text - Alignment, Tabs, Other](drwSp-text-paraProps-align.md).         |
| lvl (the level of the text -- only applicable for <a:defPPr>; values are 0 to 8 for the nine levels) | See [DrawingML - List Properties and Default Style](drwSp-text-lstPr.md).               |
| marL and marR (left and right margins)                                                               | See [DrawingML - Text - Spacing, Indents and Margins](drwSp-text-paraProps-margins.md). |

Below is sample xml from a master slide. Note the right alignment (highlighted in red) for the second-level text (lvl="1"). The xml for the actual slide has some styling overrides on the second level-2 bullet (with text "Second level 2 bullet"). See the discussion that follows regarding style overrides.

<p:sldMaster . . . >

<p:cSld>

. . .

<p:spTree>

. . .

<p:sp>

<p:nvSpPr>

<p:cNvPr id="3" name="Text Placeholder 2"/>

. . .

<p:nvPr>

<p:ph type="body" idx="1"/>

</p:nvPr>

</p:nvSpPr>

<p:spPr>

. . .

</p:spPr>

<p:txBody>

<a:bodyPr . . .>

. . .

</a:bodyPr>

<a:lstStyle/>

<a:p>

<a:pPr lvl="0"/>

. . .

</a:p>

<a:p>

<a:pPr lvl="1"/>

. . .

</a:p>

. . .

<p:txBody>

. . .

</p:sp>

. . .

</p:spTree>

</p:cSld>

<p:clrMap . . ./>

<p:sldLayoutIdLst>

. . .

</p:sldLayoutIdLst>

<p:txStyles>

<p:titleStyle>

. . .

<p:titleStyle>

<p:bodyStyle>

. . .

<a:lvl2pPr marL=""868680" indent="-283464" algn="r" rtl="0" ealnBrk="1" latinLnBrk="0" hangingPunct="1" >

<a:spcBef>

<a:spcPct val="20000"/>

</a:spcBef>

<a:buClr>

<a:schemeClr val="tx1"/>

</a:buClr>

<a:buSzPct val="80000"/>

<a:buFont typeface="Wingdings2"/>

<a:buChar char="•"/>

<a:defRPr sz="2400" kern="1200">

. . .

</a:defRPr>

</a:lvl2pPr>

<p:bodyStyle>

<p:otherStyle>

. . .

<p:otherStyle>

</p:txStyles>

</p:sldMaster>

![Slide text styles](pptxImages\ppSlide-textStyles1.gif)

## Overriding Styles for a Shape

The styles defined within the <p:txStyles> element of the master slide can, of course, be overrriden by specifying different styles for the shape, either within the shape of the master slide or slide layout, or within the shape within a particular slide. For example, below we have specified a style for the level 2 text within the shape on the slide, altering the style from right-aligned to centered.

<p:sld . . . >

<p:cSld>

<p:spTree>

. . .

<p:sp>

<p:nvSpPr>

<p:cNvPr id="3" name="Content Placeholder 2"/>

. . .

<p:nvPr>

<p:ph idx="1"/>

</p:nvPr>

</p:nvSpPr>

<p:spPr/>

<p:txBody>

<a:bodyPr/>

<a:lstStyle>

<a:lvl2pPr marL=""868680" indent="-283464" algn="ctr" rtl="0" ealnBrk="1" latinLnBrk="0" hangingPunct="1" >

<a:spcBef>

<a:spcPct val="20000"/>

</a:spcBef>

<a:buClr>

<a:schemeClr val="tx1"/>

</a:buClr>

<a:buSzPct val="80000"/>

<a:buFont typeface="Wingdings2"/>

<a:buChar char="•"/>

<a:defRPr sz="2400" kern="1200">

. . .

</a:defRPr>

</a:lvl2pPr>

</a:lstStyle>

. . .

</p:txBody>

</p:sp>

. . .

</p:spTree>

</p:cSld>

</p:sld>

![Slide text styles - override at shape level](pptxImages\ppSlide-textStyles2.gif)

## Overriding Styles for a Paragraph Within a Shape

The styles specified at the master slide level, or even for a particular slide within a presentation slide, can themselves be overridden by specifiying different styling within the paragraph or run properties of a paragraph of text within a shape. Below is the same sample above, except that a paragraph property of left alignment is specified for the first of the second-level paragraphs. Note that the second of the level-2 paragraphs does not override the paragraph alignment as specified for the shape, but it does override the bullet font and bullet character.

<p:sld . . . >

<p:cSld>

<p:spTree>

. . .

<p:sp>

. . .

<p:cNvPr id="3" name="Content Placeholder 2"/>

. . .

<a:lstStyle>

<a:lvl2pPr marL=""868680" indent="-283464" algn="ctr" rtl="0" ealnBrk="1" latinLnBrk="0" hangingPunct="1" >

<a:spcBef>

<a:spcPct val="20000"/>

</a:spcBef>

<a:buClr>

<a:schemeClr val="tx1"/>

</a:buClr>

<a:buSzPct val="80000"/>

<a:buFont typeface="Wingdings2"/>

<a:buChar char="•"/>

<a:defRPr sz="2400" kern="1200">

. . .

</a:defRPr>

</a:lvl2pPr>

</a:lstStyle>

<a:p>

<a:r>

<a:rPr lang="en-US"/>

<a:t>Some bulleted text here</a:t>

</a:r>

</a:p>

<a:p>

<a:pPr lvl="1" algn="l"/>

<a:r>

<a:rPr lang="en-US"/>

<a:t>And more text</a:t>

</a:r>

</a:p>

<a:p>

<a:pPr lvl="1">

<a:buFont typeface="Wingdings" pitchFamily="2" charset="2"/>

<a:buChar char="F0D8"/>

</a:pPr lvl="1">

<a:r>

<a:rPr lang="en-US"/>

<a:t>Second level 2 bullet</a:t>

</a:r>

</a:p>

</p:txBody>

. . .

</p:sp>

. . .

</p:spTree>

</p:cSld>

</p:sld>

![Slide text styles - override at paragraph](pptxImages\ppSlide-textStyles3.gif)

Footer
