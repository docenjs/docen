# Wordprocessing Paragraphs

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Indentation

Indentation is defined with the <w:ind> element.

<w:pPr>

<w:ind w:left="1440" w:right="1440" />

</w:pPr>

Values are in twentieths of a point: 1440 twips = 1 inch; 567 twips = 1 centimeter. To specify units in hundreths of a character, use attributes leftChars/endChars, rightChars/endChars, etc. Negative values are possible. See attributes below.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.12.

Word 2007 Example:

![Simple Indent](images\wp-ind-simpleIndent.gif)

---

### Attributes:

The most commonly used attributes are:

| Attribute  | Description                                                                                                                                                                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| left/start | Specifies the indentation to be placed at the left (for paragraphs going left to right). ![](images/versionConflict3.png)Note: The 2006 version of the OOXML standard specified left but the 2011 version specifies start. Microsoft Word 2007 does not seem to recognize start. |
| right/end  | Specifies the indentation to be placed at the right (for paragraphs going left to right). ![](images/versionConflict3.png)Note: The 2006 version of the OOXML standard specified right but the 2011 version specifies end. Microsoft Word 2007 does not recognize end.           |
| hanging    | Specifies indentation to be removed from the first line. This attribute and firstLine are mutually exclusive. This attribute controls when both are specified.                                                                                                                   |
| firstLine  | Specifies additional indentation to be applied to the first line. This attribute and hanging are mutually exclusive. This attribute is ignored if hanging is specified.                                                                                                          |

Word 2007 Example:

<w:pPr>

<w:ind w:left="1440" w:right="1440" w:hanging="1080" />

</w:pPr>

![Simple Indent](images\wp-ind-hangingIndent.gif)

---

---

# Related Open Document Format (ODF) Property:

There are two related ODF properties. First, indentation of a paragraph can be specified by setting the fo:margin, fo:margin-left, or fo:margin-right attribute on the <style:paragraph-properties> element within the style applied to the paragraph. Values can be either a length or percentage referring to the margin of the parent style.

Second, the indentation for the first line of a paragraph is specified by setting the fo:text-indent attribute on the <style:paragraph-properties> element. Values are either lengths or, if the attribute is contained in a common style, the value may be a percent that refers to the text indent of the parent style.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) §§20.198, 20.200, 20.201, and 20.218.

<style:style style:name="P1" style:family="paragraph" style:parent-style-name="Standard">

<style:paragraph-properties fo:margin-left="0.5in" fo:margin-right="0in" fo:text-indent="0.2402in" style:auto-text-indent="false"/>

</style:style>

---

# Related HTML/CSS Property:

margin-left: 35px;  
margin-right: 35px;  
text-indent: 15px;

CSS Example:

voice the spell is broken. We have delivered them: they have overcome death and return to share our life.

And so it is with our own past. It is a labour in vain to attempt to recapture it: all the efforts of our intellect must prove futile.

The past is hidden somewhere outside the realm, beyond the reach of intellect, in some material
