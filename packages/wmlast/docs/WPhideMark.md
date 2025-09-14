# WordprocessingTables

Hide End of Table Cell Mark

The height of a row typically cannot be reduced below the size of the end-of-cell marker. This prevents table rows from disappearing when they have no content. However, this makes it impossible to use a row as a border by shading its cells or putting an image in the cells. To overcome this problem, use the <w:hideMark /> element within the <w:tcPr /> of each cell in the row. This specifies that the end-of-cell marker should be ignored for the cell, allowing it to collapse to the height of its contents without formatting the cell's end-of-cell marker.

<w:tcPr>

<w:hideMark/>

</w:tcPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.21.

Word 2007 Example (without <w:hideMark />):

![Hide Table Cell Mark](images\wp-hideMark-1.gif)

---

Word 2007 Example (with <w:hideMark />):

![Hide Table Cell Mark](images\wp-hideMark-2.gif)

---

### Related CSS property:

No corresponding property.
