# Wordprocessing Fields

Instructions

A field is placed within XML as either a <w:fldSimple> (for a simple field) or within a pair of <w:fldSimple> elements (for a complex field). But the actual definition of the field type and format are specified by the instr attribute of the simple field or the <w:instrText> element or elements. The syntax of the field definitions does not follow XML standards, but instead a field is specified with a field name or key word followed by zero or more switches which affect formatting of the result. Below is a sample of a date field.

DATE \@ "M/d/yyyy h:mm am/pm"

This produces the following result sample: 1/3/2006 5:28 PM.

### Field Types

The OOXML specification divides fields into 10 functional categories:

- date and time - [DATE](WPfieldDefinitions.md#date), [CREATEDATE](WPfieldDefinitions.md#createdate), EDITTIME, PRINTDATE, [SAVEDATE](WPfieldDefinitions.md#savedate), [TIME](WPfieldDefinitions.md#time)
- document automation - COMPARE, DOCVARIABLE, GOTOBUTTON, IF, MACROBUTTON, PRINT
- document information - [AUTHOR](WPfieldDefinitions.md#author), COMMENTS, DOCPROPERTY, [FILENAME](WPfieldDefinitions.md#filename), [FILESIZE](WPfieldDefinitions.md#filesize), KEYWORDS, LASTSAVEDBY, NUMCHARS, NUMPAGES, NUMWORDS, SUBJECT, TEMPLATE, [TITLE](WPfieldDefinitions.md#title)
- equations and formulas - _=formula_ , ADVANCE, SYMBOL
- form fields - FORMCHECKBOX, FORMDROPDOWN, FORMTEXT
- index and tables - INDEX, RD (identifies a file to include when creating a table of contents, table of authorities, or an index), TA (text and page number for a table of authorities entry), TC (text and page number for a table of contents entry), [TOC](WPtableOfContents.md) (table of contents), XE (text and page number for an index entry)
- links and references - AUTOTEXT, AUTOTEXTLIST, BIBLIOGRAPHY, CITATION, HYPERLINK, INCLUDEPICTURE, INCLUDETEXT, LINK, NOTEREF, PAGEREF, QUOTE, REF, STYLEREF
- mail merge - ADDRESSBLOCK, ASK, COMPARE, DATABASE, FILLIN, GREETINGLINE, IF, MERGEFIELD, MERGEREC, MERGESEQ, NEXT, NEXTIF,SET, SKIPIF
- numbering - LISTNUM, [PAGE](WPfieldDefinitions.md#page), REVNUM, [SECTION](WPfieldDefinitions.md#section), SECTIONPAGES, [SEQ](WPfieldDefinitions.md#seq)
- user information - USERADDRESS, USERINITIALS, [USERNAME](WPfieldDefinitions.md#username)

### Field Formatting

The formatting of fields is specified with switches placed after the field name. There are three types of general switch types:

- date and time \- applicable to the fields related to date and time. The format is:

\@ _switch argument_

E.g., DATE \@ "yyyy-MM-dd". See [Date and Time Field Formatting Switches](WPdateTimeFieldSwitches.md) for details on the switches.

- numeric \- applicable to numberic results. The format is:

\\# _switch argument_

If no switch is present, the result is formatted without leading spaces or trailing fractional zeros. See [Numeric Field Formatting Switches](WPnumericFieldSwitches.md) for details.

- general formatting \- applicable to a variety of numeric or text results. The format is:

\\\* _switch argument_

See [General Formatting Field Switches](WPgeneralFieldSwitches.md) for details.

In addition, each field may have its own switches.

Reference: ECMA-376, 3rd Edition (June, 2011), Fundamentals and Markup Language Reference § 17.16.4.
