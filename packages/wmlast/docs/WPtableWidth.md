# Wordprocessing Tables

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Width

The preferred width for the table is specified with the <w:tblW> element within the <w:tblPr> element. All widths in a table are considered preferred because widths of columns can conflict and the table layout rules can require a preference to be overridden. If this element is omitted, then the cell width is of type auto.

<w:tblPr>

<w:tblW w:type="dxa" w:w="2880"/>

</w:tblPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.64.

Word 2007 Example:

The examples below specify the same width (<w:tblW w:type="dxa" w:w="2880"/>), with varying content to show the effect on the table width.

![Table Width](images/wp-tableWidth-1.gif)

---

![Table Width](images/wp-tableWidth-2.gif)  
![Table Width](images/wp-tableWidth-3.gif)

### Attributes:

The attributes are:

| Attribute | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| w         | Specifies the value of the preferred width of the table. If omitted, the value is assumed to be zero. ![](images/versionConflict3.png)Note: The 2006 version of the OOXML standard specified that the value was to be a decimal. When type="pct", the value was interpretted as fifths of a percent, so 4975=99.5%, and no % symbol was included in the attribute. In the 2011 version the value can be either a decimal or a percent, so a % symbol should be included when type="pct". |
| type      | Specifies the units of the width (w) property. Possible values are:                                                                                                                                                                                                                                                                                                                                                                                                                      |

- auto \- Specifies that width is determined by the overall table layout algorithm.
- dxa \- Specifies that the value is in twentieths of a point (1/1440 of an inch).
- nil \- Specifies a value of zero.
- pct \- Specifies a value as a percent of the table width.

---

# Related Open Document Format (ODF) Property:

The width of the table is set with the style:width attribute on the <style:table-properties> element for the style applied to the table. A value is a positive number.

There is also a style:rel-width attribute which specifies the width of the table relative to the width of the area that the table is in. A value is a percent.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) §§ 17.15 and 20.389.

<style:style style:name="Table1" style:family="table">

<style:table-properties style:width="5.4299in" table:align="right"/>

</style:style>

# Related HTML/CSS Property:

<table style="table-layout: fixed; width: 200px;">

CSS Example:

| AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile. | CCC |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --- |
| DDD                                                                    | EEE                                                                                                                                   | FFF |
| GGG                                                                    | HHH                                                                                                                                   | III |

<table style="width: 200px;">

| AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA | And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile. | CCC |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --- |
| DDD                                                                     | EEE                                                                                                                                   | FFF |
| GGG                                                                     | HHH                                                                                                                                   | III |
