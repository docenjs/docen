# DrawingML Shapes

Bounding Box Size

The size of the bounding box of the shape is specified with the <a:ext> or extents element within the <a:xfrm> element, which is a child element of <a:spPr> (shape properties) element. The <a:ext> is an empty element; the length and width of the bounding box are specified by two attributes of <a:ext>: cx specifies the width in EMUs, and cy specifies the height in EMUs. Below is an example of a triangle shape, followed by the same triangle that has had its height extended.

<xdr:sp macro="" textlink="">

. . .

<xdr:spPr>

<a:xfrm>

<a:off x="1819275" y="619125"/>

<a:ext cx="371475" cy="428625"/>

</a:xfrm>

. . .

</xdr:spPr>

. . .

</xdr:sp>

![Shape size](drwImages\drwSp-size1.gif)

Below is the same triangle with its height extended from 428625 EMUs to 1514475 EMUs.

<xdr:sp macro="" textlink="">

. . .

<xdr:spPr>

<a:xfrm>

<a:off x="1819275" y="619125"/>

<a:ext cx="371475" cy="1514475"/>

</a:xfrm>

. . .

</xdr:spPr>

. . .

</xdr:sp>

![Shape size](drwImages\drwSp-size2.gif)

Note: If the shape is placed in the worksheet at the corner of a cell, with no offset, then the values for the <xdr:to> element (indicating the bottom right corner) should be the same as the size as indicated by the <a:ext> element. See [Positioning within a Spreadsheet Document - Two-Cell Anchoring](drwPicInSpread-twoCell.md) for more on positioning within spreadsheets and the <xdr:to> element.

<xdr:twoCellAnchor>

<xdr:from>

<xdr:col>1</xdr:col>

<xdr:colOff>0</xdr:colOff>

<xdr:row>1</xdr:row>

<xdr:rowOff>0</xdr:rowOff>

</xdr:from>

<xdr:to>

<xdr:col>1</xdr:col>

<xdr:colOff>876300</xdr:colOff>

<xdr:row>1</xdr:row>

<xdr:rowOff>990600</xdr:rowOff>

</xdr:to>

. . .

<xdr:sp macro="" textlink="">

. . .

<xdr:spPr>

<a:xfrm>

<a:off x="1819275" y="619125"/>

<a:ext cx="876300" cy="990600"/>

</a:xfrm>

. . .

</xdr:spPr>

. . .

</xdr:sp>

</xdr:twoCellAnchor>

![Shape size](drwImages\drwSp-size3.gif)
