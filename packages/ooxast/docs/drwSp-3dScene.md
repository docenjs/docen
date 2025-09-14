# DrawingML Shapes

3D Scene Properties

The optional 3D scene properties relate to the way the shape is situated in relation to the viewer--things such as the background, the perspective of the viewer, and the lighting. They are specified within a container <a:scene3d> element, which is within the <a:spPr> (shape properties) element. There are three possible 3D scene properties--backdrop (not covered here), a camera, and a light rig. Each is a child element of <a:scene3d>. Below is a shape with a camera position set at the preset isometric LeftDown, but which has been rotated from the preset position, and preset "sunset" lighting from the top.

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

<a:camera prst="isometricLeftDown"></a:camera>

<a:lightRig rig="sunset" dir="t"/>

</a:scene3d>

<a:sp3d extrusionH="254000"/>

</xdr:spPr>

. . .

</xdr:sp>

![Shape size](drwImages\drwSp-3Dscene1.gif)

## Camera

The placement and properties of the camera in the 3D scene modifiy the view of the scene and are specified with the <a:camera> element. There are a number of preset cameral placement positions which can be specified with the prst attribute. They define a starting point for common preset rotations in space. Possible values include:

- isometricBottomDown
- isometricBottomUp
- isometricLeftDown
- isometricLeftUp
- isometricOffAxis1Left
- isometricOffAxis1Right
- isometricOffAxis1Top
- isometricOffAxis2Left
- isometricOffAxis2Right
- isometricOffAxis2Top
- isometricOffAxis3Bottom
- isometricOffAxis3Left
- isometricOffAxis3Right
- isometricOffAxis4Bottom
- isometricOffAxis4Left
- isometricOffAxis4Right
- isometricRightDown
- isometricRightUp
- isometricTopDown
- isometricTopUp
- obliqueBottom
- obliqueBottomLeft
- obliqueBottomRight
- obliqueLeft
- obliqueRight
- obliqueTop
- obliqueTopLeft
- obliqueTopRight
- orthographicFront
- perspectiveAbove
- perspectiveAboveLeftFacing
- perspectiveAboveRightFacing
- perspectiveBelow
- perspectiveContrastingLeftFacing
- perspectiveContrastingRightFacing
- perspectiveFront
- perspectiveHeroicExtremeLeftFacing
- perspectiveHeroicExtremeRightFacing
- perspectiveHeroicExtremeLeftFacing
- perspectiveHeroicRightFacing
- perspectiveLeft
- perspectiveRelaxed
- perspectiveRelaxedModerately
- perspectiveRight

The preset placement can be altered by specifying a child <a:rot> element. The <a:rot> element defines a rotation by specifying a latitude coordinate (a lat attribute), a longitude coordinate (a lon attribute), and a revolution (a rev attribute) about the axis. Each attribute is in 60000ths of a degree. For example, the above shape specifies a preset placement of isometricLeftDown but does not alter that with a <a:rot> element. Let's add a revolution of 2700000 or 45 degrees:

<a:scene3d>

<a:camera prst="isometricLeftDown">

<a:rot lat="2100000" lon="2700000" rev="2700000"/>

</a:camera>

</a:scene3d>

![Shape size](drwImages\drwSp-3Dscene2.gif)

A zoom can be applied to the cameral position by adding a zoom attribute to the <a:camera> element. It is a percentage. Below is the first shape from above, but with a 200% zoom.

<a:scene3d>

<a:camera prst="isometricLeftDown" zoom="200%"></a:camera>

<a:lightRig rig="sunset" dir="t"/

</a:scene3d>

![Shape size](drwImages\drwSp-3Dscene3-zoom.gif)

Finally, the field of view can be modified from the view set by the preset camera setting by adding a fov attribute to the <a:camera> element. Values are in 60000ths of a degree, ranging from 0 to 180 degrees.

## Light Rig

A light rig is relevant when there is a 3D bevel. The light rig defines the lighting properties associated with a scene and is specified with the <a:lightRig> element. It has a rig attribute which specifies a preset group of lights oriented in a specific way relative to the scene. Possible values are:

- balanced
- brightRoom
- chilly
- contrasting
- flat
- flood
- freezing
- glow
- harsh
- legacyFlat1 through legacyFlat4
- legacyHarsh1 through legacyHarsh4
- legacyNormal1 through legacyNormal4
- morning
- soft
- sunrise
- sunset
- threePt
- twoPt

The direction from which the light rig is oriented in relation to the scene is specified with the dir attribute. It defines the orientation of the light as a whole, not individual lights within the rig. So, for example, if the direction if the light rig is left, that does not guarantee the light is coming from the left side, but rather the orientation of the rig as a whole is rotated to the left. Possible values are:

- b (bottom)
- bl (bottom left)
- br (bottom right)
- l (left)
- t (top)
- tl (top left)
- tr (top right)

Finally, as with the <a:camera> element, the <a:lightRig> element can contain a <a:rot> child element which defines a rotation with its attributes lat, lon, and rev. See discussion of <a:camera> element above for details. Below is a sample <a:lightRig> using the preset freezing.

<a:scene3d>

<a:camera prst="orthographicFront"/>

<a:lightRig rig="freezing" dir="t">

<a:rot lat="0" lon="0" rev="3000000"/>

</a:lightRig>

</a:scene3d>

![Shape size](drwImages\drwSp-3Dscene6-lightRig.gif)

If we change coordinates of the rotation point, we get the following.

<a:scene3d>

<a:camera prst="orthographicFront"/>

<a:lightRig rig="freezing" dir="t">

<a:rot lat="2100000" lon="2700000" rev="3000000"/>

</a:lightRig>

</a:scene3d>

![Shape size](drwImages\drwSp-3Dscene7-lightRig.gif)
