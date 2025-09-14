# Wordprocessing Tables

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Cells

Table cells contain the table content and are specified by the <w:tc> element. A table cell must contain at least one block-level element, even if it is an empty &ltp/>. A cell can contain any block-level content, including nested paragraphs and tables.

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

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.66.

Word 2007 Example:

![Table Cell](images\wp-tableCell-1.gif)

---

### Elements:

The <w:tc> element can contain a whole host of elements, mostly related to tracking revisions and adding custom XML. The core elements are shown below.

| Element | Description                                                                                                                                                                                                                                                                           |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| p       | Specifies a paragraph of content for the cell See [Paragraph](WPparagraph.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.22.                                                                                                 |
| tbl     | Specifies a table as content for the cell. See [Table](WPtable.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.38.                                                                                                              |
| tcPr    | Specifies the properties to be applied to the current cell. Such properties override conflicting table or row properties. See [Table Cell Properties](WPtableCellProperties.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.70. |

### Attributes:

The <w:tc> element can contain one attribute.

| Attribute | Description                                                                                                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id        | Specifies a unique identifier for the cell. It must be unique within a table, and is used to identify the cell as a header cell for other cells in the table using the headers element. E.g., <w:tc w:id="januaryeight">. |

---

# Related Open Document Format (ODF) Property:

A table cell is defined with a <table:table-cell> element within a <table:table-row> element.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 9.1.4.

<table:table table:name="Table1" table:style-name="Table1">

<table:table-column table:style-name="Table1.A" table:number-columns-repeated="3"/>

<table:row>

<table:table-cell table:style-name="Table1.A1" office:value="string">

<text:p text:style-name="Table_20_Contents">AAA</text:p>

</table:table-cell>

. . .

<table:row>

. . .

</table:table>

### Attributes:

The most commonly used attributes are below.

| Attributes                    | Description                                                                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| table:number-columns-spanned  | Specifies the number of columns a cell spans. Note than when the value is greater than one, a <table:covered-table-cell> must appear in the table to represent the covered cell. |
| table:number-rows-spanned     | Specifies the number of rows a cell spans. Note than when the value is greater than one, a <table:covered-table-cell> must appear in the table to represent the covered cell.    |
| table:style-name              | Specifies a style for the cell.                                                                                                                                                  |
| table:number-columns-repeated | Specifies the number of successive columns in which a cell is repeated                                                                                                           |

### Elements:

The most commonly used elements are below.

| Element                   | Description                     |
| ------------------------- | ------------------------------- |
| <table:table>             | Specifies a table.              |
| <text:h>                  | Specifies a heading.            |
| <text:list>               | Specifies a list.               |
| <text:numbered-paragraph> | Specifies a numbered paragraph. |
| <text:p>                  | Specifies a paragraph.          |
| <text:section>            | Specifies a section.            |
| <text:table-of-content>   | Specifies a table of contents.  |

# Related HTML/CSS Property:

<td>AAA</td>
