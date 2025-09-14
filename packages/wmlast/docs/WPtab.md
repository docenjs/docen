# Wordprocessing Paragraphs

Tabs

A single custom tab is defined with the <w:tab> element, and the <w:tab> element is contained within a parent <w:tabs> element. The tab stop location is measured relative to the left edge for a left-to-right paragraph. Compare tab to a hanging indent (as specified by the ind element), which implicitly creates a tab stop.

<w:pPr>

<w:tabs>

<w:tab w:val="start" pos="2160"/>

</w:tabs>

</w:pPr>

A sequence of custom tabs may be specified inside of the <w:tabs> element:

<w:pPr>

<w:tabs>

<w:tab w:val="start" pos="2160"/>

<w:tab w:val="start" pos="5040"/>

</w:tabs>

</w:pPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.37 and § 17.3.1.38.

Word 2007 Example:

</w:pPr>

<w:tab w:val="left" w:leader="dot" w:pos="1440"/>  
. . .<w:r><w:tab/></w:r>...

</w:pPr>

. . .

<w:pPr>

<w:tabs>

<w:tab w:val="left" w:pos="2160"/>

<w:tab w:val="left" w:leader="dot" w:pos="5040"/>  
. . .<w:r><w:tab/></w:r><w:r><w:tab/></w:r>...

</w:tabs>

</w:pPr>

![Sample tabs](images\wp-tabs-1.gif)

---

### Attributes:

tab has the following attributes.

| Attribute | Description                                                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| leader    | Specifies the character used to fill in the space created by a tab. The character is repeated as required to fill the tab space. Possible values are: |

- dot \- a dot
- heavy \- a heavy solid line or underscore
- hyphen \- a hyphen or dash
- middleDot \- a centered dot
- none \- no leader character
- underscore \- an underscore

pos | Specifies the position of the tab stop. Values are in twips (1440 twips = one inch). Negative values are permitted and move the page margin the specified amount.  
val | Specifies the style of the tab. Possible values are:

- bar \- a bar tab does not result in a tab stop in the parent paragraph but instead a vertical bar is drawn at the location.
- center \- all text folowing and preceding the next tab shall be centered around the tab.
- clear \- the current tab stop is cleared and shall be removed.
- decimal \- all following text is aligned around the first decimal character in the following text.
- end \- all following and preceding text is aligned against the trailing edge.
- num \- a list tab or the tab between the numbering and the contents. This is for backward compatibility and should be avoided in favor of paragraph indentation.
- start \- all following and preceding text is aligned against the leading edge.

### Related CSS property:

No directly corresponding CSS element, but see [Paragraph Indentation](WPindentation.md) for use of CSS's text-indent.
