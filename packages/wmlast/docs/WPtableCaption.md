# Wordprocessing Tables

Caption

The caption for a table is specified with the <w:tblCaption> element within the <w:tblPr> element.

<w:tblPr>

<w:tblCaption w:val="This is the caption text"/>

</w:tblPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.41.

Word 2007 Example:

![](images/versionConflict3.png)Note: The <w:tblCaption> element was added in the 2008 version of ECMA-376, so Word 2007 does not support this.

---

### Attributes:

| Attribute | Description                        |
| --------- | ---------------------------------- |
| val       | Specifies the text of the caption. |

### Related CSS property:

<table>

<caption>This is the caption text</caption>

. . .

</table>

CSS Example:

| This is the caption text AAA | BBB | CCC |
| ---------------------------- | --- | --- |
| DDD                          | EEE | FFF |
