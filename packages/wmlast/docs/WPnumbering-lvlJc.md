# Wordprocessing Numbering

Defining a Particular Level - Justification

The justification for the numbering level's text is specified with the <w:lvlJc> element. If omitted, justification will be left for left-to-right paragraphs.

![](images/note.png)Note: This element does not determine the justification for the paragaph. That justification is determined by the <w:jc> element within the <w:pPr> element. The justification as specified in the <w:lvlJc> element is applied relative to the text margin of the parent numbered paragraph. So, for example, if the justification is set to be left justified for a left-to-right paragraph (i.e., <w:lvlJc w:val="start"/>), then the numbering will extend left from the text margin towards the text.

A numbering level's text is the numeral (e.g., "1)"), symbol (e.g., •), character (e.g., "-"), or graphic used to form the level, as specified in the lvlText element. See the samle below for a comparison of left and right justification.

<w:lvl w:ilvl="0">

<w:start w:val="1"/>

<w:numFmt w:val="decimal"/>

<w:lvlText w:val="%1."/>

<w:lvlJc w:val="end"/>

<w:pPr>

<w:ind w:start="720" w:hanging="360"/>

</w:pPr>

</w:lvl>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.9.8.

Word 2007 Example:

Below shows first a numbering scheme using left justification, followed by the same scheme but with right justifiation.

![Numbering - lvlJc](images\wp-numbering-lvlJc-1.gif)

---

### Attributes:

| Attribute | Description                                                                  |
| --------- | ---------------------------------------------------------------------------- |
| val       | Specifies the value for the level justification. The most common values are: |

- start \- justification to the leading margin (left margin for left-to-right documents). ![](images/versionConflict3.png)Note: In the 2003 version of the standard, this value was left.
- end \- justification to the trailing margin (right margin for left-to-right documents). ![](images/versionConflict3.png)Note: In the 2003 version of the standard, this value was right.
- center \- center the text.
- both \- justify text between both margins equally, but inter-character spacing is not affected.
- distribute \- justify text between both margins equally, and both inter-word and inter-character spacing are affected.

### Related CSS property:

No related CSS or HTML property.
