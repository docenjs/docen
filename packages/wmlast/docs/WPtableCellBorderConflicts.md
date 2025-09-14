# Wordprocessing Tables

Table Border Conflicts

When a table or a table row (table-level exception) specifies a border and individual cells also specify borders, there is a possiblity for conflict. The OOXML specification specifies how such conflicts are to be resolved.

Note first that if [cell spacing](WPtableCellSpacing.md) is non-zero, then both the cell border and the table border can be displayed without conflict.

Word 2007 Example:

![Sample table cell border conflicts](images\wp-tableCellBorderConflicts-1.gif)

---

### Conflicts between cell borders and table and table-level exception borders

If the cell spacing is zero, then there is a conflict. The following rules apply as between cell borders and table and table-level exception (row) borders:

- If there is a cell border, then the cell border is displayed.
- If there is no cell border but there is a table-level exception border on the row, then that table-level exception border is displayed.
- If there is no cell or table-level exception border, then the table border is displayed.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.40.

### Conflicts between adjacent cells

Conflicts between borders of adjacent cells are resolved by first assigning weights to each according to their style; the cell border with the greatest weight prevails. If the weights are equal, then the borders are compared by brightness values; the border with the the smaller brightness value wins. If brightness factors are equal, then the first border in reading order is displayed.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.67.

### Related CSS property:

If borders are not collapsed and there is sufficient spacing between cells, there is no conflict between borders. (Note that HTML rows cannot have borders--only tables and cells.)

<table style="width: 100%; height:50px; border-collapse:separate; border:2px dashed #0000FF; border-spacing:10px; empty-cells:show;">   
<tr><td>style="border-bottom:1px double #FF00FF; border-top:1px double #FF00FF; border-left:2px solid #FF0000; border-right:2px solid #FF0000;">AAA</td>   
<tr><td>style="border-bottom:1px double #FF00FF; border-top:1px double #FF00FF; border-left:2px solid #FF0000; border-right:2px solid #FF0000;">BBB</td>   
. . . </tr>   
. . .   
</table>

CSS Example:

| AAA | BBB | CCC |
| --- | --- | --- |
| EEE | FFF | DDD |

<table style="width: 100%; height:50px; border-collapse:collapse; border:2px dashed #0000FF;">   
<tr><td>style="border-bottom:1px double #FF00FF; border-top:1px double #FF00FF; border-left:2px solid #FF0000; border-right:2px solid #FF0000;">AAA</td>   
<tr><td>style="border-bottom:1px double #FF00FF; border-top:1px double #FF00FF; border-left:2px solid #FF0000; border-right:2px solid #FF0000;">BBB</td>   
. . .   
</table>

CSS Example:

| AAA | BBB | CCC |
| --- | --- | --- |
| EEE | FFF | DDD |
