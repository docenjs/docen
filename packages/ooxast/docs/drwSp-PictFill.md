# DrawingML Shapes

Picture Fill

A shape can be filled with an image or blip (binary large image or picture) using the <blipFill> element. For the specification of <a:blipFill>, see [Pictures - Image Data](drwPic-ImageData.md) and [Pictures - Tile or Stretch Image to Fill](drwPic-Tile.md).

<xdr:spPr>

. . .

<a:blipFill>

<a:blip xmls:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId1" cstate="print"/>

<a:stretch>

<a:fillRect/>

</a:stretch/>

</a:blipFill>

</xdr:spPr>

![Shape with blipfill or picture fill in spreadsheet](drwImages\drwSp-blipFill.gif)
