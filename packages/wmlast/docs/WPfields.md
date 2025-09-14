# Wordprocessing Fields

Overview

Fields are a way of inserting variable data into a document--data such as the date, page number, the number of table or figure. They are essentially placeholders for data that can change, and they instruct the consuming application to insert text, grahics, page numbers and other material into a document automatically. The text, graphics or other content that is inserted is referred to as the field result. The default value for a field result is an empty string. The act of carrying out the field's instructions is referred to as a field update.

A field can be represented in XML either as a simple field using the <w:fldSimple> element or as a complex field using a set of runs (<w:r>) involving <w:fldChar> and <w:instrText> elements. Every simple field can be implemented as a complex field, but not every complex field can be implemented as a simple field. If some characters in a field have different run properties than others, then that field must be implemented using multiple runs, which requires a complex field.

### Simple Fields

A simple field is placed within the document using the <w:fldSimple> element, typically within a paragraph <w:p> element. The type of data inserted by the field (that is, the field function) and formatting are specified by the <w:instr> attribute. The <w:fldSimple> element will contain a run with a cached version of the field value from the last time the field was updated. When a simple field is updated, its child elements are replaced with updated values in the appropriate WordProcessingML form. Below is a simple field for the document author's name.

<w:fldSimple w:instr="AUTHOR">

<w:r>

<w:t>Marcel Proust</w:t>

</w:r>

</w:fldSimple>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.19.

### Child Elements of <w:fldSimple>:

The most commonly used child elements are below.

| Element       | Description                                                                                                                                                                                                                                              |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bookmarkEnd   | Specifies the start of a bookmark. See [Bookmarks](WPbookmark.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.13.6.1.                                                                                |
| bookmarkStart | Specifies the end of a bookmark. See [Bookmarks](WPbookmark.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.13.6.2.                                                                                  |
| fldSimple     | Simple fields can be nested within other simple fields--e.g., when an IF statement is used, which incorporates another field function. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.19.             |
| hyperlink     | Specifies an internal or external link. See [Hyperlinks](WPhyperlink.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.22.                                                                          |
| r             | Specifies a text run. This will contain a cached version of the field value from the last time that the field was updated. See [Text](WPtext.md). Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.2.25. |

### Attributes of <w:fldSimple>:

| Attribute | Description                                                                                                                                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dirty     | Specifies that the field has been flagged by the application as not current and that the field needs to be updated before it is displated again. It can be either true or false, and if absent, it is assumed to be false. |
| fldLock   | Specifies that the field should not be updated. It can be either true or false, and if absent, it is assumed to be false.                                                                                                  |
| instr     | Specifies the field codes for the simple field that will generate the dynamic data. See [Field Instructions](WPfieldInstructions.md).                                                                                      |

### Complex Fields

Complex fields are used when multiple runs are necessary due to differences in formatting. They can span multiple paragraphs or runs. A table of contents is a good example of a complex field, as it is comprised of multiple paragraphs with different formatting.

A complex field is formed with a sequence of runs together containing the following elements in the order set forth below.

- A <w:fldChar> element with an attribute fldCharType value of begin.
- One or more <w:instrText> elements, which, together, contain a complete field.
- Optionally, a <w:fldChar> element with an attribute fldCharType value of separate, which separates the field fron its field result.
- Any number of runs and paragraphs that contain the most recently updated field result.
- A <w:fldChar> with an attribute fldCharType value of end.

Below is a complex field implementation for a DATE field.

<w:r>

<w:fldChar w:fldCharType="begin"/>

</w:r>

<w:r>

<w:instrText xml:space="preserve"> DATE </w:instrText>

</w:r>

<w:r>

<w:fldChar w:fldCharType="separate"/>

</w:r>

<w:r>

<w:t>12/31/2005</w:t>

</w:r>

<w:r>

<w:fldChar w:fldCharType="end"/>

</w:r>

### Component Elements of a Complex Field

| Element | Description                                                                                                                                                                                                    |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fldChar | Specifies the start or end of a complex field, or separates the field function or codes from the result. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.18. |

### Attributes of <w:fldChar>:

| Attribute   | Description                                                                                                                                                                                                                                                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| dirty       | Specifies that the field has been flagged by the application as not current and that the field needs to be updated before it is displated again. It can be either true or false, and if absent, it is assumed to be false. If the value of the fldCharType attribute is not start, then this attribute is ignored. |
| fldCharType | Specifies the type of the complex field character. Possible values are                                                                                                                                                                                                                                             |

- begin - marks the start of a complex field
- end - marks the end of a complex field
- separate - specifies that the character is a separator character which defines the end of the field codes or function and the start of the field result.

fldLock | Specifies that the field should not be updated. It can be either true or false, and if absent, it is assumed to be false.  
instrText | Specifies that the run contains field codes. See [Field Instructions](WPfieldInstructions.md) for details on specifying the codes for fields. Note that if this element is in a run that is not part of a complex field's codes, then it and its content are treated as regular text. Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.23.

### Related CSS property:

There is no concept of a field in HTML/CSS.
