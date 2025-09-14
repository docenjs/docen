# Wordprocessing Sections

Page Numbers

The page numbers for pages in the section are defined with the <w:pgNumType> element.

<w:sectPr>

<w:pgNumType w:start="25"/>

</w:sectPr>

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.6.12.

### Attributes

| Element | Description                                                                                                                            |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| chapSep | Specifies the separator character to be used between the chapter and page number if a chapter style has been set. Possible values are: |

- colon (e.g., 1:1)
- emDash - (e.g., 1—1)
- endash - (e.g., 1–1)
- hyphen - (e.g., 1-1
- period - (e.g., 1.1)

chapStyle | Specifies the one-based index of the heading style applied to chapter titles. The nearest heading of the style is located and the numbering information is extracted for the page number. For example, a chapStyle value of 1 (Heading 1 style) means that the numbering value of the nearest Heading 1 style is used for the chapter value in the page number.  
fmt | Specifies the number format to be used for page numbers in the section. The most commonly used values are:

- cardinalText - the cardinal text of the run language. (In English, One, Two, Three, etc.)
- decimal - decimal numbering (1, 2, 3, 4, etc.)
- decimalEnclosedCircle - decimal number enclosed in a circle
- decimalEnclosedFullstop - decimal number followed by a period
- decimalEnclosedParen - decimal number enclosed in parentheses
- decimalZero - decimal number but with a zero added to numbers 1 through 9
- lowerLetter - based on the run language (e.g., a, b, c, etc.). Letters repeat for values greater than the size of the alphabet
- lowerRoman - lowercase Roman numerals (i, ii, iii, iv, etc.)
- none
- ordinalText - ordinal text of the run laguage. (In English, First, Second, Third, etc.)
- upperLetter - based on the run language (e.g., A, B, C, etc.). Letters repeat for values greater than the size of the alphabet
- upperRoman - uppercase Roman numerals (I, II, III, IV, etc.)

start | Specifies the page number that appears on the first page of the section. If the value is omitted, numbering continues from the highest page number in the previous section.

### Related HTML/CSS property:

HTML has no notion of pages, and so no page numbers.
