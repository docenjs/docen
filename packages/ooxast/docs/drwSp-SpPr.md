# DrawingML Shapes

Visual Properties

The visual properties of a shape are specified with the <SpPr> element. The properties can be grouped into a handful of categories:

1. Geometry of the shape. See [Preset Geometry](drwSp-prstGeom.md) and [Custom Geometry](drwSp-custGeom.md).
2. Fill of the shape. See [Shape Fill](drw-shapeFill.md).
3. Effects applied to the shape. See [Effects](drwSp-effects.md).
4. Style for the outline of the shape. See [Outline Style](drwSp-outline.md).
5. 2-d transformation of the shape (i.e., flipping and rotation). See [2-D Transforms](drwSp-rotate.md).
6. 3-d properties applied to the shape. See [3D Shape Properties](drwSp-3dProps.md) and [3D Scene Properties](drwSp-3dScene.md).

<xdr:sp macro="" textlink="">

. . .

<xdr:spPr>

<a:xfrm>

<a:off x="1371600" y="514350"/>

<a:ext cx="1038225" cy="542925"/>

</a:xfrm>

<a:prstGeom prst="roundRect">

<a:avLst/>

</a:prstGeom>

</xdr:spPr>

</xdr:sp>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 19.3.1.44 (presentations) and § 20.5.2.30 (spreadsheets).

The individual elements of <SpPr> are covered in detail on the pages that cover the property categories. However, there is one attribute for <SpPr> relating to black and white mode.

### Attributes:

| Attribute | Description                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------- |
| bwMode    | Specifies that the shape should be rendered using only black and white coloring. Possible values are: |

- auto
- black
- blackGray
- blackWhite
- clr [normal color]
- gray
- grayWhite
- hidden
- invGray [inverse gray coloring]
- ltGray [light gray coloring]
- white

Note: Microsoft Office does not seem to fully support this attribute.
