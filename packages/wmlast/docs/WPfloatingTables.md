# Wordprocessing Tables

Floating Tables

A floating table is a table which is not part of the main text flow in the document but is instead absolutely positioned with a specific size and position relative to non-frame content in the document. A floating table is specified with the <w:tblpPr> element within the <w:tblPr> element.

![](images/note.png)Note: Positioning of the table is relative to its top-left corner. Anchors (e.g., margin, page, or text) are specified in attributes (tblpX and tblpY), from which measurements (also specified in attributes) for placement of the table are specified. Distance from surrounding text can also be specified in other attributes.

<w:tblPr>

<w:tblpPr w:leftFromText="144" w:rightFromText="144" w:topFromText="144" w:bottomFromText="144" w:vertAnchor="page" w:horzAnchor="page" w:tblpX="4320" w:tblpY="4320"/>

</w:tblPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.58.

Word 2007 Example:

![Floating Table](images\wp-floatingTable-1.gif)

---

### Attributes:

The attributes are:

| Attribute  | Description                                                                                                                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| horzAnchor | Specifies the horizontal anchor or the base object from which the horizontal positioning in the tblpX or tblpXSpec attribute should be determined. Possible values are: |

- margin - relative to the vertical edge of the text margin before any text runs (left edge for left-to-right paragraphs)
- page - relative to the vertical edge of the page before any text runs (left edge for left-to-right paragraphs)
- text - relative to the vertical edge of the text margin for the column in which the anchor paragraph is located

If omitted, the value is assumed to be page.  
vertAnchor | Specifies the vertical anchor or the base object from which the vertical positioning in the tblpY attribute should be determined. Possible values are:

- margin - relative to the horizontal edge of the text margin before any text runs (top edge for top-to-bottom paragraphs)
- page - relative to the horizontal edge of the page before any text runs (top edge for top-to-bottom paragraphs)
- text - relative to the horizontal edge of the text margin for the column in which the anchor paragraph is located

If omitted, the value is assumed to be page.  
tblpX | Specifies an absolute horizontal position for the table, relative to the horzAnchor anchor. The value is in twentieths of a point. Note that the value can be negative, in which case the table is positioned before the anchor object in the direction of horizontal text flow. If tblpXSpec is also specified, then the tblpX attribute is ignored. If the attribute is omitted, the value is assumed to be zero.  
tblpXSpec | Specifies a relative horizontal position for the table, relative to the horzAnchor attribute. This will supersede the tblpX attribute. Possible values are:

- center - the table should be horizontally centered with respect to the anchor
- inside - the table should be inside of the anchor
- left - the table should be left aligned with respect to the anchor
- outside - the table should be outside of the anchor
- right - the table should be right aligned with respect to the anchor

tblpY | Specifies an absolute vertical position for the table, relative to the vertAnchor anchor. The value is in twentieths of a point. Note that the value can be negative, in which case the table is positioned before the anchor object in the direction of vertical text flow. If tblpYSpec is also specified, then the tblpX attribute is ignored. If the attribute is omitted, the value is assumed to be zero.  
tblpYSpec | Specifies a relative vertical position for the table, relative to the vertAnchor attribute. This will supersede the tblpY attribute. Possible values are:

- center - the table should be vertically centered with respect to the anchor
- inside - the table should be vertically aligned to the edge of the anchor and inside the anchor
- bottom - the table should be vertically aligned to the bottom edge of the anchor
- outside - the table should be vertically aligned to the edge of the anchor and outside the anchor
- inline - the table should be vertically aligned in line with the surrounding text (so as to not allow any text wrapping around it)
- top - the table should be vertically aligned to the top edge of the anchor

bottomFromText | Specifies the minimun distance to be maintained between the table and the top of text in the paragraph below the table. The value is in twentieths of a point. If omitted, the value is assumed to be zero.  
topFromText | Specifies the minimun distance to be maintained between the table and the bottom edge of text in the paragraph above the table. The value is in twentieths of a point. If omitted, the value is assumed to be zero.  
leftFromText | Specifies the minimun distance to be maintained between the table and the edge of text in the paragraph to the left of the table. The value is in twentieths of a point. If omitted, the value is assumed to be zero.  
rightFromText | Specifies the minimun distance to be maintained between the table and the edge of text in the paragraph to the right of the table. The value is in twentieths of a point. If omitted, the value is assumed to be zero.

Overlapping Tables

Since floating tables are outside of the normal flow of text and can be postiioned absolutely, the potential exists for multiple floating tables to overlap. However, overlapping can be prevented with the <w:tblOverlap> element within the <w:tblPr> element. This element specifies whether the table allows other floating tables to overlap it.

<w:tblOverlap> has just one attribute, val, with the following possible values:

- never \- the parent table cannot be displayed where it would overlap with another floating table
- overlap \- the parent table can be displayed where it overlaps another floating table

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.57.

### Overlapping allowed

<w:tblPr>

<w:tblpPr w:leftFromText="144" w:rightFromText="144" w:topFromText="144" w:bottomFromText="144" w:vertAnchor="page" w:horzAnchor="page" w:tblpX="4120" w:tblpY="4120"/>

. . . JJJ . . . KKK . . . etc.

</w:tblPr>

<w:tblPr>

<w:tblpPr w:leftFromText="144" w:rightFromText="144" w:topFromText="144" w:bottomFromText="144" w:vertAnchor="page" w:horzAnchor="page" w:tblpX="4320" w:tblpY="4320"/>

. . . AAA . . . BBB . . . etc.

</w:tblPr>

Word 2007 Example:

![Overlapping Tables](images\wp-tableOverlap-1.gif)

---

### Overlapping not allowed

<w:tblPr>

<w:tblpPr w:leftFromText="144" w:rightFromText="144" w:topFromText="144" w:bottomFromText="144" w:vertAnchor="page" w:horzAnchor="page" w:tblpX="4120" w:tblpY="4120"/>

<w:tblOverlap w:val="never"/>

. . . JJJ . . . KKK . . . etc.

</w:tblPr>

<w:tblPr>

<w:tblpPr w:leftFromText="144" w:rightFromText="144" w:topFromText="144" w:bottomFromText="144" w:vertAnchor="page" w:horzAnchor="page" w:tblpX="4320" w:tblpY="4320"/>

<w:tblOverlap w:val="never"/>

. . . AAA . . . BBB . . . etc.

</w:tblPr>

Word 2007 Example:

![Overlapping Tables](images\wp-tableOverlap-2.gif)

---

### Related CSS property:

Aspects of the OOXML floating table can be replicated with CSS, but with severe limitations. Tables can be positioned using the position property, but then the table is removed from the flow of content and overlapping may occur. A table can be made to float left or right relative to its containing block using the float property, but then specific or absolute positioning is not available.

And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile. The past is hidden somewhere outside the realm, beyond the reach of intellect, in some material object (in the sensation which that material object will give us) which we do not suspect.

<table style="position: relative; left:50px; top:10px;">

. . .

</table>

And as for that object, it depends on chance whether we come upon it or not before we ourselves must die.

<table style="float: right;">

. . .

</table>

Many years had elapsed during which nothing of Combray, save what was comprised in the theatre and the drama of my going to bed there, had any existence for me, when one day in winter, as I came home, my mother, seeing that I was cold, offered me some tea, a thing I did not ordinarily take.

CSS Example:

And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile. The past is hidden somewhere outside the realm, beyond the reach of intellect, in some material object (in the sensation which that material object will give us) which we do not suspect.

| AAA                                                                                                           | BBB | CCC |
| ------------------------------------------------------------------------------------------------------------- | --- | --- |
| DDD                                                                                                           | EEE | FFF |
| And as for that object, it depends on chance whether we come upon it or not before we ourselves must die. GGG | HHH | III |
| ---                                                                                                           | --- | --- |
| JJJ                                                                                                           | KKK | LLL |

Many years had elapsed during which nothing of Combray, save what was comprised in the theatre and the drama of my going to bed there, had any existence for me, when one day in winter, as I came home, my mother, seeing that I was cold, offered me some tea, a thing I did not ordinarily take.
