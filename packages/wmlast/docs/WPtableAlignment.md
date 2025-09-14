# Wordprocessing Tables

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Alignment

The alignment of the table with respect to the text margins is specified with the <w:jc> element within the <w:tblPr> element.

![](images/note.png)Note: This property will not affect the alignment of the table if the table spans the entire width of the page. Also it does not affect the justification of text within the cells of the table.

<w:tblPr>

<w:jc w:val="end"/>

</w:tblPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.23.

Word 2007 Example:

![Table Alignment](images\wp-tableJC-1.gif)

---

### Attributes:

The attributes are:

| Attribute | Description                                                               |
| --------- | ------------------------------------------------------------------------- |
| val       | Specifies the value for the paragraph justification. Possible values are: |

- start \- The table will be aligned to the leading edge of the text flow (the left margin for left-to-right tables). ![](images/versionConflict3.png)Note: In the 2006 version of the standard, this value was left.
- end \- The table will be aligned to the trailing edge of the text flow (the right margin for left-to-right tables). ![](images/versionConflict3.png)Note: In the 2006 version of the standard, this value was right.
- center \- The table will be centered between both of the text margins.

---

# Related Open Document Format (ODF) Property:

The horizontal alignment of the table is set by the table:align attribute of the <style:table-properties> element for the style applied to the table. Possible values are center, left, margins [table fills all the space between the left and right margins], and right.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) §§ 20.404.

<style:style style:name="Table1" style:family="table">

<style:table-properties style:width="4.7in" table:align="center"/>

</style:style>

# Related HTML/CSS Property:

<table style="float:right;">

. . .

</table>

<p>The past is hidden ...</p>

CSS Example:

| AAA | BBB | CCC |
| --- | --- | --- |
| DDD | EEE | FFF |

The past is hidden somewhere outside the realm, beyond the reach of intellect, in some material object (in the sensation which that material object will give us) which we do not suspect. And as for that object, it depends on chance whether we come upon it or not before we ourselves must die.
