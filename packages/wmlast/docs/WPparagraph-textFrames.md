# WordprocessingML \- Text Frames

A text frame is a paragraph of text that is positioned in a separate region in the document with a specific size and position relative to non-frame paragraphs. A text frame is similar to a text box. Both are containers for text that can be positioned on a page and sized. Text boxes have more flexibility for formatting. Text boxes are part of the drawingML specification and are discussed in more detail [there](http://www.officeopenxml.com/drwSp-textbox.md). Text frame are part of wordprocessingML and are less complex.

A text frame paragraph is simply a paragraph with a <w:framePr> as a child element of the <w:pPr>. The <w:framePr> element is an empty element with a number of possible attributes to specify characteristics of the frame. Adjacent paragraphs can both be text frames paragraphs. If the set of attributes on <w:framePr> on two adjacent paragraphs is identical, then they are considered to be part of the same text frame. Every attribute has to be identical or they will be treated as separate text frames. The positioning of a text frame is calculated relative to the next paragraph in the document which is not a text frame paragraph.

Below is a sample text frame.

<w:p>

<w:pPr>

<w:framePr w:w="3500" w:h="3500" w:wrap="auto" w:vAnchor="page" w:hAnchor="page" w:xAlign="right" w:yAlign="top"/>

<w:pBdr>

<w:left w:val="single" w:sz="12" w:space="1" w:color="auto"/>

<w:bottom w:val="single" w:sz="12" w:space="1" w:color="auto"/>

</w:pBdr>

<w:rPr>

<w:sz w:val="24"/>

<w:szCs w:val="24"/>

<w:rPr>

</w:pPr>

<w:r>

<w:rPr>

<w:sz w:val="24"/>

<w:szCs w:val="24"/>

<w:rPr>

<w:t>This is the text frame paragraph.</w:t>

</w:r>

</w:p>

Below is what the text frame looks like -- in the upper right corner of the page.

![WordprocessingML - Text Frames](images\WPtextFrame1.gif)

The attributes of <w:framePr> which define the characteristics of the text frame are below.

| Attributes | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| anchorLock | Specifies that the frame should remain in the same logical position relative to the non-frame paragraphs. Values are booleans. When the value is true and the text frame has a locked anchor, the text frame paragraph position is maintained in the xml relative to the other non-frame paragraphs even though the visual location is changed.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| dropCap    | A drop cap is a way of starting a paragraph by increasing the size of the first letter or letters of the paragraph. Drop caps are implemented as text frames. That is, the large letter is placed in a text frame and the remainder of the paragraph (sized normally) is placed in the following non-text frame. This attribute specifies how the large letter is positioned relative to the following normally sized text in the non-text frame paragraph. Possible values are margin (the frame is positioned outside the text margin), drop (the frame is positioned inside the text margin), and none (the text frame is not a drop cap frame). Below is a sample of a drop cap with the value set to drop: <w:framePr w:dropCap="drop" . . . />. See the lines below for the height of the drop cap. ![WordprocessingML - Text Frames](images\WPtextFrame2.gif) |
| h          | Specifies the frame's height in Twips or twentieths of a point. This attribute operates in conjunction with the hRule attribute. If the value of hRule is auto, then the height value is ignored and the height is based on the height of the content. If the value is atLeast, then the height of the frame should be at least the value specified in the h attribute. If the value is exact, then the height of the frame should be exactly the value specified in the h attribute.                                                                                                                                                                                                                                                                                                                                                                                |
| hAnchor    | Specifies the object from which the frame should be anchored horizontally. It is from this object that the horizontal positioning as specified by the x attribute is determined. Possible values are margin (horizontal positioning shall be calculated with respect to text margin), page (horizontal positioning shall be calculated with respect to the edge of the page), and text (horizontal positioning shall be calculated with respect to the edge of the text, including text indentation). Below is first a text frame with a hAnchor and a vAnchor set to page. ![WordprocessingML - Text Frames](images\WPtextFrame3.gif) Below is the sample text frame shwon above, but with hAnchor set to margin and vAnchor set to text. ![WordprocessingML - Text Frames](images\WPtextFrame4.gif)                                                                |
| hRule      | See the discussion of the h attribute above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| hSpace     | Specifies the minimum distance to be maintained between the current text frame and any non-frame text wrapping around. Values are in twentieths of a point. Below is the text frame from above, but with an hSpace value of 1440 or 1 inch. ![WordprocessingML - Text Frames](images\WPtextFrame5.gif)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| lines      | Specifies the height of the drop cap in lines. Default value is 1.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| vAnchor    | Specifies the object from which the frame should be anchored vertically. It is from this object that the vertical positioning as specified by the y attribute is determined. Possible values are margin (vertical positioning shall be calculated with respect to the top horizontal text margin), page (vertical positioning shall be calculated with respect to the edge of the page), and text (vertical positioning shall be calculated with respect to the top horizontal edge of the text). See the example in the discussion of hAnchor above.                                                                                                                                                                                                                                                                                                                |
| vSpace     | Specifies the minimum distance to be maintained vertically between the current text frame and any non-frame text above or below. Values are in twentieths of a point.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| w          | Specifies the frame's width in Twips or twentieths of a point. When the attribute is omitted, the width is determined by the content of the frame.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| wrap       | Specifies the style of text wrapping around the text frame. Possible values are:                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

- around \- text should wrap around each line of text
- auto \- determined by the application
- none \- no wrapping
- notBeside \- text should not wrap around the remaining lines of the text frame; text is placed on the next line following the text frame which does not intersect the frame
- through \- text should wrap around the remaining space on each line around the text frame
- tight \- text should tightly wrap around the remaining space on each line around the text frame

Below is a sample with wrap set to none. ![WordprocessingML - Text Frames](images\WPtextFrame6.gif) Below is a sample with wrap set to through. ![WordprocessingML - Text Frames](images\WPtextFrame7.gif)  
x | Specifies an absolute horizontal position for the text frame. It is specified relative to the horizontal anchor specified by the hAnchor attribute. Values are in twentieths of a point. If the value is positive, the text frame is positioned after the anchor object. If the value is negative, it is positioned before the anchor object. If the xAlign attribute is also specified, this value is ignored. If omitted, the value is assumed to be 0.  
xAlign | Specifies a relative horizontal position for the text frame - relative to the anchor specified by the hAnchor attribute. If omitted, then value specified by the x attribute is used to determine the absolute horizontal positioning. Possible values are:

- center \- centered horizontally
- inside \- the parent object should be inside of the anchor object, such as inside the text margin horizontally
- left \- the parent object should be left-aligned with respect to the anchor
- outside \- the parent object should be outside of the anchor object, such as outside the text margin horizontally
- right \- the parent object should be right-aligned with respect to the anchor

Below is a sample with the hAnchor attribute set to margin, the xAlign set to left, the vAnchor attribute set to text, and the yAlign set to center. ![WordprocessingML - Text Frames](images\WPtextFrame8.gif)  
y | Specifies an absolute vertical position for the text frame. It is specified relative to the vertical anchor specified by the vAnchor attribute. Values are in twentieths of a point. If the value is positive, the text frame is positioned after the anchor object. If the value is negative, it is positioned before the anchor object. If the xAlign attribute is also specified, this value is ignored. If omitted, the value is assumed to be 0.  
yAlign | Specifies a relative vertical position for the text frame - relative to the anchor specified by the vAnchor attribute. If omitted, then value specified by the y attribute is used to determine the absolute vertical positioning. Possible values are:

- bottom \- the parent object should be vertically aligned to the bottom edge of the anchor
- center \- centered vertically
- inline \- the parent object should be vertically aligned in line with the surrounding text --i.e., no wrapping of text around it
- inside \- the parent object should be vertically aligned to the edge of the anchor and inside of the anchor object
- outside \- the parent object should be vertically aligned to the edge of the anchor and outside of the anchor object
- top \- the parent object should be vertically aligned to the top edge of the anchor
