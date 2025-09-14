# Wordprocessing Paragraphs

Vertical Text Alignment

The alignment of characters on each line is specified with the <w:textAlignment> element. This is relevant when characters within a line vary in size. If the line height is larger than one or more characters on the line, all characters are aligned to the maximum character extent as specified by this element.

<w:pPr>

<w:textAlignment w:val="center"/>

</w:pPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.39 and § 17.18.91.

Word 2007 Example:

<w:pPr>

<w:textAlignment w:val="top"/>

</w:pPr>

<w:pPr>

<w:textAlignment w:val="center"/>

</w:pPr>

![Sample text alignment](images\wp-textAlignment-1.gif)

---

### Attributes:

textAlignment has a single attribute val. The possible values are below:

| Attribute Value | Description                                               |
| --------------- | --------------------------------------------------------- |
| auto            | Text should be aligned by the consuming software.         |
| baseline        | Text should be aligned to the baseline of each character. |
| bottom          | Text should be aligned to the bottom of each character.   |
| center          | Text should be aligned to the center of each character.   |
| top             | Text should be aligned to the top of each character.      |

### Related CSS property:

![](images/note.png)Note: The corresponding CSS style is placed on the inline oversized text element (i.e., <span>) (or an image or <img> element) rather than on the paragraph or <div>.

vertical-align: top;  
vertical-align: middle;

CSS Example:

Then they start and tremble, they call us by our name, and as soon as we have recognized their voice the spell is broken. We have delivered them: they have overcome death and return to share our life.

And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile.
