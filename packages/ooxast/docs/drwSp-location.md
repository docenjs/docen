# DrawingML Shapes

Bounding Box Location (Presentations)

The location of the bounding box of the shape within a presentation slide is specified with the <a:off> or offset element within the <a:xfrm> element, which is a child element of <p:spPr> (shape properties) element.

NOTE: The location of the bounding box within a spreadsheet is determined by its positioning within the worksheet--whether [absolute](drwPicInSpread-absolute.md), [one-cell](drwPicInSpread-OneCell.md), or [two-cell](drwPicInSpread-twoCell.md) positioning. So although there is an <a:off> element, it will have no effect on the positioning.

The <a:off> is an empty element which specifies with its attributes a coordinate for the bounding box. The coordinate along the x-axis is specified by the x attribute, and the coordinate along the y-axis is specified by the y attribute. Both are specified in either EMUS or by a number followed immediately by a unit identifier (e.g., 2in). Keep in mind the drawingML coordinate system. The origin is at the top left; the x axis increases left to right and the y axis increases top to bottom.

Below is an example of two triangle shapes within a presentation. One is lower and to the right of the other. Compare the values of the x and y attributes.

<p:sp>

. . .

<p:spPr>

<a:xfrm>

<a:off x="1676400" y="914400"/>

<a:ext cx="1219200" cy="1219200"/>

</a:xfrm>

. . .

</p:spPr>

. . .

</p:sp>

<p:sp>

. . .

<p:spPr>

<a:xfrm>

<a:off x="3276600" y="2057400"/>

<a:ext cx="1219200" cy="1219200"/>

</a:xfrm>

. . .

</p:spPr>

. . .

</p:sp>

![Shape location  with a presentation](drwImages\drwSp-location1.gif)
