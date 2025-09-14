# What is OOXML?

Office Open XML, also known as OpenXML or OOXML, is an XML-based format for office documents, including word processing documents, spreadsheets, presentations, as well as charts, diagrams, shapes, and other graphical material. The specification was developed by Microsoft and adopted by ECMA International as [ECMA-376](http://www.ecma-international.org/publications/standards/Ecma-376.htm) in 2006. A second version was released in December, 2008, and a third version of the standard released in June, 2011. The specification has been adopted by ISO and IEC as ISO/IEC 29500.

It is important to keep in mind that OOXML is not the same as Open Office XML or the [Open Document Format (ODF)](http://www.oasis-open.org/standards) that underlies the [OpenOffice.org](http://www.openoffice.org/) and other open source office software. Office Open XML and Open Office XML or ODF are in some sense competing XML standards for office documents.

Although the older binary formats (.doc, xls, and .ppt) continue to be supported by Microsoft, OOXML is now the default format of all Microsoft Office documents (.docx, .xlsx, and .pptx).

## What does OOXML specify?

### Markup specifications

ECMA-376 includes three different specifications for each of the three main office document types--WordprocessingML for word processing documents, SpreadsheetML for spreadsheet documents, and PresentationML for presentation documents. It also includes some supporting markup languages, most importantly DrawingML for drawings, shapes and charts.

The specification includes both XML schemas and constraints in written form. Any conforming document must conform to XML schemas, and be in UTF-8 or UTF-16 encoding. The specification does include some extensibility mechanisms allowing custom XML to be stored with the OOXML markup.

### A file packaging specification

In addition to the markup language specifications, Part 2 of ECMA-376 specifies the Open Packaging Conventions (OPC). OPC is a container-file technology leveraging the common ZIP format for combining files into a common package. So OOXML files are ZIP archives containing various XML files (parts) and organized into single package. This breaking up or chunking of the data into pieces makes it easier and quicker to access data and reduces the chances of data corruption. The parts can contain any type of data; to keep track of the data type of each part without relying on file extensions, the type for each part is specified in a file within the package called [Content_Types].xml. The relationships of the parts to the package as well as relationships that any part may have are abstracted from the parts and stored separately in relationship files--one for the package as a whole and one for each package that has relationships. In this way references are stored only once and can therefor be easily changed when necessary.
