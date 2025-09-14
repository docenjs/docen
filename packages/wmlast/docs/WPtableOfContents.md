# Wordprocessing Table of Contents

A table of contents is built using the TOC field. See [Fields](WPfields.md) and [Field Instructions](WPfieldInstructions.md) for details about fields. Below is a sample of a TOC field instruction, omitting the result of the instruction. Note that the TOC field relies upon TC fields, heading levels, and specified styles to be used within the document.

<w:r>

<w:fldChar w:fldCharType="begin"/>

</w:r>

<w:r>

<w:instrText xml:space="preserve"> TOC \\\* MERGEFORMAT </w:instrText>

</w:r>

<w:r>

<w:fldChar w:fldCharType="separate"/>

</w:r>

<w:r>

. . .

</w:r>

<w:r>

<w:fldChar w:fldCharType="end"/>

</w:r>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.5.68.

Word 2007 Example:

![Table of Contents](images\wp-toc-1.gif)

---

### Switches:

The following are the most useful formatting switches for the TOC field.

| Switch              | Description                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| \b _field argument_ | Includes entries only from a portion of the document marked by the bookmark provided as the field argument.                                                                                                                                                                                                                                                                                                                                  |
| \d _field argument_ | When used with \s, the field argument defines the separator between sequence and page numbers. The default is a hyphen (-).                                                                                                                                                                                                                                                                                                                  |
| \h _field argument_ | Makes the table of contents entries hyperlinks.                                                                                                                                                                                                                                                                                                                                                                                              |
| \n _field argument_ | Without the field argument, this omits page numbers from the table of contents. Page numbers are omitted unless a range of entry levels is specified by the field argument. A range is specified by the following format: _startLevel-endLevel_.                                                                                                                                                                                             |
| \o _field argument_ | Uses paragraphs formatted with all of the specified range of built-in heading styles. Headings in a style range are specified by the field argument using the notation specified as shown in the \n switch above. Each integer corresponds to the style with the style ID of HeadingX. For example, 1 corresponds to Heading1. If no heading range is specified, all heading levels that appear in the document are used. E.g., TOC \o "3-3" |
| \p _field argument_ | The field argument specifies a sequence of characters that separate an entry and its page number. The default is a tab with leader dots.                                                                                                                                                                                                                                                                                                     |
| \s _field argument_ | For entries numbered with a SEQ field, it adds a prefix to the page number; the prefix depends on the type of entry. The argument matches the ID of the SEQ field.                                                                                                                                                                                                                                                                           |
| \t _field argument_ | Uses paragraphs formattted with styles other than the built-in heading styles. In the field argument is a set of comma-separated doublets, each being a comma-separated set of style name and table of content level. E.g., TOC \t "Heading 1,1,Heading 2,2,Appendix 1,1,Appendix 2,2,Unnumbered Heading,1"                                                                                                                                  |
| \z                  | Hides tab leader and page numbers in Web layout view.                                                                                                                                                                                                                                                                                                                                                                                        |

### Related HTML property:

There is no HTML/CSS counterpart.
