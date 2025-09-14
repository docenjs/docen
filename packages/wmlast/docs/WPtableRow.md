# Wordprocessing Tables

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Rows

A table row is defined with the <w:tr> element.

<w:tr>

<w:tc>

<w:tcPr>

<w:tcW w:w="2880" w:type="dxa"/>

</w:tcPr>

<w:p>

<w:r>

<w:t>AAA</w:t>

</w:r>

</w:p>

</w:tc>

<w:tc>

<w:tcPr>

<w:tcW w:w="2880" w:type="dxa"/>

</w:tcPr>

<w:p>

<w:r>

<w:t>BBB</w:t>

</w:r>

</w:p>

</w:tc>

<w:tc>

<w:tcPr>

<w:tcW w:w="2880" w:type="dxa"/>

</w:tcPr>

<w:p>

<w:r>

<w:t>CCC</w:t>

</w:r>

</w:p>

</w:tc>

</w:tr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.79.

Word 2007 Example:

![Table Row](images\wp-tableRow-1.gif)

---

### Elements:

The <w:tr> element can contain a whole host of elements, mostly related to tracking revisions and adding custom XML. The core elements are shown below.

| Element | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| trPr    | Specifies the row-level properties for the row. These properties affect the appearance of the cells in the row but can be overridden by individual cell-level properties. See [Table Row Properties](WPtableRowProperties.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.82.                                                                                                                                                       |
| tblPrEx | Specifies table properties for the row in place of the table properties specified in tblPr. These properties are typically used for legacy documents, as well as in cases where two independent tables are merged (to prevent the properties for the second table from being superseded by those of the first table). See [Table Property Exceptions](WPtablePropertyExceptions.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.61. |
| tc      | Specifies a table cell. See [Table Cell](WPtableCell.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.66.                                                                                                                                                                                                                                                                                                                            |

### Attributes:

The tr element can have a handful of ID elements, including rsidDel, rsidR, rsidRPr, and rsidTr. They are used for tracking editing and are omitted here.

---

# Related Open Document Format (ODF) Property:

A table row is defined with a <table:table-row> element.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 9.1.4.

<table:table table:name="Table1" table:style-name="Table1">

<table:table-column table:style-name="Table1.A" table:number-columns-repeated="3"/>

<table:row>

. . .

<table:row>

. . .

</table:table>

### Attributes:

The most commonly used attributes are below.

| Attributes                    | Description                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------ |
| table:default-cell-style-name | Specifies the cell style to be used if there is no value for table:style-name. |
| table:style-name              | Specifies a style for the row.                                                 |
| table:number-rows-repeated    | Specifies the number of successive rows to which a row element applies.        |
| xml:id                        | Specifies a unique ID and is standardized by the W3C (xml-id).                 |
| table:visibility              | Specifies whether the column is visible.                                       |

# Related HTML/CSS Property:

<tr>

<td>AAA</td>

<td>BBB</td>

<td>CCC</td>

</tr>

HTML/CSS Example:

| AAA | BBB | CCC |
| --- | --- | --- |
