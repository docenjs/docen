# Wordprocessing Fields

General Field Formatting

A general formatting switch specifies a variety of formats for a numeric or text result. General field formatting switches have the following format:

\\\* _switch argument_

A switch argument is made up of a series of "picture items." The most commonly used for numeric values in US English are below.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.4.3.

### General formatting - Numeric Values:

| Switch Argument | Description                                                                                                                                                                                         | Examples                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Arabic          | Formats a numeric result using Arabic cardinal numbers                                                                                                                                              | PAGE \\\* Arabic might display "123".                                                 |
| CardText        | Formats a numeric result as lowercase cardinal text                                                                                                                                                 | PAGE \\\* CardText might display "one hundred twenty-three".                          |
| DollarText      | Formats a numeric result in the following form: _integer-part-as-cardinal-text_ and _nn/100_. The fractional part is rounded to two decimal places and is formatted using Arabic cardinal numerals. | =1234.567 \\\* DollarText displays "one thousand two hundred thirty-four and 57/100". |
| Ordinal         | Formats a numeric result as lowercase ordinal Arabic numerals                                                                                                                                       | =32 \\\* Ordinal displays "32nd".                                                     |
| OrdText         | Formats a numeric result as lowercase ordinal text. Note that the fractional part is not used other than to round off.                                                                              | =1234.567 \\\* OrdText displays "one thousand two hundred thirty-fifth".              |
| Roman           | Formats a numeric result using uppercase Roman numerals                                                                                                                                             | =PAGE \\\* Roman might display "CXXIII".                                              |
| roman           | Formats a numeric result using lowercase Roman numerals                                                                                                                                             | =PAGE \\\* roman might display "cxxiii".                                              |

The most commonly used for string values in US English are below.

### General formatting - Text Values:

| Switch Argument | Description                                    | Examples                                                   |
| --------------- | ---------------------------------------------- | ---------------------------------------------------------- |
| Caps            | Capitalizes the first letter of each word      | USERNAME "mary smith" \\\* Caps displays "Mary Smith".     |
| FirstCap        | Capitalizes the first letter of the first word | USERNAME "mary smith" \\\* FirstCap displays "Mary smith". |
| Lower           | All letters are lower case                     | USERNAME "mary smith" \\\* Lower displays "mary smith".    |
| Upper           | All letters are upper case                     | USERNAME "mary smith" \\\* Upper displays "MARY SMITH".    |

### General formatting - All Values:

The following switch arguments apply to any field result: MERGEFORMAT and CHARFORMAT.

Use MERGEFORMAT to preserve for subsequent field updates any direct formatting that was applied to the result.

For example, below is a sample in which direct formatting was applied to underline the seconds. Subsequent updates of the field would use the same structure, changing only the time values.

<w:r>

<w:fldChar w:fldCharType="begin"/>

</w:r>

<w:r>

<w:instrText xml:space="preserve"> TIME \@ "HH:mm:ss" \\\* MERGEFORMAT</w:instrText>

</w:r>

<w:r>

<w:fldChar w:fldCharType="separate"/>

</w:r>

<w:r>

. . .

<w:t>17:02:</w:t>

</w:r>

<w:r>

. . .

<w:rPr>

<w:u w:val="single"/>

</w:rPr>

<w:t>32</w:t>

</w:r>

<w:r>

<w:fldChar w:fldCharType="end"/>

</w:r>

If the MERGEFORMAT switch were omitted, then a subsequent field update might result in a single new run as shown below.

<w:r>

<w:fldChar w:fldCharType="begin"/>

</w:r>

<w:r>

<w:instrText xml:space="preserve"> TIME \@ "HH:mm:ss"</w:instrText>

</w:r>

<w:r>

<w:fldChar w:fldCharType="separate"/>

</w:r>

<w:r>

<w:t>12:22:27</w:t>

</w:r>

<w:r>

<w:fldChar w:fldCharType="end"/>

</w:r>

Use CHARFORMAT to force the field to use the formatting for the entire field that is applied to the first instrText after the begin fldChar. For example, consider the below sample which has bold, underline, red applied to the first run in the field instruction.

<w:r>

<w:fldChar w:fldCharType="begin"/>

</w:r>

<w:r>

<w:instrText xml:space="preserve"> </w:instrText>

</w:r>

<w:r>

. . .

<w:rPr>

<w:b/>

<w:color w:val="ED1C24"/>

<w:u w:val="single"/>

</w:rPr>

<w:instrText>D</w:instrText>

</w:r>

<w:r>

<w:instrText xml:space="preserve">ATE </w:instrText>

</w:r>

<w:r>

<w:fldChar fldCharType="separate"/>

</w:r>

<w:r>

. . .

<w:t>1/4/2006</w:t>

</w:r>

<w:r>

<w:fldChar fldCharType="end"/>

</w:r>

If CHARFORMAT is applied, then the formatting that was applied to the first run is carried over into all runs in the field.

<w:r>

<w:fldChar w:fldCharType="begin"/>

</w:r>

<w:r>

<w:instrText xml:space="preserve"> </w:instrText>

</w:r>

<w:r>

. . .

<w:rPr>

<w:b/>

<w:color w:val="ED1C24"/>

<w:u w:val="single"/>

</w:rPr>

<w:instrText>D</w:instrText>

</w:r>

<w:r>

<w:instrText xml:space="preserve">ATE /\* CHARFORMAT</w:instrText>

</w:r>

<w:r>

<w:fldChar fldCharType="separate"/>

</w:r>

<w:r>

. . .

<w:rPr>

<w:b/>

<w:color w:val="ED1C24"/>

<w:u w:val="single"/>

</w:rPr>

<w:instrText>1/4/2006</w:instrText>

</w:r>

<w:r>

<w:fldChar fldCharType="end"/>

</w:r>
