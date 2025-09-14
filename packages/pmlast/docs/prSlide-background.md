# PresentationML Slides - Properties - Background

The background for a slide is specified as a child element of the common slide data element (<p:cSld>) of either the slide, slide layout, or slide master. It is specified within a <p:bg> element. There are two ways to specify the background: (1) by specifying the properties of the background within a <p:bgPr> element, or (2) by refering to a background style defined in the theme part for the presentation using the <p:bgRef> element.

A background as specified with a <p:bgPr> element can be any fill, image or effect that is allowed with a shape. See [DrawingML - Shapes - Shape Fill](drwSp-shapeFill.md) for details of specifying a fill. Below is a slide with a simple solid fill background.

<p:cSld>

<p:bg>

<p:bgPr>

<a:solidFill>

<a:schemeClr val="bg2">

<a:lumMoc val="75000"/>

<a:alpha val="75000"/>

</a:schemeClr>

</a:solidFill>

<a:effectLst/>

</p:bgPr>

</p:bg>

<p:spTree>

. . .

</p:spTree>

</p:cSld>

![Slide background - bgPr](pptxImages\ppSlide-background1.gif)

A reference to a background is specified with the <p:bgRef> element. It has an idx attribute which is an index of either a background fill style (within <a:bgFillStyleLst>) or a fill style (within <a:fillStyleLst>) of the presentation's theme part. See [DrawingML - Styles](drwSp-styles.md) for more on the components of a theme and on the background and fill styles. A value for the idx attribute of 0 or 1000 indicates no background. Values 1-999 refer to the index of a fill style, and values 1001 and above refer to the index of a background fill style (with 1001 corresponding to the first background fill style). Below is a reference from a master slide to the second background fill style (<p:bgRef idx="1002">).

<p:cSld>

<p:bg>

<p:bgRef idx="1002">

<a:schemeClr val="bg2"/>

</p:bgRef>

</p:bg>

<p:spTree>

. . .

</p:spTree>

</p:cSld>

The corresponding background fill style within the theme part is a gradient fill. See [DrawingML - Shapes - Gradient Fill](drwSp-GradFill.md). The <a:schemeClr val="bg2"/> from above indicates the color to be used in the gradient fill. Here the sample says to use the second background color of the color scheme. That background color is found within the master slide's color map (<p:clrMap>). In the example, the color map of the master slide looks like this:

<p:clrMap bg1="dk1" tx1="lt1" bg2="dk2" tx2="lt2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>

The color dk2 is specified in the theme part as:

<a:clrScheme name="Foundry">

. . .

<a:dk2>

<a:srgbClr val="676A55"/>

</a:dk2>

. . .

</a:clrScheme>

![Slide background - bgRef](pptxImages\ppSlide-background2.gif)

Footer
