# DrawingML Shapes

3D Shape Properties

3D properties are specified within a container <a:sp3d> element, which is within the <a:spPr> (shape properties) element. There are three possible 3D properties--top and bottom bevels, a contour, and an extrusion\--and they are specified either as a child element or as a combination of child element and attribute of <a:sp3d>. Below is a shape with a top bevel and a blur contour.

<xdr:sp macro="" textlink="">

. . .

<xdr:spPr>

<a:xfrm>

. . .

</a:xfrm>

<a:prstGeom>

. . .

</a:prstGeom>

<a:solidFill>

. . .

</a:solidFill>

<a:scene3d>

. . .

</a:scene3d>

<a:sp3d contourW="40000" prstMaterial="metal">

<a:bevelT w="165100" prst="coolSlant"/>

<a:contourClr>

<a:prstClr val="blue"/>

</a:contourClr>

</a:sp3d>

</xdr:spPr>

. . .

</xdr:sp>

![Shape size](drwImages\drwSp-3D.gif)

In addition to the attributes related to contour and extrusion, there are two attributes which affect the 3D properties of a shape. They are prstMaterial and z. The prstMaterial attribute specifies a preset material type, which is a combination of lighting characteristics which are intended to mimic the material. Possible values are:

- clear
- dkEdge
- flat
- legacyMatte
- legacyMetal
- legacyPlastic
- legacyWireframe
- matte
- metal
- plastic
- powder
- softEdge
- softMetal
  translucentPowder

- warmMatte

Below is the same shape shown above, except that the prstMaterial attribute has been set to powder rather than metal.

The z attribute defines the z coordinate for the 3D shape. It is a simple coordinate specified either in EMUs or as a number immediately followed by a unit identifier.

![Shape size](drwImages\drwSp-3D-prstMaterial.gif)

## Bevels

Bottom and top bevels are specified with <a:bevelB> and <a:bevelT>, respectively. Both bevel elements are empty elements with three attributes which define the charateristics of the bevel. The prst attribute specifies the preset bevel type which defines the look of the bevel. Possible values are:

- angle
- artDeco
- circle
- convex
- coolSlant
- cross
- divot
- hardEdge
- relaxedInset
- riblet
- slope
- softRound

The h attribute specifies the height (in EMUs) of the bevel or how far above the shape it is applied. The w attribute specifies the width of the bevel, or how far into the shape it is applied. Below is a sample shape with top and bottom bevels. The bottom bevel is a coolSlant type and has a width of 13 points and a height of 10 points. The top bevel is a softRound type and has a width of 12 points and a height of 10 points.

<a:bevelT w="152400" h="127000" prst="softRound"/>

<a:bevelB w="165100" h="127000" prst="coolSlant"/>

![Shape size](drwImages\drwSp-3D-bevel.gif)

## Contours

A contour is a solid filled line that surrounds the outer edge of the shape. The color of the contour is specified as a child element <a:contourClr> of the <a:sp3d> element. The color is specified as a child element of <a:contourClr> using one of the following color options: as a preset color (<a:prstClr>), using hue, saturation and luminance (<a:hslClr>), scheme colors (<a:schemeClr>), system colors (<a:sysClr>), or as RGB percentages or hex numbers (<a:scrgbClr> or <a:srgbClr>). Note that these elements corresponding to color specification methods can also have child elements which transform the base color. So, for example, a scheme or theme color may be specified as accent6, but a luminance modulation can also be applied to that base color. Colors are not covered in detail here.

The width of the contour is specified (in EMUs) with contourW attribute on the <a:sp3d> element. Below is a shape with a 5-point contour in light blue. Note that the same effect could be achieved by setting the outline shape property. See [Shape Outlines](drwSp-outline.md).

<a:sp3d contourW="63500">

<a:contourClr>

<a:srgbClr val="00B0F0"/>

</a:contourClr>

</a:sp3d>

![Shape size](drwImages\drwSp-3D-contour.gif)

## Extrusion

An extrusion is an artificial height applied to the shape. The color of the extrusion is specified as a child element <a:extrusionClr> of the <a:sp3d> element. The color is specified as a child element of <a:extrusionClr>, using the same color elements as the contour color. See above. The height of the extrusion is specified (in EMUs) with extrusionH attribute on the <a:sp3d> element. Below is a shape with a 20-point, red extrusion.

<a:sp3d extrusionH="254000">

<a:extrusionClr>

<a:srgbClr val="FF0000"/>

</a:extrusionClr>

</a:sp3d>

![Shape size](drwImages\drwSp-3D-extrusion.gif)
