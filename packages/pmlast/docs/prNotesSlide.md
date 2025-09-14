# PresentationML Slides - Notes Slide

A notes slide contains a thumbnail of the corresponding presentation slide together with notes displayed below the thumbnail. The slide thumbnail is contained within a placeholder of type 'sldImg'. The text of the notes is contained within a placeholder of type 'body'. See [Slides - Overview](prSlide.md) for more on placeholders. The notes slide can have additional content, different headers and footers, and different styles from the corresponding presentation slide. For example, below shows a notes slide with a text box indicating that the slide is confidential. Below that is the same slide in a normal view, i.e., as a presentation slide.

![notes slide with text box](pptxImages\ppNotesSlide1.gif)

The same slide as a presentation slide (i.e., in normal view) is below.

![notes slide in normal view](pptxImages\ppNotesSlide2.gif)

The underlying XML for the notes slide is below. The thumbnail and notes placeholders are colored.

<p:notes . . . >

<p:cSld>

. . .

<p:spTree>

. . .

<p:sp>

<p:nvSpPr>

<p:cNvPr id="2" name="Slide Image Placeholder 1"/>

. . .

<p:nvPr>

<p:ph type="sldImg"/>

</p:nvPr>

</p:nvSpPr>

. . .

</p:sp>

<p:sp>

<p:nvSpPr>

<p:cNvPr id="3" name="Notes Placeholder 2"/>

. . .

<p:nvPr>

<p:ph type="body" idx="1"/>

</p:nvPr>

</p:nvSpPr>

. . .

</p:sp>

<p:sp>

<p:nvSpPr>

<p:cNvPr id="4" name="Slide Number Placeholder 3"/>

. . .

<p:nvPr>

<p:ph type="sldNum" sz="quarter" idx="10"/>

</p:nvPr>

</p:nvSpPr>

. . .

</p:sp>

<p:sp>

<p:nvSpPr>

<p:cNvPr id="5" name="TextBox 4"/>

. . .

</p:nvSpPr>

<p:spPr>

. . .

</p:spPr>

<p:txBody>

. . .

<p:p>

<p:r>

<p:rPr . . ./>

<p:t>Confidential</p:t>

</p:r>

</p:p>

. . .

</p:txBody>

. . .

</p:sp>

</p:spTree>

</p:cSld>

. . .

</p:notes>

The note slides of a presentation are each contained within a notes slide part (within the notesSlides folder). There is a notes slide for each slide that has notes. If there is a notes slide for a slide, then that notes slide is referenced in the .rels file for the slide. So, for example, if slide 2 has notes, the .rels file for slide 2 will have a relationship to the notes slide: <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide2.xml"/>. The notes slides are not referenced in the presentation.xml.

The content model for a notes slide is similar to a presentation slide, except that it does not contain a timing or transition element. The significant differences relate to the placeholders that they have. The presentation has a set of shapes with placeholders and other content. The notes slide does not have the same shapes and content as its corresponding presentation slide. It has only a placeholder for the thumbnail image of the presentation slide, as well as a placeholder for the notes content, and it may have other shapes and content as desired (defined for all notes slide in the master notes slide or for a particular notes slide in that notes slide). See [Slides - Overview](prSlide.md) for a comparison of the content models of the various slide types. The root element of a notes slide is the <p:notes> element. Below is a table showing the possible children of the root element, followed by a table showing the attributes of the root <p:notes> element.

### Elements:

| Element       | Description                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <p:clrMapOvr> | Specifies overrides of the color scheme that is specified in the master slide's <p:clrMap>. For details, see [Slide Properties - Color Scheme](prSlide-color.md). |
| <p:cSld>      | Specifies the slide content. For details, see [Slides - Common Slide Data](prCommonSlideData.md).                                                                 |

The attributes are:

### Attributes:

| Attribute        | Description                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| showMasterPhAnim | Specifies whether to display animations on placeholders from the master slide. Values are booleans. |
| showMasterSp     | Specifies whether shapes from the master should be displayed on slides or not. Values are booleans. |

Footer
