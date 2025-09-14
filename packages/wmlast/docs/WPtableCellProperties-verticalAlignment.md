# Wordprocessing Tables

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Table Cell Properties - Vertical Alignment

Vertical alingment for cell text is specified with the <w:vAlign w:val="true"/> element within the <tcPr> element.

<w:tcPr>

<w:vAlign w:val="bottom"/>

</w:tcPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.69.

Word 2007 Example:

In the example below, the first cell specifies <w:vAlign w:val="center"/> and the second specifies <w:vAlign w:val="bottom"/>.

![Table Cell Properties - Vertical Alignment](images\wp-tableCellvAlign-1.gif)

---

### Attributes:

The attributes for the above table cell margin elements are:

| Attribute | Description                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| val       | Specifies the vertical alignment for text between the top and bottom margins of the cell. Possible values are: |

- bottom \- Specifies that the text should be vertically aligned to the bottom margin.
- center \- Specifies that the text should be vertically aligned to the center of the cell.
- top \- Specifies that the text should be vertically aligned to the top margin.

---

# Related Open Document Format (ODF) Property:

Vertical alignment of cell text is set with the style:vertical-alignment attributes to the <style:table-cell-properties> element for the style applied to the cell. Values are either automatic (consumer defines), bottom, middle, or top.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) §§ 17.18 and 20.386.2.

<style:style style:name="Table1.B1" style:family="table-cell">

<style:table-cell-properties style:vertical-align="middle"/>

</style:style>

# Related HTML/CSS Property:

<table style="width:400px;">

<tr>

<td style="height:100px; vertical-align: middle;">AAA</td>

<td style="height:100px; vertical-align: bottom;">BBB</td>

<td style="height:100px; vertical-align: top;">CCC</td>

</tr>

. . .

</table>

| AAA | BBB | CCC |
| --- | --- | --- |
| DDD | EEE | FFF |
| GGG | HHH | III |
