# WordprocessingML Content Overview

A WordprocessingML document is a package containing a number of different parts, mostly XML files. However, most of the actual content is found within the main document part. And that content is mostly composed of paragraphs and tables.

### Paragraphs

A paragraph (<w:p>) is the basic unit of block-level content. That is, it's a division of content that begins on a new line. It typically has two pieces. The formatting (or properties) for the paragraph is declared first, followed by the content.

The formatting can be declared directly ("this paragraph shall be centered") or it can be declared indirectly by referencing a style ("this paragraph shall use the X style, which centers paragraphs"). Or it can do a combination of both. Paragraph formatting is within a <w:pPr>.

The content of the paragraph is contained in one or more runs (<w:r>). Runs are non-block content; they define regions of text that do not necessarily begin on a new line. Like paragraphs, they are comprised of formatting/property definitions, followed by content. The formatting is specified within a <w:rPr> and can be direct formatting, indirect formatting through a style reference, or both.

A run can be divided into smaller runs or runs can be combined if they have the same properties. So, for example, if a sentence contains one word that is bold, then the sentence must be broken up into multiple runs to account for the bold and non-bold components of the sentence.

The content of a run is comprised mostly of text elements (<w:t>), which themselves contain the actual character data that comprises read content. A run might also contain breaks, tabs, symbols, images, and fields. Below is a sample of a very simple paragaph.

<w:p>

<w:pPr>

<w:jc w:val="center">

<w:pPr>

<w:r>

<w:rPr>

<w:b/>

</w:rPr>

<w:t>This is text.</w:t>

</w:r>

</w:p>

Omitted from the above example, and from nearly all sample XML you'll see on this site, is the optional information that can be added to track editing sessions. Such information, typically in the form of attributes, clutter the XML you'll see as you look at the XML underlying Word documents. It is omitted here for the sake of clarity. An example is shown below.

<w:p w:rsidR="00D57EDE" w:rsidRDefault="00D57EDE">

. . .

</w:p>

### Tables

Tables are another type of block-level content. A table consists of rows and columns. The specification for a table (<w:tbl>) can be broken up into three parts. Like paragraphs and runs, there are first the properties, and for tables they are defined within a <w:tblPr>.

Unlike paragraphs and runs, however, a table divides the content into rows, and no two rows need to have the same number of columns. This adds a level of complexity to the definition of a table. WordprocessingML addresses this challenge by defining a "grid" for the table within a <w:tblGrid>. This table grid definition is the second part of the table definition.
