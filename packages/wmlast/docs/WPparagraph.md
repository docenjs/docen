# Wordprocessing Paragraphs

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Structure

The paragraph is the main block-level container for content within an ooxml document. (Tables can also contain content at the same level as a paragraph.) The paragraph is specified with <w:p> element. The paragraph can contain rich formatting properties for the paragraph (contained within a <w:pPr>). The text within the paragraph is further contained within one or more runs (<w:r>). Paragraphs may also contain bookmarks, hyperlinks, fields, comments, etc.

<w:p>

<w:pPr>

<w:pStyle> w:val="NormalWeb"/>

<w:spacing w:before="120" w:after="120"/>

</w:pPr>

<w:r>

<w:t xml"space="preserve">I feel that there is much to be said for the Celtic belief that the souls of those whom we have lost are held captive in some inferior being...</w:t>

</w:r>

</w:p>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference §§ 17.3.1 and 17.3.1.22.

Word 2007 Example:

![Paragraph](images\wp-paragraph-1.gif)

---

### Elements:

The <w:p> element can contain a number of elements, mostly related to tracking revisions and adding custom XML. The core elements are shown below.

| Element       | Description                                                                                                                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bookmarkStart | Specifies the start of a bookmark within a document. See [Bookmarks](WPbookmark.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.13.6.2.                   |
| bookmarkEnd   | Specifies the end of a bookmark within a document. See [Bookmarks](WPbookmark.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.13.6.1.                     |
| r             | Specifies a run of content within the paragraph. See [Text](WPtext.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.25.                                |
| pPr           | Specifies a set of properties for the paragraph. See [Paragraph Properties](WPparagraphProperties.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.26. |
| fldSimple     | Specifies a simple field. See [Fields - Overview](Wpfields.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.19.                                         |
| hyperlink     | Specifies the presence of a hyperlink at the location. See [Hyperlinks](WPhyperlink.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.22.                |

---

# Related Open Document Format (ODF) Property:

The paragraph in ODF is specified with the <text:p> element. It is a basic unit of text within ODF documents, and has mixed content. Most commonly it will have a text:style-name attribute and be found within an <office:text> element.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 5.1.3.

# Related HTML/CSS Property:

<table style="width:100%;">

<tr>

<td>AAA</td>

<td>BBB</td>

<td>CCC</td>

</tr>

. . .

</table>

HTML/CSS Example:

| AAA | BBB | CCC |
| --- | --- | --- |
| DDD | EEE | FFF |
| GGG | HHH | III |
