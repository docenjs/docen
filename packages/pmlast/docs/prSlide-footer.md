# PresentationML Slides - Properties - Headers and Footers

A footer can appear in any slide type. A header can appear in notes, notes masters, and handout masters (but not in slides, slide layouts, or layout masters). Footer and header text, slide numbers and dates are specified within shapes, that is, within an <p:sp> element. A placeholder element within the non-visual properties of the shape is specified for the shape, and the placeholder element has a type attribute value specifying the type of content to be found within the placeholder. For purposes of content within headers and footers, possible values include ftr, hdr, dt, or sldNum corresponding to footer text, header text, date and slide number. See [Slides - Overview](prSlide.md) for more on placeholders. Note that content such as the date and slide number are embedded as fields within a shape. See [DrawingML - Text - Content](drwSp-text-paragraph.md) for more on fields within drawingML documents.

There is an element within master slides that specifies whether particular placeholders are enabled within headers and footers - the <p:hf> element within the master slide, notes master slide, handout master slide, and slide layouts root elements. The element is empty, and has four possible attributes with boolean values specifying whether particular header and footer information in the placeholders is enabled: dt for date and time placeholder, ftr for the footer placeholder, hdr for header placeholder, and sldNum for slide number placeholder. The placeholder is assumed to be enabled if the attribute is not specified. For example, <p:hf hdr="0" /> enables all but the header placeholder.

Below is a sample master slide with footer text, the date in the footer of the slide, and the slide number in the footer for the slide. Keep in mind that although these shapes and their footer placeholders are in the master slide, they must also be within each slide if they are to be displayed.

<p:sldMaster . . . >

<p:cSld>

. . .

<p:spTree>

. . .

<p:sp>

<p:nvSpPr>

<p:cNvPr id="3" name="Footer Placeholder 2"/>

. . .

<p:nvPr>

<p:ph type="ftr" sz="quarter" idx="3"/>

</p:nvPr>

</p:nvSpPr>

. . .

<p:txBody>

. . .

<a:p>

<a:r>

. . .

<a:t>My footer text</a:t>

</a:r>

. . .

</a:p>

. . .

</p:txBody>

</p:sp>

<p:sp>

<p:nvSpPr>

<p:cNvPr id="14" name="Date Placeholder 13"/>

. . .

<p:nvPr>

<p:ph type="dt" sz="half" idx="2"/>

</p:nvPr>

</p:nvSpPr>

. . .

<p:txBody>

. . .

<a:p>

<a:fld id="{CD6D8A93-66E1-43C3-961E-08F5AB2E9179}" type="datetime1">

. . .

</a:fld>

. . .

</a:p>

. . .

</p:txBody>

</p:sp>

<p:sp>

<p:nvSpPr>

<p:cNvPr id="23" name="Slide Number Placeholder 22"/>

. . .

<p:nvPr>

<p:ph type="sldNum" sz="quarter" idx="4"/>

</p:nvPr>

</p:nvSpPr>

. . .

<p:txBody>

. . .

<a:p>

<a:fld id="{2F48A7AD-349E-4E69-B4D2-764EE05B2523}" type="slidenum">

. . .

</a:fld>

. . .

</a:p>

. . .

</p:txBody>

</p:sp>

</p:spTree>

</p:cSld>

. . .

<p:hf hdr="0" />

. . .

</p:sldMaster>

![Presentation slide](pptxImages\ppSlide-footers.gif)

Footer
