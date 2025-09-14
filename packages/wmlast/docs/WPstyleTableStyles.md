# Wordprocessing Styles

Defining a Style - Table Styles

Table styles apply to the contents of tables and have a type attribute value of table. There are first table properties (within the tblPr element) which apply to the table as a whole; there are row-level properties (within the trPr element) which apply to table rows; and there are table cell-level properties (within the tcPr element) which apply to table cells. All three of these property types are within the style element and are always applied (though they may be overridden by other properties).

#### Conditional Formatting

Table styles can also define conditional properties (within the tblStylePr element). These styles are applied to different regions of the table. The regions are shown below.

| Top left cell    | Header row | Top right cell    |
| ---------------- | ---------- | ----------------- |
| First column     | Table body | Last column       |
| Bottom left cell | Footer row | Bottom right cell |

Rows within a table can also have conditional formatting on an alternating row/column basis to achive a banded effect. For example, the sample below has banded rows and columns, with the odd rows and columns having formatting applied.

![Table Conditional Formatting](images\wp-tableCondFormatting-1.gif)

---

Table styles are referenced or applied by including the <w:tblStyle> element within a table's properties element (<w:tblPr>) within the content. For example, below is the definition of a table style within the styles part that defines a non-conditional format consisting of a top and bottom border, and conditional formatting for the first row that consists of bolding and red shading for table cells.

<w:style w:type="table" w:styleId="TestTableStyle">

<w:name w:val="Test Table Style"/>

<w:basedOn w:val="TableNormal"/>

<w:tblPr>

<w:tblBorders>

<w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>

<w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>

</w:tblBorders>

</w:tblPr>

<w:tblStylePr w:type="firstRow">

<w:rPr>

<w:b/>

</w:rPr>

<w:tcPr>

<w:shd w:val="clear" w:color="auto" w:fill="ED1C24"/>

</w:tcPr>

</w:tblStylePr>

</w:style>

The above table style is then applied in content as shown below. Note in particular the <w:tblLook> element. Conditional formatting as defined in the <w:tblStylePr> can be applied or not as specified in the table referencing the style using the <w:tblLook> element. In that sense the formatting is "conditioned" on the referencing table. For example, in the sample above, the non-conditional border formatting must be applied unless it is overridden. However, the bold and shade formatting for the first row may or may not be applied, based upon whether the <w:tblLook> element contains a value of true for its firstRow attribute.

<w:tbl>

<w:tblPr>

<w:tblStyle w:val="TestTableStyle"/>

<w:tblW w:w="0" w:type="auto"/>

<w:tblLook w:firstRow="true"/>

</w:tblPr>

</w:tbl>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.7.6.

### Child Elements of Table Styles (<w:style w:type="table">):

| Element    | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tblPr      | Specifies the set of table properties which are not conditional and are always applied (though they may be overridden by conditional formatting). For the details, see [Tables - Properties](WPtableProperties.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.7.6.4.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| tcPr       | Specifies the set of table cell properties which are not conditional and are always applied (though they may be overridden by conditional formatting). For the details, see [Tables - Cell Properties](WPtableCellProperties.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.7.6.9.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| trPr       | Specifies the set of table row properties which are not conditional and are always applied (though they may be overridden by conditional formatting). For the details, see [Tables - Row Properties](WPtableRowProperties.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.7.6.11.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| tblStylePr | Specifies a set of table properties which are conditionally applied to the parts of a table matching the requirements of the type attribute. For the details, see [Styles - Defining a Style - Table Styles - Conditional Properties](WPstyleTableStylesCond.md). ![](images/note.png)Note: There may be multiple instances of this element, one for each region. <w:style w:type="table" w:styleId="TestTableStyle"> . . . <w:tblStylePr w:type="firstRow"> . . . </w:tblStylePr <w:tblStylePr w:type="lastRow"> . . . </w:tblStylePr </w:style> The actual application of each of these sets of conditional formatting in a given table that references the style is determined by the attributes of the tblLook element within the tblPr of the table. See [.](WPtblLook.md) Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.7.6.11. |

### Related HTML/CSS property:

<ol>

<li style="list-style-type:upper-roman;">This is the first level.</li>

<li style="list-style-type:upper-alpha; margin-left:2cm;">This is the second level.</li>

<li style="list-style-type:decimal; margin-left:4cm;">This is the third level.</li>

</ol>

HTML/CSS Example:

| Column 1 header | Column 2 header | Column 3 header |
| --------------- | --------------- | --------------- |
| AAA             | BBB             | CCC             |
| DDD             | EEE             | FFF             |
| GGG             | HHH             | III             |
