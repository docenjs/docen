# Wordprocessing Tables

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Table Cell Properties - Width

The preferred width of a single table cell is specified with the <w:tcW> element within the <tcPr> element. All widths in a table are considered preferred because widths of columns can conflict and the table layout rules can require a preference to be overridden. If this element is omitted, then the cell width is of type auto.

<w:tcPr>

<w:tcW w:type="pct" w:w="33.3%"/>

</w:tcPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.68.

Word 2007 Example:

The preferred width for the table below (<w:tblW>) is set to auto. The first cell is set to 33.3%, as in the sample above. The samples below show the effects of varying content within the cell.

![Table Cell Properties - Width](images\wp-tblCellProperties-Width-1.gif)

---

![Table Cell Properties - Width](images\wp-tblCellProperties-Width-2.gif)

### Attributes:

The attributes are:

| Attribute | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| w         | Specifies the value of the preferred width of the cell. If omitted, the value is assumed to be zero. ![](images/versionConflict3.png)Note: The 2006 version of the OOXML standard specified that the value was to be a decimal. When type="pct", the value was interpretted as fifths of a percent, so 4975=99.5%, and no % symbol was included in the attribute. In the 2011 version the value can be either a decimal or a percent, so a % symbol should be included when type="pct". |
| type      | Specifies the units of the width (w) property. Possible values are:                                                                                                                                                                                                                                                                                                                                                                                                                     |

- auto \- Specifies that width is determined by the overall table layout algorithm.
- dxa \- Specifies that the value is in twentieths of a point (1/1440 of an inch).
- nil \- Specifies a value of zero.
- pct \- Specifies a value as a percent of the table width.

---

# Related Open Document Format (ODF) Property:

The width of a cell is set with the style:column-width attribute on the <style:table-column-properties> element for the style applied to the column for the cell. A value is a positive number.

There is also a style:rel-column-width attribute which specifies a relative width of a column. A value is a number followed by a \* (U+002A, ASTERISK).

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) §§ 17.16 and 20.247.

<style:style style:name="Table1.A" style:family="table-column">

<style:table-column-properties style:column-width="0.75in" style:rel-column-width="1080\*"/>

</style:style>

# Related HTML/CSS Property:

<table style=" width: auto;">

<tr>

<td style="width:70%;">And so it is ...</td>

</tr>

. . .

</table>

CSS Example:

| And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile. | BBB | CCC |
| ------------------------------------------------------------------------------------------------------------------------------------- | --- | --- |
| DDD                                                                                                                                   | EEE | FFF |
| GGG                                                                                                                                   | HHH | III |

<table style=" width: auto;">

<tr>

<td style="width:70%;">And so it is ...</td>

</tr>

. . .

</table>

| AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | BBB | CCC |
| ----------------------------------------------------------------------- | --- | --- |
| DDD                                                                     | EEE | FFF |
| GGG                                                                     | HHH | III |
