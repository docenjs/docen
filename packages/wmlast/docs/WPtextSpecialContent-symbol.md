# Wordprocessing Text

Symbols

Symbols are specified with the w:sym element within the w:r element. A symbol is a special character that does not use any of the run fonts specified in rFonts or in the style hierarchy. The character is determined by pulling the hexadecimal value specified in the char attribute from the font specified in the font attribute.

<w:r>

<w:rPr>

<w:fonts w:ascii="Courier New" w:hAnsi="Courier New"/>

<w:rPr>

<w:t xml:space="preserve">This is Courier New text. >/w:t>

</w:r>

<w:r>

<w:rPr>

<w:fonts w:ascii="Courier New" w:hAnsi="Courier New"/>

<w:rPr>

<w:t xml:space="preserve">This is a Wingdings character >/w:t>

<w:sym w:font="Wingdings" w:char="F034"/>

</w:r>

Word 2007 Example:

![Text - Symbols](images\wp-symbols-1.gif)

---

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.3.3.30.

### Attributes:

| Attribute | Description                                                                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| char      | Specifies the hexadecimal code for the Unicode character value of the symbol. The value can be stored in either of the following formats: |

- directly in its Unicode character value from the font glyph
- In a Unicode character value created by adding F000 to the character value, thereby shifting the value into the Unicode private use area. This is done to allow interoperability with legacy word processing formats. So, in the example above, the value of the char attribute is F034, and so we would obtain the character value by removing F000 from F034 to obtain the character at the hexadecimal value 0x34 in the Wingdings font (or 52 as a decimal value).

font | Specifies the font to be used to to format the symbol.

### Related HTML/CSS property:

Symbols may be referenced in HTML as character entities using short names (e.g., &copy;). See the [W3 recommendation regarding character references](http://www.w3.org/TR/html4/sgml/entities.md). Symbols may also be referenced with numeric character references in the form &#number (decimal form) or &#xnumber (hexadecimal form). [See the W3 recommendation](http://www.w3.org/TR/html4/charset.html#h-5.3.1).

Only Unicode characters are officially supported in HTML and only those should be used, as not all browsers will have fonts such as Wingdings. However, fonts may be specified in CSS and numeric character references made to the desired character in the desired font.

<div>This is a Wingdings character <span style="font-family:Wingdings;">&#52;</span>. You will only see this if your machine has Wingdings.</div>   
<div>This is a copyright symbol referenced using its short name: &copy;</div>   
<div>This is a trademark symbol referenced using a numeric character reference: &#8482;.</div>

CSS Example:

This is a Wingdings character 4. You will only see this if your machine has Wingdings.

This is a copyright symbol referenced using its short name: ©

This is a trademark symbol referenced using a numeric character reference: ™.
