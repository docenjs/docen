# Wordprocessing Tables

Cell Spacing Default

The space between adjacent cells and the edges of the table is specified with the <w:tblCellSpacing> element. Compare with [tblCellMar](WPtableCellMargins.md)\--spacing is added outside of the text margins.

This property can be overridden by a [table-level exception](WPtablePropertyExceptions.md#tblPrExCellSpacing) (<w:tblCellSpacing> within <tblPrEx>) or by the [row cell spacing](WPtableRowProperties.md#rowCellSpacing) value (<w:tblCellSpacing> within <trPr>).

<w:tblPr>

<w:tblCellSpacing> w:w="144" w:type="dxa"/>

</w:tblPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.46.

Word 2007 Example:

![Table Cell Spacing Default](images\wp-tblCellSpacing-2.gif)

---

### Attributes:

The attributes are:

| Attribute | Description                                                                                |
| --------- | ------------------------------------------------------------------------------------------ |
| w         | Specifies the value of the width of the spacing. If omitted, the value is assumed to be 0. |
| type      | Specifies the units of the width (w) property. Possible values are:                        |

- dxa \- Specifies that the value is in twentieths of a point (1/1440 of an inch)
- nil \- Specifies a value of zero

If pct or auto is specified, the value is ignored. If the attribute is omitted, its value is assumed to be dxa.

### Related CSS property:

The cellspacing property is applied at the table level:

<table cellspacing="30px" style="width: 100%;">

CSS Example:

| AAA | BBB | CCC |
| --- | --- | --- |
| DDD | EEE | FFF |
| GGG | HHH | III |
