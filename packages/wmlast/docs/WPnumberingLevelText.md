# Wordprocessing Numbering

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Defining a Particular Level - Numbering Level Text

The text to be displayed at a level is specified with the <w:lvlText w:val=" "/> element. All text in the val attribute is treated as literal text to appear in each instance, except for any use of the percent symbol (%) followed by a number. That percent-number combination represents the index of the level whose number is to be used. The index is one-based (begins with 1). So, for example, %2 indicates that the symbol/number/letter used at the second level (w:lvl w:ilvl="1") should be used.

In the example below, the first level uses Roman numerals as the numbering symbol, the second uses upper-case letters, and the third incorporates text, the previous level symbols, as well as hyphens and the symbol specified for the level (decimal number).

<w:lvl w:ilvl="0">

<w:start w:val="1"/>

<w:numFmt w:val="upperRoman"/>

<w:pStyle w:val="Heading1"/>

<w:lvlText w:val="%1."/>

<w:lvlJc w:val="start"/>

<w:pPr>

<w:ind w:start="0" w:firstLine="0"/>

</w:pPr>

</w:lvl>

<w:lvl w:ilvl="1">

<w:start w:val="1"/>

<w:numFmt w:val="upperLetter"/>

<w:pStyle w:val="Heading2"/>

<w:lvlText w:val="%2."/>

<w:lvlJc w:val="start"/>

<w:pPr>

<w:ind w:start="720" w:firstLine="0"/>

</w:pPr>

</w:lvl>

<w:lvl w:ilvl="2">

<w:start w:val="1"/>

<w:numFmt w:val="decimal"/>

<w:pStyle w:val="Heading3"/>

<w:lvlText w:val="Sub %1-%2-%3. "/>

<w:lvlJc w:val="start"/>

<w:pPr>

<w:ind w:start="1440" w:firstLine="0"/>

</w:pPr>

</w:lvl>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.9.12.

Word 2007 Example:

![Numbering Level Text](images\wp-numbering-lvlText-1.gif)

---

### Attributes:

| Attribute | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| null      | Specifies that a null character should be used as the numbering symbol: <w:lvlText w:null="1"/>. Possible values are either true (or 1) or false (or 0). Note that turning this to true will mean a null character is used, not the empty string.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| val       | Specifies the text to be used for the numbering level when referenced in content. If a value is not specified, then the empty string is used. A percent-number combination (e.g., %2) can be used to incorporate the number from a higher level. The number in such a case represents the index of the level whose numbering symbol is to be used. The index is one-based (begins with 1). So %2 will incorporate the symbol from the second level. Note that the level being defined (say level x) will typically incorporate its own level number in some way using %x. This will output the appropriate number based upon what is specified for the format numFmt for that level and based upon how many have appears since a restart of numbering at that level. So if level x specifies %x and the numFmt is upperLetter and it is the fifth appearance of the level in the content, then the output for the level will be "E". |

---

# Related Open Document Format (ODF) Property:

The text that is used in a numbered or bulletted list item or within an outline heading is specified by the style:num-prefix, style:num-suffix, and style:num-format attributes within the <text:list-level-style-number>, <text:list-level-style-bullet> or <text:outline-level-style> element for the level defined within the <text:list-style> applied to the list or for the outline style applied to the heading.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) §§ 19.502 (prefixes), 19.503 (suffixes), and 19.500 (number format).

The following sample defines the text for level 4 of the list as an Arabic numbers followed by a close parenthesis--e.g., 1), 2), etc.

<style:style style:name="P1" style:family="paragraph" style:parent-style-name="Standard" style:list-style-name="L3"/>

<text:list-style style:name="L3">

. . .

<text:list-level-style-number text:level="4" style:num-suffix=")" style:num-format="1">

<style:list-level-properties text:list-level-position-and-space-mode="label-alignment">

<style:list-level-label-alignment text:label-followed-by="listtab" text:list-tab-stop-position="1.25in" fo:text-indent="-0.25in" fo:margin-left="1.25in"/>

</style:list-level-properties>

</text:list-level-style-number>

. . .

</text:list-style>

The format of the actual variable number or of the bullet character is specified by the style:num-format or style:bullet-char attribute, respectively. See the ODF discussion in [Defining a Particular Level - Displaying as Numerals Only](WPnumbering-isLgl.md) for more on the style:num-format attribute. The prefix and suffix of the number or bullet character are specified with literal text for the values of style:num-prefix and style:num-suffix.

# Related HTML/CSS Property:

There is no direct counterpart which enables the building of a level or numbering symbol from text and upper-level symbols. Each level is iindependent of all others.
