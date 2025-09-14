# DrawingML Object Positioning

Positioning within a Word Processing Document

A drawingML object within a word processing document is specified by a <w:drawing> element which is typically placed within a run (<w:r>). It can also be a background (<w:background>) or the picture for a bullet (<w:numPicBullet>).

<w:r>

<w:rPr>

. . .

</w:rPr>

<w:drawing>

. . .

</w:drawing>

</w:r>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.9.

The <w:drawing> element specifies a DrawingML object. The details of the object and its positioning are specified in the DrawingML namespaces, with prefixes in Word such as wp, pic, and a. DrawingML objects in word processing documents can be either inline or floating. Inline objects are inline with the text and affect the line height and layout of the line. They are inserted into a <w:drawing> element with a <wp:inline> element. Note the different namespaces. The <w:drawing> element is within the main wordprocessing namespace: xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main". The XML for placement of the picture is within the wordprocessing drawingML namespace: xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing". And the definition of the picture itself is within the picture namespace: xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture". See [Positioning within a Word Processing Document - Inline](drwPicInline.md) for details on inline placement.

Word 2007 Example:

Below is an example of a picture that is inline.

![Inline Picture](drwImages\drwInline.gif)

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.4.2.8.

A floating object is anchored within the text but can be absolutely positioned in the document relative to the page. Text floats around the object. They are inserted into a <w:drawing> element with an <wp:anchor> element. See [Positioning within a Word Processing Document - Floating](drwPicFloating.md) for details. Below is an example of a floating picture.

Word 2007 Example:

![Anchored Picture](drwImages\drwAnchor.gif)

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 20.4.2.3.
