# DrawingML Shapes

Text - Body Properties - Fit, Wrap, Warp and 3D

## Text Fit:

Text within a shape can be specified so that it is automatically scaled to fit within the text box. Alternatively the shape can be scaled to fit the text. Scaling of text can also be turned off so that text outside of the text box is not displayed. In fact, that is the default behavior--no scaling. Finally, there are two attributes that affect the fit of text horizonally and vertially. (Note also that text wrapping can affect whether text remains within the box. See text wrapping, below.) First we discuss the overall scaling that is specified with child elements of <a:bodyPr>.

To scale the text, add <a:normAutoFit> as a child of <a:bodyPr>. There are two attributes which affect the scaling. First, you can specify the percentage of the original font size to which the text is scaled with the fontScale attribute, specified as a percent. (If omitted, the value is assumed to be 100%.) Second, specify the percent by which the line spacing of paragraphs is reduced with the lnSpcReduction attribute, also a percent. (If omitted, the value is assumed to be 0%.)

<xdr:txBody>

<a:bodyPr vertOverflow="clip" rtlCol="0" anchor="ctr">

<a:normAutoFit fontScale="75%" lnSpcReduction="20%"/>

</a:bodyPr>

<a:lstStyle/>

<a:p>

<a:pPr algn="l"/>

<a:r>

<a:rPr lang="en-US" sz="1100"/>

<a:t>This is a paragraph of text within the shape.</a:t>

</a:r>

</a:p>

<a:p>

<a:pPr algn="ctr"/>

<a:r>

<a:rPr lang="en-US" sz="1100"/>

<a:t>This is the second paragraph.</a:t>

</a:r>

</a:p>

</xdr:txBody>

Below is an example of a shape with text. The text fits within the box.

![Shape with text](drwImages\drwSp-text-fit1.gif)

Below is the same shape, but with an additional paragraph of text. When we specify <a:normAutoFit fontScale="75%" lnSpcReduction="20%"/>, the text is scaled to fit within the shape, as shown below.

![Shape with text - text scaling](drwImages\drwSp-text-fit4.gif)

If we turn off scaling by replacing <a:normAutoFit> with <a:noAutoFit />, the text no longer fits within the box, as shown by the two images below.

![Shape with text](drwImages\drwSp-text-fit2.gif) ![Shape with text](drwImages\drwSp-text-fit3.gif)

If instead we want the shape itself to scale to the text, then we add <a:spAutoFit />. Below is the shape with the additional third paragraph, but also an additional fourth and fifth paragraphs typed into it. Note that with Word, the resizing does not occur until additional text is added to the shape.

![Shape with text - text scaling](drwImages\drwSp-text-fit5.gif)

In addition to the above elements which affect overall scaling, there are also two attributes of <a:bodyPr> which affect the fit of text within a shape. They are horzOverflow and vertOverflow. They determiine whether text can flow out of the bounding box horizonally and vertically. Possibly values for horzOverflow are:

- clip (to clip the text at the horizonal overflow)
- overflow (allow horizontal overflow--the default)

Possibly values for vertOverflow are:

- clip (to clip the text at the vertical overflow)
- ellipsis (to use an ellipsis to denote that there is text which is not visible)
- overflow (allow vertical overflow--the default)

Below is a sample shape with excess text, first with the default behaviors. The second example shows the shape with vertical overflow set to clip (<a:bodyPr rtlCol="0" anchor="ctr" vertOverflow="clip"/>). The third example shows the shape with vertical overflow set to ellipsis (<a:bodyPr rtlCol="0" anchor="ctr" vertOverflow="ellipsis"/>).

![Shape with text - text overflow](drwImages\drwSp-text-over1.gif)

![Shape with text - text overflow](drwImages\drwSp-text-over2.gif) ![Shape with text - text overflow](drwImages\drwSp-text-over3.gif)

## Text Wrap:

Text wrapping may be turned on or off with the wrap attribute on <a:bodyPr>. Possible values are square and none. By default text is wrapped inside the bounding box (<a:bodyPr . . . wrap="square" />). Below is a shape with wrapping turned off (<a:bodyPr . . . wrap="none" />).

![Shape with text - text wrap](drwImages\drwSp-text-wrap1.gif)

## Text Warp:

A piece of text within a shape can be warped by specifying a preset shape to be applied to the text, thereby warping the text. This is done by including the <a:prstTxWarp> element as a child of <a:bodyPr>. The actual shape to apply as the warping effect is given in the prst attribute of <a:prstTxWarp>. Possible values are given below. Note that a list of shape adjustment values (<a:avLst>) can be specified as a child element of <a:prstTxWarp>. These adjustment values are not covered here.

- textArchDown
- textArchDownPour
- textArchUp
- textArchUpPour
- textButton
- textButtonPour
- textCanDown
- textCanUp
- textCascadeDown
- textCascadeUp
- textChevron
- textChevronInverted
- textCircle
- textCirclePour
- textCurveDown
- textCurveUp
- textDeflate
- textDeflateBottom
- textDeflateInflate
- textDeflateInflateDeflate
- textDeflateTop
- textDoubleWave1
- textFadeLeft
- textFadeRight
- textFadeUp
- textInflate
- textInflateBottom
- textInflateTop
- textNoShape
- textPlain
- textRingInside
- textRingOutside
- textSlantDown
- textSlantUp
- textStop
- textTriangle
- textTriangleInverted
- textWave1
- textWave2
- textWave4

Below is some text with a downward arch (textArchDown) applied to the text.

<xdr:txBody>

<a:bodyPr vertOverflow="clip" rtlCol="0" anchor="ctr">

<a:prstTxWarp prst="textArchDown"/>

<a:avLst/>

</a:prstTxWarp>

</a:bodyPr>

<. . .;

</xdr:txBody>

![Shape with text](drwImages\drwSp-text-warp1.gif)

## Line Spacing:

There are a couple of attributes on <a:bodyPr> that affect the spacing of lines of text within a shape. First, spcFirstLastPara determines whether the spacing between paragraphs as specified by the user is respected for the first and last paragraphs within the shape. If the attribute value is set to false (the default), then the paragraph spacing is not respected for the first and last paragraphs. Below is a shape with paragraphs of text with a specified spacing before of 12 points. The first sample respects the paragraph spacing (<a:bodyPr anchor="ctr" rtlCol="0" spcFirstLastPara="1"/>) and the second does not (<a:bodyPr anchor="ctr" rtlCol="0" spcFirstLastPara="0"/>).

![Shape with text - line spacing](drwImages\drwSp-text-lineSp2.gif) ![Shape with text - line spacing](drwImages\drwSp-text-lineSp1.gif)

There is also a compatLnSpc attribute which specifies whether line spacing is determined in a simplistic mmaer using the font scene. Values are either trust or false (the default).

## Anti-Aliased Text:

Text within a shape can be forced to be rendered anti-aliased regardless of the font size by specifying the forceAA attribute on <a:bodyPr>. A value of true will force anti-aliasing; the default is false.

## 3D Properties:

As with shapes, it is possible to specify 3D properties for text within shapes. They are specified for text within shapes just as they are with the shapes, except that the containing element is the <a:bodyPr> element rather than the <a:spPr> element. See [3D Shape Properties](drwSp-3dProps.md) for details on extrusion, contours, and bevels. See [3D Scene Properties](drwSp-3dScene.md) for details on camera and light rig. Note that there is also a <a:flatTx> element to indicate that there should be no text in a 3D scene. It is an empty child element of span class="featuredItem"><a:bodyPr>.

Below is a sample shape with text that has 3D properties.

<xdr:txBody>

<a:bodyPr rtlCol="0" anchor="ctr">

<a:scene3d>

<a:camera prst="isometricRightUp"/>

<a:lightRig rig="freezing" dir="t">

<a:rot lat="0" lon="0" rev="15600000"/>

</a:lightRig>

</a:scene3d>

<a:sp3d extrusionH="57150" contourW="31750" prstMaterial="softEdge">

<a:bevelT w="38100" h="38100" prst="relaxedInset"/>

<a:bevelB w="38100" h="38100" prst="coolSlant"/>

<a:extrusionClr>

<a:schemeClr val="accent2">

<a:lumMod val="6000">

<a:lumOff val="4000">

</a:schemeClr>

</a:extrusionClr>

<a:contourClr>

<a:schemeClr val="tx2">

<a:lumMod val="6000">

<a:lumOff val="4000">

</a:schemeClr>

</a:contourClr>

</a:sp3d>

</a:bodyPr>

<. . .;

</xdr:txBody>

![Shape with text in 3D](drwImages\drwSp-text-3d.gif)
