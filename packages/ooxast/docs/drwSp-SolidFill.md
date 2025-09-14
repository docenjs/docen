# DrawingML Shapes

Solid Fill

A solid color fill is specified with the <a:solidFill> element. The color is specified as a child element using one of the following color options: as a preset color (<a:prstClr>), using hue, saturation and luminance (<a:hslClr>), scheme colors (<a:schemeClr>), system colors (<a:sysClr>), or as RGB percentages or hex numbers (<a:scrgbClr> or <a:srgbClr>). Note that these elements corresponding to color specification methods can also have child elements which transform the base color. So, for example, a scheme or theme color may be specified as accent6, but a luminance modulation can also be applied to that base color. Colors are not covered in detail here.

<a:solidFill>

<a:schemeClr val="accent6">

<a:lumMod val="75000"/>

</a:schemeClr>

</a:solidFill>

![Shape with solid fill in spreadsheet](drwImages\drwSp-solidFill.gif)
