# Wordprocessing Sections

Columns

A section can be divided into columns with the <w:cols> element.

<w:sectPr>

<w:cols w:num="3" w:space="720"/>

</w:sectPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.6.4.

Word 2007 Example:

![Sections - Columns](images\wp-sectionCols-1.gif)

---

![](images/note.png) Note: If the columns are of equal width, then the columns are specified with attributes of <w:cols>. If the columns are not equal, then each column is specified as a child <w:col> element, as shown below.

<w:sectPr>

<w:cols w:num="2" w:sep="1" w:space="720" w:equalWidth="0">

<w:col w:w="5760" w:space="720"/>

<w:col w:w="2880"/>

</w:cols>

</w:sectPr>

Word 2007 Example:

![Sections - Columns Not Equal](images\wp-sectionCols-2.gif)

---

### Attributes:

| Attribute  | Description                                                                                                                                                                                                                                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| equalWidth | Specifies whether all columns are of equal width.                                                                                                                                                                                                                                                                  |
| num        | Specifies the number of columns. If all columns are not of equal width, then the element is ignored, and the number of columns is determined by the number of <w:col> elements. ![](images/note.png) Note: Microsoft Word 2007 seems to require the attribute be set even when the columns are not of equal width. |
| sep        | Specifies whether a vertical line is to be drawn between each column. If set to true or 1, then the line is drawn in the center of the space between the columns.                                                                                                                                                  |
| space      | Specifies the spacing between columns, in twips or twentieths of a point (1/1440th of an inch). If all columns are not of equal width, then the element is ignored, and the spacing after columns is defined by the same attribute on each <w:col> element.                                                        |

### Elements:

| Element | Description                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------- |
| col     | Specifies the properties of a single column: <w:col w:space="1440" w:w="2880"/>. It has two attributes: |

- space \- the space after the column, in twentieths of a point
- w \- specifies the width, in twentieths of a point

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.6.3.

### Related HTML/CSS property:

There is no straightforward way to implement dynamic columns in HTML, i.e., columns for which text flows from one column into the other as text is entered. Static columns are implemented in HTML using tables, or using <div> elements that are floated left or right using the CSS float property (e.g., <div style="float:left;">).
