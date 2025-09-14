# Wordprocessing Tables

Layout/Width

Whether a table uses a fixed width or autofit method for laying out the table contents is specified with the <w:tblLayout> element within the <w:tblPr> element. If <w:tblLayout> is omitted, autofit is assumed.

<w:tblPr>

<w:tblLayout w:type="fixed"/>

</w:tblPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.53.

Word 2007 Example:

![Table Layout/Width](images\wp-tableLayout-1.gif)

---

### Attributes:

The attributes are:

| Attribute | Description                                                                        |
| --------- | ---------------------------------------------------------------------------------- |
| type      | Specifies the method of laying out the contents of the table. Possible values are: |

- fixed \- Uses the preferred widths on the table items to generate the final sizing of the table. The width of the table is not changed regardless of the contents of the cells.
- autofit \- Uses the preferred widths on the table items to generat the sizing of the table, but then uses the contents of each cell ot determine the final column widths.

If pct or auto is specified, the value is ignored.

### Related CSS property:

<table>

<col width=200>/>

<col width=100>/>

<col width=50>/>

<tr>

. . .

</tr>

</table>

<table>

<tr>

. . .

</tr>

</table>

CSS Example:

| AAA | And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile. | CCC |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | --- |
| DDD | EEE                                                                                                                                   | FFF |

| AAA | And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile. | CCC |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | --- |
| DDD | EEE                                                                                                                                   | FFF |

Other CSS Examples:

<table style="table-layout: fixed; width: 200px;">

| AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile. | CCC |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --- |
| DDD                                                                    | EEE                                                                                                                                   | FFF |
| GGG                                                                    | HHH                                                                                                                                   | III |

<table style="width: 200px;">

| AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile. | CCC |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --- |
| DDD                                                                     | EEE                                                                                                                                   | FFF |
| GGG                                                                     | HHH                                                                                                                                   | III |
