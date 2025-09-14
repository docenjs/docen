# DrawingML Shapes

Flipping and Rotation

Shapes can be flipped both horizontally and vertically, as well as rotated. Flipping and rotation are specified with attributes on the <a:xfrm> element, which is a child element of <p:spPr> (shape properties) element. A shape is flipped horizontally with the flipH attribute, and it is flipped vertically with the flipV attribute. Both are booleans, with a value of true indicating that the shape should be flipped. Roation is specified with the rot attribute. Values are in 60,000ths of a degree, with positive angles moving clockwise or towards the positive y-axis.

<xdr:sp macro="" textlink="">

. . .

<xdr:spPr>

<a:xfrm flipV="1">

<a:off x="609600" y="190500"/>

<a:ext cx="876300" cy="990600"/>

</a:xfrm>

. . .

</xdr:spPr>

. . .

</xdr:sp>

Here is the shape without vertical flipping.

![Shape size](drwImages\drwSp-rotate1.gif)

Here is the shape with vertical flipping.

![Shape size](drwImages\drwSp-rotate2.gif)

Below is the same shape as above (without the vertical flipping), now rotated 45 degrees.

<xdr:sp macro="" textlink="">

. . .

<xdr:spPr>

<a:xfrm rot="2700000">

<a:off x="609600" y="190500"/>

<a:ext cx="876300" cy="990600"/>

</a:xfrm>

. . .

</xdr:spPr>

. . .

</xdr:sp>

![Shape size](drwImages\drwSp-rotate3.gif)
