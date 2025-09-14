# Wordprocessing Headers

Related Open Office/ODF Discussion

Overview

Headers can be specified for sections. See [Sections](WPsection.md). Each section can have a different header for the first page, odd pages, and even pages. Each header is specified in a Header part within the package. Each Header part is the target of an explicit relationship in the part-relationship item (document.xml.rels) for the main document part. That is, each header will be contained in a separate file within the package and the files will be referenced in document.xml.rels. The glossary can also have headers, and so the glossary may have explicit relationships for headers too.

Below are relationships in document.xml.rels for a first page header and a default header for all other pages in the section.

<Relationships xmls="...">

<Relationship Id="rId6" Type="http://.../footer" Target="header1.xml"/>

<Relationship Id="rId8" Type="http://.../footer" Target="header2.xml"/>

</Relationships>

The document references the headers with a headerReference element within the sectPr element of the section. See [Sections](WPsection.md) and [Sections - Headers](WPsectionHeaderReference.md).

<w:sectPr>

. . .

<w:headerReference r:id="rId8" w:type="first"/>

<w:headerReference r:id="rId6" w:type="default"/>

. . .

</w:sectPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 11.3.9.

The Header part has a hdr root element which specifies the content for any header that references the Header part. The content of the hdr element is similar to that of the body element and contains block-level markup which can exist as a sibling element to paragraphs. Below is a sample header for the first page header of a section.

Below is the content of the header1.xml Header part.

<w:hdr xmlns:ve= ... >

<w:p>

<w:pPr>

<w:pStyle w:val="Header"/>

</w:pPr>

<w:r&gt

<w:t>Default Header</w:t>

</w:r&gt

</w:p>

</w:hdr>

Below is the content of the header2.xml Header part.

<w:hdr xmlns:ve= ... >

<w:p>

<w:pPr>

<w:pStyle w:val="Header"/>

</w:pPr>

<w:r&gt

<w:t>First Page Header</w:t>

</w:r&gt

</w:p>

</w:hdr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.10.4.

Word 2007 Example:

![Footers](images\wp-footers-1.gif)

---

### Elements:

Below are the most important of the child elements of ftr.

| Element | Description                                                                                                                                                                |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| p       | Specifies a paragraph of content. See [Paragraphs](WPparagraph.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.22. |
| tbl     | Specifies the contents of a table. See [Tables](WPtable.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.38.          |

---

---

# Related Open Document Format (ODF) Property:

A header in the ODF format is defined with a <style:header> element within a <style:master-page> element of the styles part. A <style:header> can contain a <table:table>, a <text:h>, a <text:list>, a <text:p>, a <text:section>, or a <text:table-of-content>, among other elements. Note that there is also a <style:header-left> element that can also be within a <style:master-page> if content for the header for the left page is different from the right.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 16.10.

<office:master-styles>

<style:master-page style:name="Standard" style:page-layout-name="Mpm1">

<style:header>

<text:p text:style-name="Header">My sample document header</text:p>

</style:header>

<style:footer>

<text:p text:style-name="Footer">My sample document footer</text:p>

</style:footer>

</style:master-page>

</office:master-styles>
