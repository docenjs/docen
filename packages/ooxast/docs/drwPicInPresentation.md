# DrawingML Object Placement

Placement within a Presentation Document

Presentations are organized into slides or <p:sld> elements. Pictures, shapes, tables, and text on a given slide are specified inline in the part for that slide (e.g., slide1.xml, slide2.xml, etc.). The <p:sld> element contains a <p:cSld> element which acts as a container for common slide data such as pictures, shapes, and tables. (The <p:sld> element can also contain information regarding timing and transition. This information is not covered here.) All shapes, pictures and other content are further nested within a shape tree or <p:spTree> element.

Note: The high-level elements used to place shapes, pictures, and tables into slides in presentations are within the main presentationML namespace xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main".

The shape tree contains non-visual properties of a group shape, visual properties that are common to all shapes (which can be overridden by the properties in individual shapes), and then one or more shapes, pictures, connection shapes, group shapes, and/or graphic frames (i.e., containers for tables and graphics generated from an external source). So all shapes and other content for a slide are contained within the <p:spTree> element. Each shape and picture is positioned on the slide within the properties for that particular shape or picture. For example, for a shape, the positioning is within the <a:xfrm>, which is in the <p:spPr> element containing the shape properties. See [Shapes - Bounding Box Location](drwSp-location.md).

The order of the shapes and other content within the <p:spTree> element is important, as the order determines the z-order of the objects on the slide. The first object listed has the lowest z-order (and is thus on the bottom of the object stack) and the last has the highest order (and is on the top of the stack of objects). The z-order is important when objects overlap, and it also determines the tab or navigation order, with objects being navigated in ascending z-order. Below is an example of a stack of four objects on a slide, with the oval shape first, followed by a picture, followed by another picture, followed by an arrow shape.

<p:sld . . .>

<p:cSld>

<p:nvGrpSpPr>

. . .

<p:nvGrpSpPr>

<p:grpSpPr>

. . .

<p:grpSpPr>

<p:sp>

<p:nvSpPr>

<p:cNvPr id="4" name="Oval 3"/>

. . .

</p:nvSpPr>

. . .

<p:sp>

<p:pic>

<p:nvPicPr>

<p:cNvPr id="5" name="Picture 4" descr="Blue hills.jpg"/>

. . .

</p:nvPicPr>

. . .

<p:pic>

<p:pic>

<p:nvPicPr>

<p:cNvPr id="8" name="Picture 7" descr="Winter.jpg"/>

. . .

</p:nvPicPr>

. . .

<p:pic>

<p:sp>

<p:nvSpPr>

<p:cNvPr id="9" name="Right Arrow 8"/>

. . .

</p:nvSpPr>

. . .

<p:sp>

<p:cSld>

. . .

</p:sld>

![Placement of shapes within a presentation](drwImages\drwInPresentation1.gif)

If we reverse the order of the last two objects, placing the arrow shape before the picture of winter, we get the following, with the picture of winter over the arrow:

<p:sld . . .>

<p:cSld>

<p:nvGrpSpPr>

. . .

<p:nvGrpSpPr>

<p:grpSpPr>

. . .

<p:grpSpPr>

<p:sp>

<p:nvSpPr>

<p:cNvPr id="4" name="Oval 3"/>

. . .

</p:nvSpPr>

. . .

<p:sp>

<p:pic>

<p:nvPicPr>

<p:cNvPr id="5" name="Picture 4" descr="Blue hills.jpg"/>

. . .

</p:nvPicPr>

. . .

<p:pic>

<p:sp>

<p:nvSpPr>

<p:cNvPr id="9" name="Right Arrow 8"/>

. . .

</p:nvSpPr>

. . .

<p:sp>

<p:pic>

<p:nvPicPr>

<p:cNvPr id="8" name="Picture 7" descr="Winter.jpg"/>

. . .

</p:nvPicPr>

. . .

<p:pic>

<p:cSld>

. . .

</p:sld>

![Placement of shapes within a presentation](drwImages\drwInPresentation2.gif)
