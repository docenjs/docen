# Wordprocessing Tables

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Shading

The shading to be applied to the table up to the table borders is specified with the <w:shd> element within the <w:tblPr> element. Note that unlike cell shading, table shading includes any cell padding. This property can be overriden by any cell-level spacing, either with a [table-level property exception](WPtablePropertyExceptions.md#tblExPrShading), or with direct cell shading of a cell in a row.

Shading consists of a background color, an optional pattern, and an optional pattern color. The background color is first applied, and then the pattern is applied over the background.

<w:tblPr>

<w:shd> w:val="pct10" w:color="FFFF00" w:fill="FF0000"/>

</w:tblPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.32.

Word 2007 Example:

![Table Shading](images\wp-table-shading-1.gif)

---

### Attributes:

The most commonly used attribute values are below. There are also several theme-specific attributes, such as themeColor, themeFill, themeFillShade, etc.

| Attribute | Description                                                                                                                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fill      | Specifies the color to be used for the background. Values are given as hex values (i.e., in RRGGBB format). No #, unlike hex values in HTML/CSS. E.g., fill="FFFF00".                                    |
| color     | Specifies the color to be used for any foreground pattern specified with the val attribute. Values are given as hex values (in RRGGBB format). No #, unlike hex values in HTML/CSS. E.g., fill="FFFF00". |
| val       | Specifies the pattern to be used to lay the pattern color over the background color. For example, w:val="pct10" indicates that the border style is a 10 percent foreground fill mask.                    |

Possible values are: clear (no pattern), pct10, pct12, pct15 . . ., diagCross, diagStripe, horzCross, horzStripe, nil, thinDiagCross, solid, etc. See ECMA-376, 3rd, § 17.18.78 for a complete listing.

---

# Related Open Document Format (ODF) Property:

The shading for a table is set with the fo:background-color attribute on the <style:table-properties> element for the style applied to the table. Values can be colors or transparent (switches off any background image).

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) §§ 17.15 and 20.175.

<style:style style:name="Table1" style:family="table">

<style:table-properties style:width="5in" fo:margin-left="2in" table:align="left" fo:background-color="cccccc">

<style:background-image/>

</style:table-properties>

</style:style>

# Related HTML/CSS Property:

<table cellspacing="10px" style="background-color:#FF0000;">

CSS Example:

| AAA | BBB | CCC |
| --- | --- | --- |
| DDD | EEE | FFF |
| GGG | HHH | III |
