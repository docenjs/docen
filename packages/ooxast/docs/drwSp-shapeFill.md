# DrawingML Shapes

Shape Fill

A shape can be filled a number of ways, and each method is specified as a child element of <SpPr>. Shapes can have the following types of fills, each specified as a child element of <SpPr>.<SpPr>

- Blip fills (BLIP = binary large image or picture). See [Picture Fill](drwSp-PictFill.md).
- Gradient fills. See [Gradient Fill](drwSp-GradFill.md).
- Group fills. See [Group Fill](drwSp-grpFill.md).
- No fill. See below.
- Pattern fills. See [Pattern Fill](drwSp-PattFill.md).
- Solid fills. See [Solid Fill](drwSp-SolidFill.md).

## No Fill

To specify no fill for a shape, an empty <noFill/> is included as a child of <SpPr>.

<xdr:spPr>

<xdr:spPr>

<a:xfrm>

<a:off x="1171575" y="485775"/>

<a:ext cx="1171575" cy="647700"/>

</a:xfrm>

<a:prstGeom prst="trapezoid">

<a:avLst/>

</a:prstGeom>

<a:noFill/>

</xdr:spPr>

</xdr:spPr>

![Shape with no fill in spreadsheet](drwImages\drwSp-noFill.gif)
