# Wordprocessing Sections

Page Margins

The margins for each page of a section are defined with the <w:pgMar> element.

<w:sectPr>

<w:pgMar w:header="720" w:bottom="1440" w:top="1440" w:right="2880" w:left="2880" w:footer="720" w:gutter="720"/>

</w:sectPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.6.11.

Word 2007 Example:

![Section Page Margins](images\wp-section-pgMar-1.gif)

---

### Attributes

| Element | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bottom  | Specifies the distance (in twips or twentieths of a point) between the bottom of the text margin and the bottom of the page. The text is placed at the greater of the value of this attribute and the extent of the footer text. A negative value indicates that the content should be measured from the bottom of the page regardless of the footer, and so will overlap the footer. For example, <w:pgMar w:header="-720" w:bottom="1440" .../> means that the footer must start one inch from the bottom of the page and the main document text must start a half inch from the bottom of the page. In this case, the text and footer overlap since bottom is negative. |
| footer  | Specifies the distance (in twips or twentieths of a point) from the bottom edge of the page to the bottom edge of the footer.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| gutter  | Specifies the page gutter (the extra space added to the margin, typically to account for binding).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| header  | Specifies the distance (in twips or twentieths of a point) from the top edge of the page to the top edge of the header.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| left    | Specifies the distance (in twips or twentieths of a point) from the left edge of the page to the left edge of the text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| right   | Specifies the distance (in twips or twentieths of a point) from the right edge of the page to the right edge of the text.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| top     | Specifies the distance (in twips or twentieths of a point) from the top edge of the page to the top edge of the text. The text is placed at the greater of the value of this attribute and the extent of the header text. A negative value indicates that the contents of the document text should be measured from the top of the page regardless of the header, and will overlap the header text.                                                                                                                                                                                                                                                                        |

### Related HTML/CSS property:

HTML has no notion of pages, and so no page borders.
