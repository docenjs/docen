# Wordprocessing Text

Line Break

A line break is specified with the <w:br> element. It specifies a break which overrides the normal line breaking. (Normal line breaking occurs after a breaking space or optional hyphen character.)

<w:r>

<w:t>This is</w:t>

<w:br/>

<w:t xml:space="preserve"> a simple sentence.</w:t>

</w:r>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.1.

### Attributes:

| Attribute | Description                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------- |
| type      | Specifies the type of break, which determines the location for the following text. Possible values are: |

- column - Text restarts on the next column. If there are no columns or the current position is the last column, then the restart location is the next page.
- page - Text restarts on the next page.
- textWrapping - Text restarts on the next line. This is the default value.

clear | Specifies the location where text restarts when the value of the type attribute is textWrapping. ![](images/note.png) Note: This property only affects the restart location when the current run is being displayed on a line which does not span the full text extents due to a floating object. Possible values are:

- all - Text restarts on the next full line. This is often used for captions for objects.
- left - Text restarts text in the next text region left to right.
- none - Text restarts on the next line regardless of any floating objects. This is the typical break.
- right - Text restarts text in the next text region right to left.

Word 2007 Example:

. . . are held captive in </w:t></w:r><w:r><w:br w:type="page"/>  
</w:r><w:r><w:t>some inferior being . . .

![Text Break](images\wp-textBreak-1.gif)

---

### Related HTML/CSS property:

. . . are held captive in <br /> some inferior being . . .

CSS Example:

. . . are held captive in  
some inferior being . . .
