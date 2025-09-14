# Wordprocessing Tables

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Cell Margin Default

The default table cell margin (that is, the distance between the cell contents and the cell borders) is specified with the <w:tblCellMar> element. Compare with [tblCellSpacing](WPtableCellSpacing.md). This setting can be overridden at the cell level using the tcMar element within the cell's properties.

<w:tblPr>

<w:tblCellMar>

<w:top w:w="720" w:type="dxa"/>

<w:start w:w="432" w:type="dxa"/>

<w:bottom w:w="0" w:type="dxa"/>

<w:end w:w="144" w:type="dxa"/>

</w:tblCellMar>

</w:tblPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.43.

Word 2007 Example:

![Table Cell Margin Default](images\wp-tblCellMar-1.gif)

---

### Elements:

| Element | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| top     | Specifies the amount of space left between the top of the cell contents and the top border of all cells. If omitted, the table will have no top padding unless a cell overrides the default. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.76.                                                                                                                                                          |
| bottom  | Specifies the amount of space left between the bottom of the cell contents and the border of all cells. If omitted, the table will have no bottom padding unless a cell overrides the default. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.5.                                                                                                                                                         |
| start   | Specifies the amount of space displayed to the left for left-to-right tables and right for right-to-left tables. If omitted, the table will have 115 twentieths of a point (0.08 inches) of left padding unless a cell overrides the default. ![](images/versionConflict3.png)Note: In the previous version of the standard, this element was left. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.35.   |
| end     | Specifies the amount of space displayed on the right for left-to-right tables and left for right-to-left tables. If omitted, the table will have 115 twentieths of a point (0.08 inches) of right padding unless a cell overrides the default. ![](images/versionConflict3.png)Note: In the previous version of the standard, this element was right. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.11. |

### Attributes:

The attributes for the above table cell margin elements are:

| Attribute | Description                                                                               |
| --------- | ----------------------------------------------------------------------------------------- |
| w         | Specifies the value of the width of the margin. If omitted, the value is assumed to be 0; |
| type      | Specifies the units of the width (w) property. Possible values are:                       |

- dxa \- Specifies that the value is in twentieths of a point (1/1440 of an inch).
- nil \- Specifies a value of zero

If the attribute is omitted, its value is assumed to be dxa.

---

# Related Open Document Format (ODF) Property:

Cell margins are not set in the <style:table-cell-properties> element, but on the style for the paragraph within the cell. See [Table Cell Properties - Margins](WPtableCellProperties-Margins.md) for more details.

# Related HTML/CSS Property:

The padding property is applied at the cell level:  
td {  
padding-bottom:0px;  
padding-top:25px;  
padding-left:15px;  
padding-right:10px;  
}

CSS Example:

| AAA | BBB | CCC |
| --- | --- | --- |
| DDD | EEE | FFF |
| GGG | HHH | III |
