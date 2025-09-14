# Wordprocessing Paragraphs

Spacing

Spacing between paragraphs and between lines of a paragaph is defined with the <w:spacing> element.

<w:pPr>

<w:spacing w:before="120" w:after="120" w:beforeAutospacing="0" w:afterAutospacing="0"/>

</w:pPr>

<w:pPr>

<w:spacing w:before="360" w:after="120" w:line="480" w:lineRule="auto" w:beforeAutospacing="0" w:afterAutospacing="0"/>

</w:pPr>

<w:pPr>

<w:spacing w:before="120" w:after="120" w:beforeAutospacing="0" w:afterAutospacing="0"/>

</w:pPr>

Values are in twentieths of a point. A normal single-spaced paragaph has a w:line value of 240, or 12 points. To specify units in hundreths of a line, use attributes 'afterLines'/'beforeLines'.

The space between adjacent paragraphs will be the greater of the 'line' spacing of each paragraph, the spacing after the first paragraph, and the spacing before the second paragraph. So if the first paragraph specifies 240 after and the second 80 before, and they are both single-spaced ('line' value of 240), then the space between the paragraphs will be 240.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.33.

Word 2007 Example:

![sample line spacing](images\wp-spacing-1.gif)

---

### Attributes:

The most commonly used attributes are:

| Attribute         | Description                                                                                                                                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| after             | Specifies the spacing (in absolute units) that should be added after the last line of the paragraph.                                                                                                                                                                                                                                                   |
| before            | Specifies the spacing (in absolute units) that should be added before the first line of the paragraph.                                                                                                                                                                                                                                                 |
| line              | Specifies the amount of vertical spacing between lines of text within the paragraph. ![](images/note.png)Note: If the value of the lineRule attribute is atLeast or exactly, then the value of the line attribute is interpreted as 240th of a point. If the value of lineRule is auto, then the value of line is interpreted as 240th of a line.      |
| lineRule          | Specifies how the spacing between lines as specified in the line attribute is calculated. ![](images/note.png)Note: If the value of the lineRule attribute is atLeast or exactly, then the value of the line attribute is interpreted as 240th of a point. If the value of lineRule is auto, then the value of line is interpreted as 240th of a line. |
| beforeAutospacing | Specifies whether spacing before the paragraph should be determined by the consumer/wordprocessor. ![](images/note.png)Note: If this is set to true (i.e., ='1' or ='true'), then any value for before or beforeLines is ignored.                                                                                                                      |
| afterAutospacing  | Specifies whether spacing after the paragraph should be determined by the consumer/wordprocessor. ![](images/note.png)Note: If this is set to true (i.e., ='1' or ='true'), then any value for after or afterLines is ignored.                                                                                                                         |

### Related CSS property:

margin-top:2em;  
line-height:2;

CSS Example:

I feel that there is much to be said for the Celtic belief that the souls of those whom we have lost are held captive in some inferior being, in an animal, in a plant, in some inanimate object, and so effectively lost to us until the day (which to many never comes) when we happen to pass by the tree or to obtain possession of the object which forms their prison.

Then they start and tremble, they call us by our name, and as soon as we have recognized their voice the spell is broken. We have delivered them: they have overcome death and return to share our life. And so it is with our own past. It is a labor in vain to attempt to recapture it: all the efforts of our intellect must prove futile.

The past is hidden somewhere outside the realm, beyond the reach of intellect, in some material object (in the sensation which that material object will give us) which we do not suspect. And as for that object, it depends on chance whether we come upon it or not before we ourselves must die
