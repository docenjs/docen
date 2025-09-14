# DrawingML Shapes

Effects

Effects are specified within a container <a:effectLst> element within the <a:spPr> (shape properties) element. One or more effects can be specified as child elements of <a:effectLst>, and the effects are applied in a default order by the rendering engine or word processor. Possible effects are blur, fill overlay, glow, inner shadow, outer shadow, preset shadow, reflection, and soft edge. Below is an example of a triangle shape with a glow and a reflection applied.

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

<a:effectLst>

<a:glow rad="101600">

<a:schemeClr val="accent6">

<a:satMode val="175000"/>

<a:alpha val="40000"/>

</a:schemeClr>

</a:glow>

<a:reflection blurRad="6350" stA="50000" endA="300" endPos="38500" dist="50800" dir="5400000" sy="-100000" algn="bl" rotWithShape="0"/>

</a:effectLst>

</xdr:spPr>

. . .

</xdr:sp>

![Shape size](drwImages\drwSp-effects1.gif)

## Blur

A blur effect is applied to a shape with the empty element <a:blur>. The characteristics of the blur effect are specified with two attributes. The grow attribute specifies whether the blur effect should extend beyond the original bounds of the shape. A value of true extends the blur beyond, and a value of false does not. The rad attribute specifies how much blur (or the radius of the blur). It is specified in EMUs. Below is a sample of a triange that has a blur applied beyond the bounds of the shape, with a radius of 100,000 EMUs.

<a:effectLst>

<a:blur grow="1" rad="100000"/>

</a:effectLst>

![Shape size](drwImages\drwSp-effects-blur.gif)

## Fill Overlay

It is possible to specify two fills for a shape. The first is specified as a child element of <SpPr>. See [Shape Fill](dwrSp-shapeFill.md). An overlay fill can then be specified over the first fill type by specifying a <a:fillOverlay> as an effect within a <a:effectLst> element. The <a:fillOverlay> can contain the same fills that are possible for the object's primary fill:

- Blip fills (BLIP = binary large image or picture). See [Picture Fill](drwSp-PictFill.md).
- Gradient fills. See [Gradient Fill](drwSp-GradFill.md).
- Group fills.
- No fill, as specified by the empty element <noFill/>.
- Pattern fills. See [Pattern Fill](drwSp-PattFill.md).
- Solid fills. See [Solid Fill](drwSp-SolidFill.md).

<a:fillOverlay> element also has a blend attribute which specifies how to blend the fills. Possible values are:

- darken
- lighten
- mult
- over
- screen

Below is a sample that has a base blip fill, with an overlay fill that is a pattern overlay with a dot grid pattern, with a white foreground and a red background. The blend value is over.

<a:effectLst>

<a:fillOverlay blend="over">

<a:pattFill prst="dotGrid">

<a:fgClr>

<a:prstClr val="white"/>

</a:fgClr>

<a:bgClr>

<a:prstClr val="red"/>

</a:bgClr>

</a:pattFill>

</a:fillOverlay>

</a:effectLst>

![Shape size](drwImages\drwSp-effects-fillOverlay.gif)

Below is the same overlay effect, but with a blend value of mult.

![Shape size](drwImages\drwSp-effects-fillOverlay2.gif)

## Glow

A glow effect adds a color-blurred outline outside of the shape. It is specified with a <a:glow> element. The color of the outline is specified with a child element using one of the following color options: as a preset color (<a:prstClr>), using hue, saturation and luminance (<a:hslClr>), scheme colors (<a:schemeClr>), system colors (<a:sysClr>), or as RGB percentages or hex numbers (<a:scrgbClr> or <a:srgbClr>). The amount or radius of the blur is specified by a rad attribute (in EMUs) on the <a:glow> element. Below is a sample with a blue outline color and a radius of 1000000 EMUs.

<a:effectLst>

<a:glow rad="100000">

<a:prstClr val="blue"/>

</a:glow>

</a:effectLst>

![Shape size](drwImages\drwSp-effects-glow.gif)

## Inner Shadow

An inner shadow is applied within the edges of the shape and is specified with a <a:innerShdw> element. The color of the shadow is specified by a child element using the same possible color elements as stated above in the section on glow. The other characteristics of the shadow are specified with three attributes: blurRad, which specifies the radius of the blur (in EMUs); dir, which specifies the direction to offset the shadow (in 60000ths of a degree); and dist, which specifies how far to offset the shadow. Below is a sample of a triangle shape with a red inner shadow at 150 degrees, with a blur factor of 15 points and a distance of 10 points.

<a:effectLst>

<a:innerShdw blurRad="190500" dist="127000" dir="9000000">

<a:srgbClr val="FF0000">

<a:alpha val="50000"/>

</a:srgbClr>

</a:innerShdw>

</a:effectLst>

![Shape size](drwImages\drwSp-effects-innerShadow.gif)

## Outer Shadow

An outer shadow is applied beyond the edges of the shape and is specified with a <a:outerShdw> element. The color of the shadow is specified by a child element using the same possible color elements as stated above in the section on glow. The other characteristics of the shadow are specified with several attributes:

- algn, which specifies shadow alignment. Possible values are b (bottom), bl (bottom left), br (bottom right), ctr (center), l (left), r (right), t (top), tl (top left), and tr (top right).
- blurRad, which specifies the radius of the blur (in EMUs)
- dir, which specifies the direction to offset the shadow (in 60000ths of a degree)
- dist, which specifies how far to offset the shadow
- kx, which specifies the horizontal skew angle (in 60000ths of a degree)
- ky, which specifies the vertical skew angle (in 60000ths of a degree)
- rotWithShape, which specifies whether the shadow rotates with the shape if the shape is rotated
- sx, which specifies the horizontal scaling factor (as a percentage). Negative scaling causes a flip.
- sy, which specifies the vertical scaling factor (as a percentage). Negative scaling causes a flip.

Below is a sample of a triangle shape with a light blue outer shadow at 0 degrees, with a blur factor of 27 points and a distance of 10 points.

<a:effectLst>

<a:outerShdw blurRad="342900" dist="127000" algn="bl" rotWithShape="0">

<a:srgbClr val="0070C0">

<a:alpha val="51000"/>

</a:srgbClr>

</a:outerShdw>

</a:effectLst>

![Shape size](drwImages\drwSp-effects-outerShadow.gif)

## Preset Shadow

A preset shadow is an outer shadow with a pre-determined set of charateristics; it is specified with the <a:prstShdw> element. The type of preset shadow is specified with the prst attribute. Possible values are shdw1 through shdw20. Consult ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.1.10.51 for examples of each. Note that although certain characteristics are preset, others can be specified. As with other shadows, the color is specified as a child element. See the other shadow effects discussed above for details of the color child element. In addition to color, the dir and dist attributes can be specified. Again, see the other shadow effects for details. Note that for preset shadows, the rotWithShape is always false. Below is a sample preset black shadow effect.

<a:effectLst>

<a:prstShdw dist="38100" dir="18900000" prst="shdw1">

<a:prstClr val="black">

<a:alpha val="40000"/>

</a:prstClr>

</a:prstShdw>

</a:effectLst>

![Shape size](drwImages\drwSp-effects-prstShadow.gif)

## Reflection

A reflection effect is specified with a <a:reflection> element, an empty element. The characteristics of the reflection are given in several attributes:

- algn, which specifies shadow alignment. Possible values are b (bottom), bl (bottom left), br (bottom right), ctr (center), l (left), r (right), t (top), tl (top left), and tr (top right).
- blurRad, which specifies the radius of the blur (in EMUs)
- dir, which specifies the direction to offset the shadow (in 60000ths of a degree)
- dist, which specifies how far to offset the shadow
- endA, which specifies the ending reflection opacity, as a percentage
- endPos, which specifies the end position of the end alpha value, as a percentage.
- fadeDir, which specifies the direction to offset the reflection (in 60000ths of a degree)
- kx, which specifies the horizontal skew angle (in 60000ths of a degree)
- ky, which specifies the vertical skew angle (in 60000ths of a degree)
- rotWithShape, which specifies whether the shadow rotates with the shape if the shape is rotated
- stA, which specifies the starting reflection opacity, as a percentage
- stPos, which specifies the start position of the start alpha value, as a percentage.
- sx, which specifies the horizontal scaling factor (as a percentage). Negative scaling causes a flip.
- sy, which specifies the vertical scaling factor (as a percentage). Negative scaling causes a flip.

Below is a sample reflection aligned at the bottom left, flipped vertically, starting with a 50% opacity.

<a:effectLst>

<a:reflection blurRad="6350" stA="50000" endA="300" endPos="90000" dir="5400000" sy="-100000" algn="bl" rotWithShape="0"/>

</a:effectLst>

![Shape size](drwImages\drwSp-effects-reflection.gif)

## Soft Edge

A soft edge can be specified so that the edges of the shape are blurred but the fill is unaffected. Soft edges are specified with the <a:softEdge> element, an empty element. The radius of the blur for the edge is specified with the rad attribute (in EMUs). Below is a triangle shape with a blur of 10 points.

<a:effectLst>

<a:softEdge rad="127000"/>

</a:effectLst>

![Shape size](drwImages\drwSp-effects-softEdge.gif)
