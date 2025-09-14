# Wordprocessing Text

Line Breaks, Symbols, and Other Special Content

Line breaks, carriage returns, tabs, special characters and other special content may appear as elements within text runs (<w:r> </w:r>) rather than within text elements (<t> </t>).

### Elements:

| Element | Description                                                                                                                                                                                                                                                       |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| br      | See [Breaks](WPtextSpecialContent-break.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.1.                                                                                                                |
| cr      | Specifies that a carriage return (Unicode character 000D) should be inserted. It is equivalent to a break with null type and clear attributes (<w:br/>). <w:r><w:t>This is another</w:t></w:r><w:r><w:br/><w:t xml:space="preserve"> simple sentence.</w:t></w:r> |

| ![Carriage Return](images\wp-carriageReturn.gif)

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.4.

sym | See [Symbols](WPtextSpecialContent-symbol.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.30.  
tab | A tab character is inserted with the tab element: <w:tab/>. The tab will advance to the nearest multiple of the defaultTabStop element (within settings.xml) width value unless there is a custom tab stop further along, in which case it will advance to that custom tab. Custom tab stops are defined using the tabs element. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.32.  
noBreakHyphen | A non-breaking hyphen may be added so that the line will not break at the hyphen as it might if a hyphen-minus character (U+00D2) were used. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.18. <w:r> <w:t>Each citizen has a unique social security number of the form "999</w:t> </w:r> <w:r> <w:noBreakHyphen/> </w:r> <w:r> <w:t>99</w:t> </w:r> <w:r> <w:noBreakHyphen/> </w:r> <w:r> <w:t>9999."</w:t> </w:r>  
Word 2007 Example: | ![No break hyphen](images\wp-nobreakHyphen-1.gif)

---

softHyphen | An optional hyphen character may be added which may appear as a regular hyphen when needed to break the line, but which otherwise has a width of zero. It is typically used to mark locations where a word can be hyphenated without causing the hyphen to be displayed unnecessarily. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.29. <w:r> <w:t>This sentence needs to be just long enough so as to cause some sort of line break</w:t> </w:r> <w:r> <w:softHyphen/> </w:r> <w:r> <w:t>ing.</w:t> </w:r>  
Word 2007 Example: | ![soft hyphen](images\wp-softHyphen-1.gif)

---
