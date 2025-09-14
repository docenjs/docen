# Wordprocessing Sections

Line Numbers

Line numbers are specified for each column of text in a section with the <w:lnNumType> element.

<w:sectPr>

<w:lnNumType w:countBy="3" w:start="1" w:restart="newSection"/>

</w:sectPr>

Word 2007 Example:

![Sections - Line Numbers](images\wp-section-lnNumType-1.gif)

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.6.8.

### Attributes:

| Attribute | Description                                                                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| countBy   | Specifies the line number increments to be displayed. So, e.g., a value of 5 would specify that a page number appear at every fifth page. |
| distance  | Specifies the distance between text and line numbering, in twips (i.e., 1/1440th of an inch).                                             |
| restart   | Specifies when numbering should be reset to the line number specified in the start attribute. Possible values are:                        |

- continuous - numbering should continue from the number of the previous section.
- newPage - numbering should restart when a new page is displayed. This is the default value.
- newSection - number should restart when the section begins.

start | Specifies the starting value for the numbering.

### Related HTML/CSS property:

There is no corresponding HTML or CSS feature.
