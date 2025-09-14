# Wordprocessing Hyperlinks

External Links

Links are specified with the <w:hyperlink> element. Links to locations external to the document and links to locations within the document are handled differently based upon the presence or not of the r:id attribute. If the link is to an external target, then the r:id attribute is specified, which is the ID of a relationship stored in the relationship part (document.xml.rels). That relationship has a value of External for the TargetMode attribute. A specific location within the target for the link can be specified with the docLocation attribute. See attributes below.

<w:p>

<w:r>

<w:t xml:space="preserve">This is an external link to </w:t>

</w:r>

<w:hyperlink r:id="rId4">

<w:r>

<w:rPr>

<w:rStyle w:val="Hyperlink"/>

</w:rPr>

<w:t>Google</w:t>

</w:r>

</w:hyperlink>

</w:p>

The r:id="rId4" references the following relationship within the relationships part for the document (document.xml.rels).

<Relationship Id="rId4" Type="http://. . ./hyperlink" Target="http://www.google.com/" TargetMode="External"/>

Word 2007 Example:

![External Hypertext](images\wp-hyperlink-1.gif)

---

Internal Links

An internal link is specified by including the anchor attribute with the value of a bookmark within the document.

<w:p>

<w:r>

<w:t xml:space="preserve">This is an </w:t>

</w:r>

<w:hyperlink w:anchor="myAnchor">

<w:r>

<w:rPr>

<w:rStyle w:val="Hyperlink"/>

</w:rPr>

<w:t>internal link</w:t>

</w:r>

</w:hyperlink>

</w:p>

. . .

<w:p>

<w:r>

<w:t xml:space="preserve">This is text with a </w:t>

</w:r>

<w:bookmarkStart w:id="0" w:name="myAnchor"/>

<w:r>

<w:t>bookmark</w:t>

</w:r>

<w:bookmarkEnd w:id="0"/>

</w:p>

Word 2007 Example:

![Internal Hypertext](images\wp-bookmark-1.gif)

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.22.

### Attributes:

The most commonly used attributes are:

| Attribute   | Description                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| anchor      | Specifies the name of a bookmark within the document. See [Bookmark](WPbookmark.md). If the attribute is omitted, then the default behavior is to navigate to the start of the document. If the r:id attribute is specified, then the anchor attribute is ignored. |
| docLocation | Specifies a location in the target of the hyperlink, in the case in which the link is an external link. <w:hyperlink r:id="rId9" w:docLocation="table"> <w:r> <w:t>Click Here</w:t> </w:r> </w:hyperlink>                                                          |
| history     | Specifies whether the target should be added to the list of viewed links. Possible values are true and false.                                                                                                                                                      |
| id          | Specifies the ID of the relationship in the relationships part for an external link. The relationship will contain a Target attribute which is the target of the link. If the id attribute is specified, it supersedes the anchor attribute.                       |
| tgtFrame    | Specifies a frame within the HTML frameset for the target when a frameset exists. If no frameset exists, then this attribute is ignored. Possbile values are:                                                                                                      |

- \_top - opens in the current window
- \_self - opens in the same frame as the link
- \_parent - opens in the parent of the current frame
- \_blank - opens in a new web browser window
- all other values - opens in the frame with the specified name, otherwise opens in the current frame

tooltip | Specifies a string that can be displayed as associated with the hyperlink in the user interface.

### Related HTML property:

#### External link

<p><a href="http://www.google.com">This link goes to Google.com.</a></p>

HTML Example:

[This link goes to Google.com.](http://www.google.com)

#### Internal link

<p><a href="#myAnchor">This link goes to the anchor at the Internal Links heading above.</a></p>   
  
<div><a name="myAnchor">Internal Links</a></div>

HTML Example:

This link goes to the anchor at the Internal Links heading above.
