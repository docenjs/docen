# DrawingML Shapes

Pattern Fill

A pattern fill specifies a repeated pattern to be used to fill the object. It is specified with the <a:pattFill> element. There are three basic properties to a pattern: (1) the actual pattern to be used, specified by the prst attribute, (2) the foreground color, specified as a child element <a:fgClr>, and (3) the background color, specified as a child element <a:bgClr>.

<a:pattFill prst="dotGrid">

<a:fgClr>

<a:prstClr val="gray"/>

</a:fgClr>

<a:bgClr>

<a:prstClr val="blue"/>

</a:bgClr>

</a:pattFill>

![Shape with pattern fill in spreadsheet](drwImages\drwSp-patternFill.gif)

### Elements:

A <a:pattFill> has the following elements.

| Element | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bgClr   | Specifies the background color of the pattern fill. Colors can be specified using one of the following color options: as a preset color (<a:prstClr>), using hue, saturation and luminance (<a:hslClr>), scheme colors (<a:schemeClr>), system colors (<a:sysClr>), or as RGB percentages or hex numbers (<a:scrgbClr> or <a:srgbClr>). Note that these elements corresponding to color specification methods can also have child elements which transform the base color. So, for example, in the sample below, a scheme or theme color is specified as accent6, but a luminance modulation is applied to that base color. Colors are not covered in detail here. <a:schemeClr val="accent6"> <a:lumMod val="75000"/> </a:schemeClr> |
| fgClr   | Specifies the foreground color of the pattern fill. See bgClr above for discussion of color.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

<pattFill> can have the following attributes.

| Attribute | Description                                                                        |
| --------- | ---------------------------------------------------------------------------------- |
| prst      | Specifies one of a set of preset patterns to fill the object. Possible values are: |

- cross
- dashDnDiag (dashed downward diagonal)
- dashHorz
- dashUpDiag
- dashVert
- diagBrick
- diagCross
- divot
- dkDnDiag (dark downward diagonal)
- dkHorz
- dkUpDiag
- dkVert
- dnDiag
- dotDmnd (dotted diamond)
- dotGrid
- horz
- horzBrick
- lgCheck (large checker board)
- lgConfetti
- lgGrid
- ltDnDiag (light downward diagonal)
- ltHorz
- ltUpDiag
- ltVert
- narHor (narrow horizontal)z
- narVert
- openDmnd (open diamond)
- pct 5 (5%)
- pct 10 (10%)
- pct 20 (20%)
- pct 25 (25%)
- pct 30 (30%)
- pct 40 (40%)
- pct 50 (50%)
- pct 60 (60%)
- pct 70 (70%)
- pct 75 (75%)
- pct 80 (80%)
- pct 90 (90%)
- plaid
- shingle
- smCheck (small checker board)
- smConfetti
- smGrid
- solidDmnd
- sphere
- trellis
- upDiag
- vert
- wave
- wdDnDiag (wide downward diagonal)
- wdUpDiag
- weave
- zigZag
