# Wordprocessing Numbering

Defining a Particular Level - Restart Numbering

Typically a level will restart numbering at the start value when a new instance of the next higher level appears. For example, in the outline example below, we normally expect that when the B appears, the lower-level numbering will restart (1, 2, 3, etc.) instead of continue (3, 4, 5, etc.)

I. This is the first level

A. This is the second level

1\. This is the third level.

2\. This is the third level.

B. This is the second level

1\. This is the third level.

2\. This is the third level.

This restart behavior can be specified with the <w:lvlRestart w:val=" "/> element. The val attribute specifies when numbering should restart for the level. When a new instance of the level represented by the val value appears, renumbering occurs at the level for which the lvlRestart is specified. (Keep in mind that this is a one-based index, so the first level is 1, the second is 2, etc.) So, for example, in the sample below, the third level (w:lvl w:ilvl="2") has a <w:lvlRestart w:val="1"/>, which means that renumbering occurs at the third level any time a new instance of the first level appears.

<w:lvl w:ilvl="0">

<w:start w:val="1"/>

<w:numFmt w:val="upperRoman"/>

<w:lvlText w:val="%1."/>

<w:lvlJc w:val="start"/>

<w:pPr>

<w:ind w:start="0" w:firstLine="0"/>

</w:pPr>

</w:lvl>

<w:lvl w:ilvl="1">

<w:start w:val="1"/>

<w:numFmt w:val="upperLetter"/>

<w:lvlText w:val="%2."/>

<w:lvlJc w:val="start"/>

<w:pPr>

<w:ind w:start="720" w:firstLine="0"/>

</w:pPr>

</w:lvl>

<w:lvl w:ilvl="2">

<w:start w:val="1"/>

<w:numFmt w:val="decimal"/>

<w:lvlRestart w:val="1"/>

<w:lvlText w:val="%3."/>

<w:lvlJc w:val="start"/>

<w:pPr>

<w:ind w:start="1440" w:firstLine="0"/>

</w:pPr>

</w:lvl>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.9.11.

Word 2007 Example:

![Level Numbering Restart](images\wp-numberingRestart-1.gif)

---

### Attributes:

There is just one attribute:

| Attribute | Description                                                                                                                                                                                                                                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| val       | Specifies the level number which will trigger numbering to restart the level being defined. When an instance of the level specified in the attribute appears, renumbering will occur. If the value is higher than the current level being defined, the element is ignored. A value of 0 means the level never restarts. |

### Related HTML/CSS property:

There is no direct counterpart.
