# DrawingML Object Positioning

Positioning within a Spreadsheet Document - Absolute Anchoring

An object can be anchored in a spreadsheet according to an absolute placement using coordinates with the <xdr:absoluteAnchor> element. The object does not move when cells are resized. The position is specified with the child element <xdr:pos> which is an empty element with two attributes specifying the two coordinates for the top left corner of the object: x and y. Keep in mind the drawingML coordinate system. The origin is at the top left; the x axis increases left to right and the y axis increases top to bottom. Below is an example of an absolute anchor at two inches from the left edge and a half inch from the top.

<xdr:wsDr . . .>

<xdr:absoluteAnchor>

<xdr:pos x="1828800" y="45722"/>

<xdr:ext cx="2438400" cy="1828800"/>

<xdr:pic>

. . .

</xdr:pic>

<xdr:clientData/>

</xdr:absoluteAnchor>

</xdr:wsDr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.5.2.1.

Word 2007 Example:

![Spreadsheet Picture - Absolute Anchor](drwImages\drwInSpread-absoluteAnchor.gif)

Below is an example of how the picture stays anchored when cells are resized.

![Spreadsheet Picture - Absolute Anchor - Resized cells](drwImages\drwInSpread-absoluteAnchor2.gif)

Below are the possible child elements of <xdr:absoluteAnchor>. There are no attributes (compare with [<xdr:twoCellAnchor>](drwPicInSpread-twoCell.md)).

### Elements:

| Element      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| clientData   | An empty element which specifies (via attributes) certain properties related to printing and selection of the drawing object. The fLocksWithSheet attribute (either true or false) determines whether to disable selection when the sheet is protected, and fPrintsWithSheet attribute (either true or false) determines whether the object is printed when the sheet is printed. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.5.2.3.                                       |
| contentPart  | Specifies a reference to XML content in a format not defined by the ECMA-376 specification, such as MathML or SVG content. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.5.2.12.                                                                                                                                                                                                                                                                                             |
| cxnSp        | Specifies the properties for a connection shape, such as a line, which connects two other shapes. Not discussed here. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.5.2.13.                                                                                                                                                                                                                                                                                                  |
| ext          | Specifies the length and width of the object as it is displayed (including any scaling) in EMUs. The element is an empty element with two attributes: the cx attribute giving the length and the cy attribute giving the width. E.g., <xdr:ext cx="2438400" cy="1828800"/>. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.5.2.14.                                                                                                                                            |
| graphicFrame | Specifies a graphical object frame for a spreadsheet that contains a graphical object (e.g., chart, diagram or table). Not discussed here. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.5.2.16.                                                                                                                                                                                                                                                                             |
| grpSp        | Specifies a group shape. Not discussed here. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.5.2.17.                                                                                                                                                                                                                                                                                                                                                                           |
| pic          | Specifies the existence of a picture within a spreadsheet. See [Drawing - Pictures - Overview](drwPic.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.5.2.25.                                                                                                                                                                                                                                                                                                             |
| pos          | Specifies the position of the drawingML object. This is an empty element with two attributes specifying the coordinates (x and y) in either EMUs or as a number immediately followed by a unit identifier (e.g., 2in). E.g., <xdr:pos x="1828800" y="45722"/>. Keep in mind the drawingML coordinate system. The origin is at the top left; the x axis increases left to right and the y axis increases top to bottom. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.5.2.26. |
| sp           | Specifies a shape. Not discussed here. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.5.2.29.                                                                                                                                                                                                                                                                                                                                                                                 |
