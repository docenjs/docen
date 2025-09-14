# WordprocessingText

Fonts

Within a single run there can be up to four types of content present which can each use a unique font:

- ASCII (the first 128 Unicode Code points)
- High ANSI
- Complex Script
- East Asian

So, for example, a single run can contain both Arabic and English text, and each can be in a different font.

The fonts used to display the different subsets of Unicode characters within a run are specified with the <w:rFonts> element within the <rPr> element.

<w:rPr>

<w:rFonts w:ascii="Courier New" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>

</w:rPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.26.

![](images/note.png) Note: In Microsoft Word 2007 you must enable support for right-to-left languages through the Microsoft Office Languages Settings. That will enable you to determine separate font characteristics for left-to-right and complex script language text.

Word 2007 Example:

![Text Fonts](images\wp-textFont-1.gif)

---

### Attributes:

The most commonly used attributes are below. (Theme-related attributes are omitted. However, note that if they are present, they supersede the related non-theme attributes.)

| Attribute | Description                                                                                                                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ascii     | Specifies the font to be used to format characters in the Unicode range (U+0000-U+007F). For example, text with characters in this range might be displayed using the Courier New font: <w:rFonts w:ascii="Courier New"/>. |
| cs        | Specifies the font to be used to format characters in a complex script Unicode range. For example, Arabic text might be displayed using the Arial Unicode MS font: <w:rFonts w:cs="Arial Unicode MS"/>.                    |
| eastAsia  | Specifies the font to be used to format characters in an East Asian Unicode range. For example, Japanese text might be displayed using the MS Mincho font: <w:rFonts w:eastAsia="MS Mincho"/>.                             |
| hAnsi     | Specifies the font to be used to format characters in a Unicode range which does not fall into one of the other categories. For example: <w:rFonts w:hAnsi="Bauhaus"/>.                                                    |

### Related CSS property:

There is no corresponding way to express a combination of fonts for different subsets of characters within a single tag. Separate font styles must be applied.

font-family:Tahoma, Geneva, sans-serif;  
font-family:"Times New Roman", Times, serif;

CSS Example:

We have delivered them: they have overcome death and return to share our life.

And so it is with our own past. It is a labour in vain to attempt to recapture it: all the efforts of our intellect must prove futile.

The past is hidden somewhere outside the realm, beyond the reach of intellect, in some material
