# DrawingML Pictures

Image Properties - Non-Visual Properties

The <pic:nvPicPr> element within the <pic:pic> element specifies the non-visual propeties of a picture. The actual properties are within two child elements - <pic:cNvPr> and <pic:cNvPicPr>.

Note that the non-visual properties are in different namespaces, depending on the document type. The examples show the picture namespace of drawingML, with prefix 'pic'. For presentations the non-visual properties are in the main presentationML namespace with prefix 'p'. And for spreadsheets the namespace is the spreadsheet drawingML namespace with prefix 'xdr'.

<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">

<pic:nvPicPr>

<pic:cNvPr id="0" name="Blue hills.jpg"/>

<pic:cNvPicPr/>

</pic:nvPicPr>

<pic:blipFill>

. . .

</pic:blipFill>

<pic:spPr>

. . .

</pic:spPr>

</pic:pic>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.2.2.4.

## Id, Name, Title and Description

An id, name, title and description for a picture can be specified with attributes on the <pic:cNvPr> element: <pic:cNvPr id="222" name="Blue hills.jpg" title="This is the title" descr="This is the description"/>. The id is an integer and specifies a unique identifier. The name is a string and typically stores the original file name. The title is a string that specifies teh caption. The descr is alternative text used for assistive technologies which do not display the picture.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.2.2.3.

## Picture Resizing, Cropping, Rotating, Changing Aspect Ratio, Moving, Selecting

The locking properties of a picture are specified with the <a:picLocks> element within the <pic:cNvPicPr> element. Various aspects of a picture or shape's size can be specified with attributes on <a:picLocks>. If the attributes are not specified, then it is assumed that the properties can be changed. For example, to disallow changing the aspect ratio, specify the noChangeAspect attribute as true.

The following are the most useful attributes:

- noChangeAspect
- noCrop
- noMove
- noResize
- noRot (no rotation)
- noSelect

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.1.2.2.31.

Note also that the preferRelativeResize attribute on the <pic:cNvPicPr> element specifies whether the user interface should show the resizing of the picture based upon picture's current size (false) or its original size (true).

## Hidden

A picture can be hidden by specifying the hidden attribute on the <pic:cNvPr> element: <pic:cNvPr hidden="true">.
