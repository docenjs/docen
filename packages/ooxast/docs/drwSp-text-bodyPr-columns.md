# DrawingML Shapes

Text - Body Properties - Columns, Vertical Text and Rotation

## Columns:

Columns for text within a shape may be specified by adding a numCols attribute on <a:bodyPr>. The value indicates the number of columns. When columns are applied, the width of the bounding box is divided by the number of columns. The columns are then treated as overflow containers--when the previous colun is filled, text flows to the next column. When all columns have been filled, the overflow properties are used. See text fit at [Shapes - Text - Fit, Wrap, Warp and 3D](drwSp-text-bodyPr-fit.md).

Below is an example of a shape with three columns (<a:bodyPr anchor="ctr" numCols="3"/>).

![Shape with text - anchoring](drwImages\drwSp-text-col1.gif)

To change the column order to a right-to-left order, add the rtlCol attribute (<a:bodyPr anchor="ctr" numCols="3" rtlCol="1" />). A value of false is assumed if this attribute is omitted.

![Shape with text - anchoring](drwImages\drwSp-text-col2.gif)

The space between columns can be specified with the spcCol attribute. The value is in EMUs. Below is the same shape as above, but with a half an inch of space between columns (<a:bodyPr anchor="ctr" numCols="3" rtlCol="1" spcCol="457200"/>).

![Shape with text - anchoring](drwImages\drwSp-text-col3.gif)

## Vertical Text:

Text within a shape may be displayed vertically by specifying the vert attribute on <a:bodyPr>. Possible values for this attribute are:

- eaVert (East Asian vertical)
- horz (horizontal--the default)
- mongolianVert (some fonts are displayed as if rotated 90 degrees while others--mostly East Asian--are displayed vertically; text flows top down, left to right)
- vert (vertical)
- vert270 (each line is 270 degrees rotated clockwise, so it goes bottom to top and each line is to the right of the previous)
- wordArtVert ("one letter on top of another")
- wordArtVertRtl (vertical WordArt should be shown from right to left rather than left to right)

Below is a shape with text displayed vertically (<a:bodyPr anchor="ctr" vert="vert"/>).

![Shape with text - anchoring](drwImages\drwSp-text-vert1.gif)

## Text Rotation:

Text within the bounding box of a shape can be rotated independently of the shape by specifying a rotation with the rot attribute on <a:bodyPr>. Values are in 60,000ths of a degree. Below is a sample shape and text, first with no rotation and then with a 45 degree rotation (<a:bodyPr anchor="ctr" rot="2700000"/>).

![Shape with text - rotation](drwImages\drwSp-text-rotate1.gif) ![Shape with text - rotation](drwImages\drwSp-text-rotate2.gif)

To show the shape and text rotating independently, below is a sample shape with a 90 degree rotation and the text with a 45 degree rotation.

<p:spPr>

<a:xfrm rot="5400000"/>

. . .

</a:xfrm>

. . .

</p:spPr>

. . .

<p:txBody>

<a:bodyPr rtlCol="0" anchor="ctr" rot="2700000"/>

. . .

</p:txBody>

![Shape with text - rotation](drwImages\drwSp-text-rotate3.gif)

To prevent text from rotating when a shape is rotated, the text can be rotated with a negative value in the same amount as the shape rotation. Below is a shape rotated 45 degrees and the text rotated -45 degrees. The shape appears to remain fixed.

<p:spPr>

<a:xfrm rot="2700000"/>

. . .

</a:xfrm>

. . .

</p:spPr>

. . .

<p:txBody>

<a:bodyPr rtlCol="0" anchor="ctr" rot="-2700000"/>

. . .

</p:txBody>

![Shape with text - rotation](drwImages\drwSp-text-rotate4.gif)

Note that a similar result can be achieved using the upright attribute discussed below.

## Text Upright:

Text can be specified to remain upright using the upright attribute on <a:bodyPr>. This will keep the text upright regardless of the transform applied to it or to the accompanying shape. Values are either true or false; false is the default value. Below is a the same shape as above (a 45 degree rotation has been applied), but the text is specified to remain upright.

<p:spPr>

<a:xfrm rot="2700000"/>

. . .

</a:xfrm>

. . .

</p:spPr>

. . .

<p:txBody>

<a:bodyPr rtlCol="0" anchor="ctr" upright="1"/>

. . .

</p:txBody>

![Shape with text - rotation](drwImages\drwSp-text-upright1.gif)
