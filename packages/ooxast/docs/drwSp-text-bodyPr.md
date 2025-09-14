# DrawingML Shapes

Text - Body Properties

Text within a shape can be divided into three levels of precision: overall body properties, paragraph properties, and run properties. The overall properties of text within a shape are defined within a <a:bodyPr> element, which is a child element of <p:sp> or <xdr:sp>. Note that it and its child elements are within the main drawingML namespace (prefix a). Properties of a particular paragraph or run can be set within the <a:pPr> and <a:rPr> elements, which are descendants of the <a:p> element.

Most text body properties are specified with attributes of <a:bodyPr>. However, a few properties, mostly related to the fit within the shape, text warping, and 3D properties, are specified with child elements.
