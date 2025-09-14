# DrawingML Object Positioning

Positioning within a Word Processing Document - Floating Objects

Floating objects are anchored within the text but can be absolutely positioned in the document relative to the page. They are inserted into a <w:drawing> element with a <wp:anchor> element. The child elements determine the placement.

<w:drawing>

<wp:anchor distT="0" distB="0" distL="0" distL="114300" distR="114300" simplePos="0" relativeHeight="251658240" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1">

<wp:simplePos x="1847850" y="914400"/>

<wp:positionH relativeFrom="margin">

<wp:align>right</wp:align>

</wp:positionH>

<wp:positionV relativeFrom="margin">

<wp:align>top</wp:align>

</wp:positionV>

<wp:extent cx="2438400" cy="1828800"/>

<wp:effectExtent l="19050" t="0" r="0" b="0"/>

<wp:wrapSquare wrapText="bothSides"/>

<wp:docPr id="1" name="Picture 0" descr="Blue hills.jpg"/>

<wp:cNvGraphicFramePr>

<a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/>

</wp:cNvGraphicFramePr>

<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">

<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">

<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">

. . .

</pic:pic>

</a:graphicData>

</a:graphic>

</wp:anchor>

</w:drawing>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.4.2.3.

Word 2007 Example:

Below is an example of a picture that is floating.

![Floating Picture](drwImages\drwFloat.gif)

The <wp:anchor> element can have a number of attributes related to positioning, overlaping of objects, and the distance between the picture and the surrounding text.

### Attributes:

| Attribute                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| allowOverlap                   | Specifies whether a drawingML object which intersects another object is allowed to overlap. Possible values are true and false.                                                                                                                                                                                                                                                                                                                                              |
| behindDoc                      | Specifies whether a drawingML object is displayed behind text in cases of overlapping. If the object should be on top, the value should be false. Below is an example of a picture with behindDoc="0", followed by a picture with behindDoc="1". Text wrapping in both examples is <wp:wrapTight> and simplePos="1". ![behindDoc is false](drwImages\drwFloat-behindDocF.gif) ![behindDoc is true](drwImages\drwFloat-behindDocT.gif)                                        |
| distB, distL, distR, and distT | Specifies the minimum distance between the bottom, left, right, and top edges of the object and the text. Specified in EMUs. The example below specifies an inch from the left (distL="914400"). ![Floating Picture - distB](drwImages\drwFloat-distB.gif)                                                                                                                                                                                                                   |
| hidden                         | Specifies whether a drawingML object is displayed or hidden. Note that an application can have settings which allow the object to be viewed notwithstanding this attribute.                                                                                                                                                                                                                                                                                                  |
| layoutInCell                   | Specifies how the object behaves when it is anchored in a table cell and its position would cause it to intersect with a table cell. The value can be either true or false. If it is true, then the object is positioned within the cell and the cell is resized, with all positioning relative to the cell and not the line on which the table appears. When false, the object is positioned as specified, and the table is resized or relocated to accommodate the object. |
| locked                         | Specifies that the anchor location shall not be modified. For example, applications might want to move the object to another page based upon user actions, and this attribute tells the application not to do that. The value can be either true or false.                                                                                                                                                                                                                   |
| relativeHeight                 | Specifies the Z-ordering or the order of display when objects overlap. Note that this is only relevant for objects that have the same value for the behindDoc attribute. All objects with a behindDoc value of false are displayed above objects with a value of true. Values are integers; a higher value gets greater priority for displaying.                                                                                                                             |
| simplePos                      | The value of the attribute can be either true or false, and when true, the object will be positioned using the information found within a child <wp:simplePos> element. See [Floating Pictures - Positioning](drwPicFloating-position.md) for more on floating picture positioning.                                                                                                                                                                                          |

Below are the possible child elements of <wp:anchor>.

### Elements:

| Element         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cNvGraphicFrame | Specifies locking properties for a picture. The <wp:cNvGraphicFrame> element contains an empty <a:graphicFrameLocks/> element with a number of possible attributes that determine the locking properties. If the attributes are not specified, then it is assumed that the properties can be changed. For example, to disallow changing the aspect ratio, specify the noChangeAspect attribute as true. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.4.2.4. The following are the most useful attributes: |

- noChangeAspect - Note: Microsoft Office ignores this attribute when a user resizes by direct manipulation by dragging the mouse, but it does not ignore it if a user resizes by entering the desired dimensions.
- noCrop
- noMove - Note: Microsoft Office does not implement and will ignore this attribute.
- noResize - Note: Microsoft Office does not implement and will ignore this attribute.
- noRot (no rotation)
- noSelect

An example of locking the aspect ratio is below. <wp:cNvGraphicFramePr> <a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/> </wp:cNvGraphicFramePr> Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.1.2.2.19.  
docPr | Specifies common non-visual DrawingML properties. See also [Pictures - Image Properties - Non-Visual Properties](drwPic-nvPicPr.md). An id, name, title and description for a picture can be specified with attributes on the <wp:docPr> element: <wp:docPr id="222" name="Blue hills.jpg" title="This is the title" descr="This is the description"/>. The id is an integer and specifies a unique identifier. The name is a string and typically stores the original file name. The title is a string that specifies teh caption. The descr is alternative text used for assistive technologies which do not display the picture. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.4.2.5.  
effectExtent | Specifies the amount which should be added to each edge of the image when a drawing effect is applied to the image. The size of the image is specified with the <wp:extent> element. The additional size needed to accommodate an effect is stored in the <wp:effectExtent> element, and will be used to calculate the appropriate line height for inline objects or wrapping. The element has four attributes, each storing a value of length in EMUs: b (bottom), l (left), r (right), and t (top). Below is an image with a reflection applied to the bottom, and an addition 781050 EMUs to accommodate the reflection. <wp:extent cx="2438400" cy="1828800"/> <wp:effectExtent l="0" t="0" r="0" b="781050"/> ![Effect Extent](drwImages\drwEffectExtent.gif) Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.4.2.6.  
extent | Specifies the height and width of the object using two attributes: cx for length of the rectangle in EMUs and cy for the width of the rectangle in EMUs. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.4.2.7.  
graphic | Specifies a single graphic object. The specification for the object is up to the document author/application. It can contain a <a:graphicData> element, which itself can contain any element in any namespace and which also has a uri attribute that is used to identify the stored data or the "server" that can process the contents of the tag. For Microsoft Word, pictures are specified within the pic namespace (xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"). Other sorts of graphics can be inserted, such as charts. <a:graphic xmlns:a=http://schemas.openxmlformats.org/drawingml/2006/main"> <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"> <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"> . . . </pic:pic> </a:graphicData> </a:graphic> Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.1.2.2.16.  
positionH, positionV, simplePos | See [Floating Pictures - Positioning](drwPicFloating-position.md) for the child elements related to positioning.  
wrapNone, wrapSquare, wrapThrough, wrapTight, and wrapTopAndBottom | See [Floating Pictures - Text Wrapping](drwPicFloating-textWrap.md) for the child elements related to text wrapping.
