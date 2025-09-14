# Wordprocessing Sections

Headers

The header for a section is specified with the <w:headerReference> element. The header is referenced via the id attribute. Below is a sample reference to a header for a section.

<w:sectPr>

. . .

<w:headerReference r:id="rId3" w:type="first"/>

<w:headerReference r:id="rId5" w:type="default"/>

<w:headerReference r:id="rId2" w:type="even"/>

. . .

</w:sectPr>

These references point to relationships in the document.xml.rels, which in turn point to the headers:

<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">

<Relationship Id="rId2" type="http://purl.oclc.org/ooxml/officeDocument/relationships/header" target="header1.xml"/>

<Relationship Id="rId3" type="http://purl.oclc.org/ooxml/officeDocument/relationships/header" target="header2.xml"/>

<Relationship Id="rId5" type="http://purl.oclc.org/ooxml/officeDocument/relationships/header" target="header3.xml"/>

</Relationships>

For each section there can be up to three types of headers: first page header, odd page header, and even page header. The type is specified via the type attribute.

### Attributes

| Attribute | Description                                                   |
| --------- | ------------------------------------------------------------- |
| id        | Specifies the relationship ID to the appropriate header part. |
| type      | Specifies the type of header. Possible values are:            |

- default - the header should be applied to every page of the section that is not overridden by a first or even type.
- even - the header should be applied to every even page of the section (counting from the first page, not the section numbering). The actual appearance is dependent upon the setting of the evenAndOddHeaders element in settings.
- first - the header should be applied to the first page of the section. The actual appearance is dependent upon the setting of the titlePg element in sectPr.

If any of the above three types of headers is omitted, then the following rules apply.

- If no first page header is specified, but thetitlePg element is specified in sectPr, then the first page header will inherit from the previous section. If this is the first section, then a blank header is created. If thetitlePg element is not specified, then the odd page header will be applied.
- If no header for the even pages is specified and the evenAndOddHeaders element in settings is specified, then the even page header will inherit from the previous section. If this is the first section, then a blank header is created. If theevenAndOddHeaders element is not specified, then the odd page header will be applied.
- If no header for the odd pages is specified, then the even page header will be inherited from the previous section. If this is the first section, then a blank header will be created.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.10.5.

### Related HTML/CSS property:

HTML has no notion of pages, and so no page headers.
