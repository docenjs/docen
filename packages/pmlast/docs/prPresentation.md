# PresentationML Presentation

The <p:presentation> element is the root element of the main content start part for the presentation (presentation.xml within the ppt folder of the package for Microsoft Powerpoint). It is in the main presentation namespace: xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main". It contains the specification of the various slides that comprise the presentation, as well as some presentation-wide properties.

<p:presentation . . . saveSubsetFonts="1">

<p:sldMasterIdLst>

. . .

</p:sldMasterIdLst>

<p:notesMasterIdLst>

. . .

</p:notesMasterIdLst>

<p:handoutMasterIdLst>

. . .

</p:handoutMasterIdLst>

<p:handoutMasterIdLst>

. . .

</p:handoutMasterIdLst>

<p:sldIdLst>

. . .

</p:sldIdLst>

<p:sldSz cx="9144000" cy="6858000" type="screen4x3"/>

<p:notesSz cx="6858000" cy="9144000" type="screen4x3"/>

<p:defaultTextStyle>

. . .

</p:defaultTextStyle>

</p:presentation>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference §§ 17.2.3.

### Elements:

Below are the most commonly used child elements of <p:presentation>.

| Element                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <p:custShowLst>        | By default a presentation show displays all of the slides in the presentation in the order specified in the <p:sldIdLst> element. However, it is possible to create one or more custom shows in which you can specify a different order and subset of the available slides. Custom shows are specified in this element.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| <p:defaultTextStyle>   | A default text style for the presentation is specified with this element. The default style is relevant when a new slide is added that is not associated with a master slide or if no styling information is specified for the text. This element can specify both a default paragraph style within a child <a:defPPr> and list level styles within child elements <a:lvl1pPr> through <a:lvl9pPr>. See [Shapes - Text - List Properties and Default Styles](drwSp-text-lstPr.md) for details of these default style properties. Note that the default paragraph and list style elements are within the main drawingML namespace, while the parent <p:defaultTextStyle> is within the main presentationML namespace. Below is an example of a default paragraph style with bolding and a first level (lvl="0") list numbering style beginning at 'B'. <p:presentation . . . > . . . <p:defaultTextStyle> <a:defPPr> <a:defRPr b="1"/> </a:defPPr> <a:lvl1pPr> <a:defRPr b="1"/> <a:lvl1pPr algn="r"> <a:buAutoNum type="alphaUcPeriod" startAt="2"/> </a:lvl1pPr> </p:defaultTextStyle> </p:presentation>                                                                           |
| <p:embeddedFontLst>    | A list of the embedded fonts within the presentation is listed within an embeddedfont list <p:embeddedFontLst>. Each font is specified as a <p:embeddedFont> element within the list. The actual font data for the fonts is stored within the document package (typically within a ppt/fonts folder) and is referenced by the <p:embeddedFont> element. The references are within the presentation.xml.rels part. Below is an example of a font with four versions--regular, bold, italic, and bold italic. <p:presentation . . . > . . . <p:embeddedFontLst> <p:font typeface="MyFont" pitchfamily="34" charset="0"/> <p:regular r:id="rId3"/> <p:bold r:id="rId4"/> <p:italic r:id="rId5"/> <p:boldItalic r:id="rId6"/> </p:embeddedFontLst> . . . </p:presentation> The regular font above references the rId3 relationship. That relationship within the .rels part for the presentation looks like this: <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="fonts/font1.fntdata"/>.                                                                                                                               |
| <p:handoutMasterIdLst> | A handout is a printed version of a presentation. The format and layout of the printed version is specified in a handout master. The handout master for the presentation is specified within this element, using the child element <p:handoutMasterId> which simply refers to a relationship within the .rels part for the presentation. <p:presentation . . . > . . . <p:handoutMasterIdLst> <p:handoutMasterId r:id="rId7"/> </p:handoutMasterIdLst> . . . </p:presentation> The handout master is referenced above using the relationship ID rId7. That relationship within the .rels part for the presentation looks like this: <Relationship Id="rId7" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/handoutMaster" Target="handoutMasters/handoutMaster1.xml"/>. The actual master is specified in that part (handoutMaster1.xml). See ???? for the details of the handout master.                                                                                                                                                                                                                                                                |
| <p:notesMasterIdLst>   | A note slide is a slide that is specifically designed for the printing of slides together with any attached notes. The format and layout of the notes slides is specified in a notes master. The notes master for the presentation is specified within this element, using the child element <p:notesMasterId> which simply refers to a relationship within the .rels part for the presentation. <p:presentation . . . > . . . <p:notesMasterIdLst> <p:notesMasterId r:id="rId6"/> </p:notesMasterIdLst> . . . </p:presentation> The notes master is referenced above using the relationship ID rId6. That relationship within the .rels part for the presentation looks like this: <Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesMaster" Target="notesMasters/notesMaster1.xml"/>. The actual master is specified in that part (notesMaster1.xml). See ???? for the details of the notes master.                                                                                                                                                                                                                          |
| <p:notesSz>            | This element specifies the size of slide surface used for notes slides and handout slides. (The size of regular content or presentation slides is specified by the <p:sldSz> element.) The element is empty, with two attributes cx and cy for length and width, respectively, in EMUs. <p:presentation . . . > . . . <p:notesSz cx="6858000" cy="9144000"/> . . . </p:presentation>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| <p:sldIdLst>           | The content slides in the presentation are specified within this element as a list of IDs, using the child elements <p:sldId>. Each <p:sldId> simply refers to a relationship within the .rels part for the presentation (presentation.rels.xml). Note that the order in which slides are listed is important, as it determines the order in which slides are shown, absent a custom show. Below is a presentation with three slides. Note that each has both an id attribute as well as a relationship id attribute id, which references the part for the slide. <p:presentation . . . > . . . <p:sldIdLst> <p:sldId id="256" r:id="rId2"/> <p:sldId id="257" r:id="rId3"/> <p:sldId id="258" r:id="rId4"/> </p:sldIdLst> . . . </p:presentation> The first slide above is referenced using the relationship ID rId2. That relationship within the .rels part for the presentation looks like this: <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>. The actual slide content is specified in that part (slide1.xml). See ???? for the details of the slide part.                            |
| <p:sldMasterIdLst>     | A master slide is the base or template upon which slides are built. It specifies such things as the theme to be used and the layouts that are available. Every presentation has at least one master slide; if you want slides to use different themes, then each theme will require a different master slide. The master slides for a presentation are specified within <p:sldMasterIdLst> element, using the child element <p:sldMasterId> for each master slide. This element simply refers to a relationship within the .rels part for the presentation. <p:presentation . . . > <p:sldMasterIdLst> <p:sldMasterId id="2147483660" r:id="rId1"/> </p:sldMasterIdLst> . . . </p:presentation> The slide master above is referenced above using the relationship ID rId1. That relationship within the .rels part for the presentation (presentation.rels.xml) looks like this: <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>. The actual master is specified in that part (slideMaster1.xml). See [Master Slide](prSlideMaster.md) for the details of the master slide. |
| <p:sldSz>              | This element specifies the size of slide surface used for content or presentation slides. (The size of note and handout slides is specified by the <p:notesSz> element.) The element is empty, with attributes cx and cy for length and width, respectively, in EMUs, and a type attribute which specifies the kind of slide that should be used. This identifies the expected delivery platform. Possible values include:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

- 35mm
- A3
- A4
- banner
- custom
- ledger
- letter
- overhead
- screen16x10
- screen16x9
- screen4x3

<p:presentation . . . > . . . <p:sldSz cx="9144000" cy="6858000" type="screen4x3"/> . . . </p:presentation>

Footer
