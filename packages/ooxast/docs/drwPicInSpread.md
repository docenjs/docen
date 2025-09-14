# DrawingML Object Positioning

Positioning within a Spreadsheet Document

All drawing objects for a worksheet are within one drawing part. There are as many drawing parts as there are worksheets containing drawing objects. (Note that the actual data for, e.g., an image, is stored separately, typically within a media sub-folder of the package--for Word, within a media sub-folder.)

![File structure for drawing in spreadsheet](drwImages\drwInSpread-fileStruct.gif)

The worksheet part will contain a <drawing> element with a relationship ID attribute referencing a relationship.

<worksheet . . .>

. . .

<drawing r:id="rId1"/>

. . .

</worksheet>

The relationships (.rels) part for the worksheet contains the relationship referencing the target drawing part.

<Relationships . . .>

<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>

</Relationships>

Within the drawings part (drawing1.xml) the container element is a root <xdr:wsDr> element. The namespace for pictures within a worksheet is: xlms:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing". There are three possible child elements representing three different ways that an object can be anchored within a worksheet.

1. <wp:absoluteAnchor> \- used to anchor the object absolutely in the same position in the sheet; does not move or size with cells
2. <wp:oneCellAnchor> \- used to anchor to a single cell; moves with cells
3. <wp:twoCellAnchor> \- used to anchor to two cells; moves with cells

<xdr:wsDr xlms:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing xlms:a="http://schemas.openxmlformats.org/drawingml/2006/main">

<xdr:twoCellAnchor editAs="oneCell">

. . .

</xdr:twoCellAnchor>

</xdr:wsDr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.5.2.35.
