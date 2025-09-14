# Wordprocessing Tables

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Cell Properties - Shading

Cell shading is specified by the span class="featuredItem"><shd> element within <w:tcPr/>. Shading is applied up to the cell borders. Shading consists of a background color, an optional pattern, and an optional pattern color.

<w:tcPr>

<w:shd w:val="clear" w:color="auto" w:fill="FF0000">

</w:tcPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.33.

Word 2007 Example:

<w:tcPr>

<w:shd w:val="pct45" w:color="FFFF00" w:fill="B2A1C7">

</w:tcPr>

![Sample table cell shading](images\wp-tableCellShading-1.gif)

---

### Attributes:

The most commonly used attribute values are below. There are also several theme-specific attributes, such as themeColor, themeFill, themeFillShade, etc.

| Attribute | Description                                                                                                                                                                                                                                                                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fill      | Specifies the color to be used for the background. Values are given as hex values (i.e., in RRGGBB format). No # in included, unlike hex values in HTML/CSS. E.g., fill="FFFF00". A value of auto is possible, enabling the consuming software to determine the value. A value of auto is possible, enabling the consuming software to determine the value. |
| color     | Specifies the color to be used for any foreground pattern specified with the val attribute. Values are given as hex values (in RRGGBB format). No # is included, unlike hex values in HTML/CSS. E.g., fill="FFFF00". A value of auto is possible, enabling the consuming software to determine the value.                                                   |
| val       | Specifies the pattern to be used to lay the pattern color over the background color. For example, w:val="pct10" indicates that the border style is a 10 percent foreground fill mask.                                                                                                                                                                       |

Possible values are: clear (no pattern), pct10, pct12, pct15 . . ., diagCross, diagStripe, horzCross, horzStripe, nil, thinDiagCross, solid, etc. See ECMA-376, 3rd, § 17.18.78 for a complete listing.

---

# Related Open Document Format (ODF) Property:

Shading within a cell can be set by adding the fo:background-color attributes to the <style:table-cell-properties> element for the style applied to the cell.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 17.18 and § 20.175.

<style:style style:name="Table1.A1" style:family="table-cell">

<style:table-cell-properties fo:background-color="#9999FF" fo:padding="0.382in" fo-border-left="0.007in solid #000000" fo-border-right="none" fo-border-top="0.007in solid #000000" fo-border-bottom="0.007in solid #000000">

<style:background-image/>

</style:table-cell-properties>

</style:style>

# Related HTML/CSS Property:

<td style="background-color:#FF0000;">

CSS Example:

| AAA | BBB | CCC |
| --- | --- | --- |
| DDD | EEE | FFF |
| GGG | HHH | III |
