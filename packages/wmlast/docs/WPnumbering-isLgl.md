# Wordprocessing Numbering

Related Open Office/ODF Discussion  
Related HTML/CSS Discussion

Defining a Particular Level - Displaying as Numerals Only

The format of the numbering at a given level can be set to Arabic numerals by including a <w:isLgl> element in the level definition. The <w:isLgl> element specifies that the format for the numbering at this level should be in the decimal format, regardless of what is specified in the <numFmt> element. For example, below is the definition of the fourth level in a numbering definition.

<w:lvl w:ilvl="3">

<w:start w:val="1"/>

<w:numFmt w:val="lowerLetter"/>

<w:lvlText w:val="%4."/>

<w:lvlJc w:val="start"/>

<w:pStyle w:val="Heading4"/>

<w:pPr>

<w:ind w:start="2160" w:firstLine="0"/>

</w:pPr>

</w:lvl>

Word 2007 Example:

Below is how the level defined above appears (without the isLgl):

![isLgl Numbering Scheme for Outline](images\wp-numberingLvl-1.gif)

---

By adding the isLgl, we get the following:

<w:lvl w:ilvl="3">

<w:start w:val="1"/>

<w:numFmt w:val="lowerLetter"/>

<w:isLgl/>

<w:lvlText w:val="%4."/>

<w:lvlJc w:val="start"/>

<w:pStyle w:val="Heading4"/>

<w:pPr>

<w:ind w:start="2160" w:firstLine="0"/>

</w:pPr>

</w:lvl>

Word 2007 Example:

![abstractNum Numbering Scheme for Outline](images\wp-numberingLvl-2.gif)

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.9.4.

---

# Related Open Document Format (ODF) Property:

The format of the numbering at a given level of a list is specified by the style:num-format attribute within the <text:list-level-style-number> element for the level defined within the <text:list-style> applied to the list.

Reference: Open Document Format for Office Applications Version 1.2 (May, 2011) § 16.32 and § 19.500.

The following sample defines the format for level 4 of the list as an Arabic number.

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

The possible attribute values for style:num-format are 1 for Arabic number sequences, a for lowercase Latin alphabet characters, A for uppercase Latin alphabet characters, i for lowercase Roman numerals, I for uppercase Roman numerals, a string, or the empty string so that no number sequence is displayed.

# Related HTML/CSS Property:

<ol>

<li style="list-style-type:upper-roman;">This is the first level.

<ol>

<li style="list-style-type:upper-alpha;">This is the second level.

<ol>

<li style="list-style-type:decimal;">This is the third level.

<ol>

<li style="list-style-type:decimal;">This is the fourth level.</li>

</ol>

</li>

</ol>

</li>

</ol>

</li>

<li style="list-style-type:upper-roman;">This is also the first level.</li>

</ol>

HTML/CSS Example:

1. This is the first level.
1. This is the second level.
1. This is the third level.
1. This is the fourth level.
1. This is also the first level.
