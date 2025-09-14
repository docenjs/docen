# Wordprocessing Sections

Footers

The footer for a section is specified with the <w:footerReference> element. The footer is referenced via the id attribute. Below is a sample reference to a footer for a section.

<w:sectPr>

. . .

<w:footerReference r:id="rId12" w:type="first"/>

<w:footerReference r:id="rId10" w:type="default"/>

<w:footerReference r:id="rId9" w:type="even"/>

. . .

</w:sectPr>

These references point to relationships in document.xml.rels, which in turn point to the footers via the target element.

<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">

<Relationship Id="rId9" type="http://purl.oclc.org/ooxml/officeDocument/relationships/footer" target="footer1.xml"/>

<Relationship Id="rId10" type="http://purl.oclc.org/ooxml/officeDocument/relationships/footer" target="footer2.xml"/>

<Relationship Id="rId12" type="http://purl.oclc.org/ooxml/officeDocument/relationships/footer" target="footer3.xml"/>

</Relationships>

For each section there can be up to three types of footers: first page footer, odd page footer (default), and even page footer. The type is specified via the type attribute.

### Attributes

| Attribute | Description                                                   |
| --------- | ------------------------------------------------------------- |
| id        | Specifies the relationship ID to the appropriate footer part. |
| type      | Specifies the type of footer. Possible values are:            |

- default - the footer should be applied to every page of the section that is not overridden by a first or even type.
- even - the footer should be applied to every even page of the section (counting from the first page, not the section numbering). The actual appearance is dependent upon the setting of the evenAndOddHeaders element in settings.
- first - the footer should be applied to the first page of the section. The actual appearance is dependent upon the setting of the titlePg element in sectPr.

If any of the above three types of footers is omitted, then the following rules apply.

- If no first page footer is specified, but thetitlePg element is specified in sectPr, then the first page footer will inherit from the previous section. If this is the first section, then a blank footer is created. If thetitlePg element is not specified, then the odd page footer will be applied.
- If no footer for the even pages is specified and the evenAndOddHeaders element in settings is specified, then the even page footer will inherit from the previous section. If this is the first section, then a blank footer is created. If theevenAndOddHeaders element is not specified, then the odd page footer will be applied.
- If no footer for the odd pages is specified, then the even page footer will be inherited from the previous section. If this is the first section, then a blank footer will be created.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.10.2.

### Related HTML/CSS property:

HTML has no notion of pages, and so no page footers.
