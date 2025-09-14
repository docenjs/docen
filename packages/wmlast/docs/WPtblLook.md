# Wordprocessing Tables

Conditional Formatting

Tables can be conditionally formatted based on such things as whether the content is in the first row, last row, first column, or last column, or whether the rows or columns are to be banded (i.e., formatting based on how the previous row or column was formatted). Such conditional formatting for tables is defined in the referenced style for the table. See [Table Styles](WPstyleTableStyles.md). So a table may specify its style as LightShading-Accent3 (<w:tblStyle w:val="LightShading-Accent3"/>). Inside LightShading-Accent3 may be a style for the first row (<w:tblStylePr w:type="firstRow"/>).

A given table which references the LightShading-Accent3 may or may not use that style for the first row based on the attributes for the <w:tblLook> element within the <w:tblPr> element. Since the firstRow attribute is set to true, the conditional formatting will be applied.

<w:tblPr>

<w:tblLook w:firstRow="true" w:lastColumn="true" w:noVBand="true"/>

</w:tblPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.56.

Word 2007 Example:

![Table Conditional Formatting](images\wp-tblLook-1.gif)

---

### Attributes:

![](images/note.png)Note: The default setting is to apply the row and column banding but NOT the first row, last row, first column, or last column formatting.

![](images/versionConflict3.png)Note: In the 2003 version of the standard, this element has a single attribute (val) which specifies a hexadecimal code containing a bitmask of options. The above example would be <w:tblLook w:val="0520"/>.

| Attribute   | Description                                                                         |
| ----------- | ----------------------------------------------------------------------------------- |
| firstColumn | Specifies that the first column conditional formatting should be applied.           |
| firstRow    | Specifies that the first row conditional formatting should be applied.              |
| lastColumn  | Specifies that the last column conditional formatting should be applied.            |
| lastRow     | Specifies that the last row conditional formatting should be applied.               |
| noHBand     | Specifies that the horizontal banding conditional formatting should not be applied. |
| noVBand     | Specifies that the vertical banding conditional formatting should not be applied.   |

### Related HTML/CSS property:

There is no directly corresponding mechanism for controlling the styling of HTML rows and columns. Banding and first and last row and column formatting must be done using some combination of style classes and scripting.
