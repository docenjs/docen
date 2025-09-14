# Wordprocessing Document

The <w:document> element is the root element of the main content part.

<w:document>

<w:body>

<w:p/>

</w:body>

</w:document>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference §§ 17.2.3.

### Elements:

The <w:document> element can contain the elements below.

| Element    | Description                                                                                                                                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ----------- |
| background | Specifies the background for every page of the document. The background can be either an DrawingML object or a sold color. If it is a DrawingML object, then the background element contains a drawing element. If a solid color is used, then background is an empty element, with the color specified in the following attributes. | Attribute | Description |
| ---        | ---                                                                                                                                                                                                                                                                                                                                  |
| color      | Specifies the color. Possible values are either hex-encoded RGB values (in RRGGBB format) or auto. E.g., <w:background w:color="2C34FF"/>                                                                                                                                                                                            |
| themeColor | Specifies the base theme color (which is specified in the Theme part). E.g., <w:background w:themeColor="accent5"/>                                                                                                                                                                                                                  |
| themeShade | Specifies the shade value applied to the theme color (in hex encoding of values 0-255). E.g., <w:background w:themeColor="accent2" w:themeShade="BF"/>                                                                                                                                                                               |
| themeTint  | Specifies the tint value applied to the theme color (in hex encoding of values 0-255). E.g., <w:background w:themeColor="accent2" w:themeTint="99"/>                                                                                                                                                                                 |

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.2.1.

body | Specifies the contents of the body of the document. It has no attributes. It can contain a number of elements, most related to tracking changes and adding customer XML. The core elements are listed below.

### Elements:

| Element | Description                                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| p       | Specifies a paragraph of content. See [Paragraphs](WPparagraph.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.1.22.                 |
| sectPr  | Specifies the section properties for the final section. See [Sections](WPsection.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.6.17. |
| tbl     | Specifies a table. See [Tables](WPtable.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.4.38.                                          |

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.2.2.

### Attributes:

<w:document> has a single attribute:

| Attribute   | Description                                                                          |
| ----------- | ------------------------------------------------------------------------------------ |
| conformance | Specifies the conformance class to which the document conforms. Possible values are: |

- strict \- the document conforms to Office Open XML Strict
- transitional \- the document conforms to Office Open XML Transitional. This is the default value.

### Related HTML element:

<html>

<head>

...

</head>

<body>

...

</body>

</html>
