# DrawingML Shapes

Text - Paragraph Properties

The properties of a paragraph within a shape are specified as either attributes or child elements of the <a:pPr> element within the paragraph (<a:p>). Note that this is a clear difference with paragraph properties in a wordprocessingML document, which are only specified as child elements, not attributes.

It is important to remain mindful of the hierarchy of properties. Properties that are defined at a level closer to the actual text take precedence in the event of a conflict. So, for example, if there is a conflict between the <a:pPr> and the list style <a:lvl1pPr>, then the <a:pPr> takes precedence since in the property hierarchy it is closer to the text.
