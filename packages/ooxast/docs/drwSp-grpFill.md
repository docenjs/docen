# DrawingML Shapes

Group Fill

A set of shapes can be grouped together with a <xdr:grpSp> (or <p:grpSp>) element. That group of shapes has a set of properties (within a <grpSpPr>), and one of the properties can be a fill. The individual shapes within the shape group can specify their own fill types or they can use the fill type of the group by specifying <a:grpFill/> for their fill. Below is an example of three shapes grouped together within a spreadsheet. The group fill is specified as a solid fill of black. The triangle uses the group fill, as specified with the <a:grpFill/> element for the triangle shape's fill within its <spPr>. The rectangle and oval both specify their own solid fills.

<xdr:grpSp>

. . .

<xdr:grpSpPr>

. . .

<a:solidFill>

<a:prstClr val="black"/>

<a:solidFill>

</xdr:grpSpPr>

<xdr:sp macro="" textlink="">

<xdr:nvSpPr>

<xdr:cNvPr id="2" name="Rectangle 1"/>

<xdr:cNvSpPr/>

</xdr:nvSpPr>

<xdr:spPr>

. . .

<a:solidFill>

<a:srgbClr val="FFFF00"/>

</a:solidFill>

</xdr:spPr>

</xdr:sp>

<xdr:sp macro="" textlink="">

<xdr:nvSpPr>

<xdr:cNvPr id="3" name="Isoceles Triangle 2"/>

<xdr:cNvSpPr/>

</xdr:nvSpPr>

<xdr:spPr>

. . .

<a:grpFill/>

</xdr:spPr>

</xdr:sp>

<xdr:sp macro="" textlink="">

<xdr:nvSpPr>

<xdr:cNvPr id="4" name="Oval 3"/>

<xdr:cNvSpPr/>

</xdr:nvSpPr>

<xdr:spPr>

. . .

<a:solidFill>

<a:srgbClr val="00B0F0"/>

</a:solidFill>

</xdr:spPr>

</xdr:sp>

</xdr:grpSp>

![Shape with solid fill in spreadsheet](drwImages\drwSp-grpFill.gif)
