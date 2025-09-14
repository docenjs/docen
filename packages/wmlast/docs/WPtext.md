# Wordprocessing Text

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Structure

A run defines a non-block region of text with a common set of properties. It is specified with the <w:r> element. The properties of the run are specified with the <w:rPr> element, which is the first element of the <w:r>. Runs most commonly contain text elements <w:t> (which contain the actual literal text of a pararaph), but they may also contain such special content as symbols, tabs, hyphens, carriage returns, drawings, breaks, and footnote references. See [Special Content](WPtextSpecialContent.md).

<w:r>

<w:rPr>

<w:b/>

<w:i/>

</w:rPr>

<w:t>I feel that there is much to be said for the Celtic belief that the souls of those whom we have lost are held captive in some inferior being...</w:t>

</w:r>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference §§ 17.3.2, 17.3.3 and 17.3.2.25.

Word 2007 Example:

![Paragraph](images\wp-paragraph-1.gif)

---

### Elements:

The <w:r> element can contain a whole host of elements. The most commonly used are shown below.

| Element       | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| br            | Specifies a break. See [Text - Special Content](WPtextSpecialContent.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| cr            | Specifies a carriage return. See [Text - Special Content](WPtextSpecialContent.md). <w:r><w:t>This is another</w:t&gt <w:cr/><w:t xml:space="preserve"> simple sentence.</w:t></w:r> Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.4.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| drawing       | Specifies that a drawing object (that is, a graphical DrawingML object such as a diagram, chart, or picture) is located in the run. The layout of the DrawingML object within the document (i.e., its positioning on the page) is specified using the WordProcessingL drawing syntax. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.9.                                                                                                                                                                                                                                                                                                                                    |
| noBreakHyphen | Specifies a non-breaking hyphen character. See [Text - Special Content](WPtextSpecialContent.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.18.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| rPr           | Specifies properties for the run. See [Styles - Character Styles](WPstyleCharStyles.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.28.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| softHyphen    | Specifies a soft hyphen character. See [Text - Special Content](WPtextSpecialContent.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.29.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| sym           | Specifies a special character or symbol. See [Text - Symbols](WPtextSpecialContent-symbol.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.30.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| t             | Specifies literal text which will be displayed in the run. Most all text within a document is contained within t elements, except text within a field code. There is one possible attribute (xml:space) within the XML namespace that can be used to specify how space within the t element is to be handled. Possible values are preserve and default. If whitespace within a run needs to be preserved, it is important that this attribute be set to preserve. See the XML 1.0 specification at § 2.10. <w:r> <w:t>This is another</w:t> </w:r> <w:r><w:br/><w:t xml:space="preserve"> simple sentence.</w:t> </w:r> Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.31. |
| tab           | Specifies a tab character. See [Text - Special Content](WPtextSpecialContent.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.32.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

---

# Related Open Document Format (ODF) Property:

The content model for text in ODF is very similar to HTML. Character data is inside of paragraphs without being further nested in runs and text elements as it is in OOXML. When formatting of text within a paragraph is necessary, the <text:span> element is used.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 5.1.3.

<text:p>The last word of this sentence is

<text:span text:style-name="emphasis">emphasized</text:span>.

</text:p>

---

# Related HTML/CSS Property:

There is no corresponding HTML property.
