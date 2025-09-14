# Wordprocessing Tables

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Indent

The indentation to be added before the leading edge (left edge in a left-to-right table) of the table is specified with the <w:tblInd> element within the <w:tblPr> element.

![](images/note.png)Note: This property does not affect the indentation of text within the cells of the table. However, justification (<w:jc>) does affect table indentation. For example, any row with right justification would result in the table ignoring any specified indent.

<w:tblPr>

<w:jc w:val="start"/>

<w:tblInd w:w="2160" w:type="dxa"/>

</w:tblPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.51.

Word 2007 Example:

![Table Indent](images/wp-tableIndent-1.gif)

---

### Attributes:

The attributes are:

| Attribute | Description                                                                                                                                                                                                                      |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| w         | Specifies the value of the width of the indentation. The table will shift into the text margin by the specified amount. ![](images/versionConflict3.png)Note: The 2006 version of the OOXML standard specified val instead of w. |
| type      | Specifies the units of the width (w) property. Possible values are:                                                                                                                                                              |

- dxa \- Specifies that the value is in twentieths of a point (1/1440 of an inch)
- nil \- Specifies a value of zero

If pct or auto is specified, the value is ignored.

---

# Related Open Document Format (ODF) Property:

Indentation of a table can be specified a couple of different ways. Of course the table width can be set at less than the full width of the page, and then the table alignment can be set to left or right, depending upon whether the indentation should be on the left or right side. For example, to achieve a 2-inch margin on the left for a page at 7 inches, the table width could be set at 5 inches and the table alignment could be set for the right.

<style:style style:name="Table1" style:family="table">

<style:table-properties style:width="5in" table:align="right"/>

</style:style>

Alternatively, the table margin property could be set with the fo:margin-left attribute on the <style:table-properties> element for the style applied to the table. The following table margins can be set: fo:margin, fo:margin-left, fo:margin-right, fo:margin-top, fo:margin-bottom. Note that tables which align to the left or center ignore right margins, and tables that align to the right or center ignore left margins. Percentages can be set which will refer to the corresponding margins of a parent style.

<style:style style:name="Table1" style:family="table">

<style:table-properties style:width="5in" table:align="left" fo:margin-left="2in"/>

</style:style>

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) §§ 17.15 and 20.198 - 20:202.

# Related HTML/CSS Property:

<table style="width: 100%; margin-left:50px;">

. . .

</table>

CSS Example:

And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile. The past is hidden somewhere outside the realm, beyond the reach of intellect, in some material object (in the sensation which that material object will give us) which we do not suspect.

| AAA | BBB | CCC |
| --- | --- | --- |
| DDD | EEE | FFF |

And as for that object, it depends on chance whether we come upon it or not before we ourselves must die.
