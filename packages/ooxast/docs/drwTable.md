![PresentationXML.com](images\PresentationMLBanner.png)

# DrawingML Tables

Tables in DrawingML are found mostly within presentations. The core table model is defined within the main drawingML namespace (xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main) at section 21.1 of the ECMA OOXML specification (3rd edition). As noted at the [overview of DrawingML](drwOverview.md), OOXML has three different table models--one for wordprocessing, one for spreadsheets, and one for drawingML (used mostly in presentationML documents). The drawingML table model is similar to the wordprocessing model, but it allows for the application of drawingML effects on the tables or cells.

A table is added to a presentation slide within a <p:graphicFrame> container, within the main presentationML namespace (prefix 'p'). Within the<p:graphicFrame> container is a <a:graphic> element in the drawingML namespace. And within that element is the <p:graphicData> element with its uri attribute that declares the type of data as table data: uri="http://schemas.openxmlformats.org/drawingml/2006/table".

The <p:graphicFrame> container is within the shape tree for the slide (<p:spTree>), along with other shapes and pictures found on the slide. The shape tree element is itself contained within the slide's common slide data container element <p:cSld>. See the [DrawingML Overview](drwOverview.md) and [Drawing Object Placement](drwPicInPresentation.md) for details of placement of tables. Below is a sample presentation slide with one shape and one table.

<p:sld . . . >

. . .

<p:cSld>

<p:spTree>

<p:sp>

. . .

</p:sp>

<p:graphicFrame>

. . .

<a:graphic>

<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/table">

<a:tbl>

<. . .

</a:tbl>

</a:graphicData>

</a:graphic>

</p:graphicFrame>

</p:spTree>

</p:cSld>

. . .

</p:sld>

![DrawingML - Table](drwImages\drwTable.gif)

The table itself is defined within the <a:tbl> element, which itself contains a definition of the table structure (within a <a:tblGrid> element), table properties (within a <a:tblPr> element), and content (within one or more <a:tr> table row elements). A drawingML table can contain only text.
