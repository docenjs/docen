# DrawingML Object Positioning

Positioning within a Word Processing Document - Inline

Inline objects are inline with the text and affect the line height and layout of the line, just as a character of the same size would affect the line. They are inserted into a <w:drawing> element with a <wp:inline> element.

<w:drawing>

<wp:inline distT="0" distB="0" distL="0" distR="0">

<wp:extent cx="2438400" cy="1828800"/>

<wp:effectExtent l="19050" t="0" r="0" b="0"/>

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

</wp:inline>

</w:drawing>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.4.2.8.

Word 2007 Example:

Below is an example of a picture that is inline.

![Inline Picture](drwImages\drwInline.gif)

The <wp:inline> element can have a number of attributes related to the distance between the picture and the surrounding text. However, they have no effect when the picture is displayed inline. The attributes can be maintained and will have effect in the event that the picture is changed to be floating.

Below are the possible child elements of <wp:inline>.

### Elements:

| Element         | Description                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| cNvGraphicFrame | Specifies locking properties for a picture. The <wp:cNvGraphicFrame> element contains an empty <a:graphicFrameLocks> element with a number of possible attributes that determine the locking properties. If the attributes are not specified, then it is assumed that the properties can be changed. For example, to disallow changing the aspect ratio, specify the noChangeAspect attribute as true. |

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.4.2.4. The following are the most useful attributes:

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
graphic | Specifies a single graphic object. The specification for the object is up to the document author/application. It can contain a <a:graphicData> element, which itself can contain any element in any namespace and which also has a uri attribute that is used to identify the stored data or the "server" that can process the contents of the tag. For Microsoft Word, pictures are specified within the pic namespace (xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"). Other sorts of graphics can be inserted, such as charts. Microsoft Office supports a specific set of uri values, including values for pictures, charts, diagrams, etc. <a:graphic xmlns:a=http://schemas.openxmlformats.org/drawingml/2006/main"> <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"> <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"> . . . </pic:pic> </a:graphicData> </a:graphic> Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.1.2.2.16.
