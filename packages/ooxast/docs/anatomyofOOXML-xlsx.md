![SpreadsheetXML.com](ssImages\SpreadsheetMLBanner.png)

[Home](README.md) | [WordprocessingML (docx)](anatomyofOOXML.md) | [SpreadsheetML (xlsx)](anatomyofOOXML-xlsx.md) | [PresentationML (pptx)](anatomyofOOXML-pptx.md) | [DrawingML](drwOverview.md)

- [Anatomy of SpreadsheetML File](anatomyofOOXML-xlsx.md)
- [Content Overview](SScontentOverview.md)
- [Styles and Formatting](SSstyles.md)

# Package Structure

A SpreadsheetML or .xlsx file is a zip file (a package) containing a number of "parts" (typically UTF-8 or UTF-16 encoded) or XML files. The package may also contain other media files such as images. The structure is organized according to the Open Packaging Conventions as outlined in Part 2 of the OOXML standard ECMA-376.

You can look at the file structure and the files that comprise a SpreadsheetML file by simply unzipping the .xlsx file. ![SpreasheetML file structure](ssImages\rootStructure1.gif)

The number and types of parts will vary based on what is in the spreadsheet, but there will always be a [Content_Types].xml, one or more relationship parts, a workbook part , and at least one worksheet. The core data of the spreadsheet is contained within the worksheet part(s), discussed in more detail at [xsxl Content Overview](SScontentOverview.md).

# Content Types

Every package must have a [Content_Types].xml, found at the root of the package. This file contains a list of all of the content types of the parts in the package. Every part and its type must be listed in [Content_Types].xml. The following is a content type for the main content part:

<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>

It's important to keep this in mind when adding new parts to the package.

# Relationships

Every package contains a relationships part that defines the relationships between the other parts and to resources outside of the package. This separates the relationships from content and makes it easy to change relationships without changing the sources that reference targets.

![package relationships part](ssImages\rootStructure3.gif)

For an OOXML package, there is always a relationships part (.rels) within the \_rels folder that identifies the starting parts of the package, or the package relationships. For example, the following defines the identity of the start part for the content:

<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>.

There are also typically relationships within .rels for app.xml and core.xml.

In addition to the relationships part for the package, each part that is the source of one or more relationships will have its own relationships part. Each such relationship part is found within a \_rels sub-folder of the part and is named by appending '.rels' to the name of the part.

Typically the main content part (workbook.xml) has its own relationships part (workbook.xml.rels). It will contain relationships to the other parts of the content, such as sheet1.xml, sharedStrings.xml, styles.xml, theme1,xml, as well as the URIs for external links.

![document relationships part](ssImages\rootStructure4.gif)

A relationship can be either explicit or implicit. For an explicit relationship, a resource is referenced using the Id attribute of a <Relationship> element. That is, the Id in the source maps directly to an Id of a relationship item, with an explicit reference to the target.

For example, a worksheet might contain a hyperlink such as this:

<w:hyperlink ref="A11" r:id="rId4">

The r:id="rId4" references the following relationship within the relationships part for the worksheet (worksheet1.xml.rels).

<Relationship Id="rId4" Type="http://. . ./hyperlink" Target="http://www.google.com/" TargetMode="External"/>

For an implicit relationship, there is no such direct reference to a <Relationship> Id. Instead, the reference is understood.

# Parts Specific to SpreadsheetML Documents

Below is a list of the possible parts of a SpreadsheetML package that are specific to SpreadsheetML spreadsheets. Keep in mind that a spreadsheet may only have a few of these parts. For example, if a spreadsheet has no pivot table, then a pivot table part will not be included in the package.

| Part                         | Description                                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Calculation Chain            | When the values of cells are calculated from formulas, the order of calculation can be affected by the order in which the values are calculated. This part contains specifies the ordering. A package can contain only one such part.                                                                                                                             |
| Chartsheet                   | Contains a chart that is stored in its owne sheet. A package can contain multiple such parts, referenced from the workbook part.                                                                                                                                                                                                                                  |
| Comments                     | Contains the comments for a given worksheet. Since there may be more than one worksheet, there may be more than one comments part.                                                                                                                                                                                                                                |
| Connections                  | A spreadsheet may have connections to external data sources. This part contains such connections, explaining both how to get such externnal data and how the connection is used within the workbook. There may be only one such part.                                                                                                                             |
| Custom Property              | Contains user-defined data. There may be zero or more such parts.                                                                                                                                                                                                                                                                                                 |
| Customer XML Mappings        | Contains a schema for an XML file, and information on the behavior to be used when allowing the schema to be mapped into the spreadsheet. There may be only one such part.                                                                                                                                                                                        |
| Dialogsheet                  | Contains information about a legacy customer dialog box for a user form. There may be zero or more such parts.                                                                                                                                                                                                                                                    |
| Drawings                     | Contains the presentation and layout information for one or more drawing elements that are present in the worksheet. There should be drawings part for each worksheet that has a drawing.                                                                                                                                                                         |
| External Workbook References | Contains information about data referenced in other spreadsheet packages. For example, a spreadsheet may have a cell whose value is calculated from data in another spreadsheet. There may be zero or more such parts.                                                                                                                                            |
| Metadata                     | Contains information relating to a cell whose value is related to one or more other cells via Online Analytical Processing (OLAP) technology.                                                                                                                                                                                                                     |
| Pivot Table                  | Contains the definition of a pivot table. It describes the particulars of the layout of the pivot table, indicating what fields are on the row axis, the column axis, and values areas of the pivot table. And it indicates formatting for the pivot table. There is a pivot table part for each pivot table within the package.                                  |
| Pivot Table Cache Definition | The pivot table cache definition defines each field in the pivot cache records part (i.e., the underlying data), including field name and information about the data contained in the field. There is a pivot table cahe definition part for each pivot table within the package.                                                                                 |
| Pivot Table Cache Records    | Contains the underlying data for a pivot table. There will be zero or one such part for each pivot table in the package.                                                                                                                                                                                                                                          |
| Query Table                  | Contains information that describes how the source table is connected to an external data source and defines the properties that are used when the table is refreshed from the source. There may be one such part for each table.                                                                                                                                 |
| Shared String Table          | Contains one occurrence of each unique string that occurs in any worksheet within the workbook. There is one such part for a package.                                                                                                                                                                                                                             |
| Shared Workbook Revision Log | Contains information about edits performed on individual cells in the workbook's worksheets. There should be one such part for each editing session                                                                                                                                                                                                               |
| Shared Workbook User Data    | Contains a list of all users that are sharing the workbook. A package contained zero or one such part.                                                                                                                                                                                                                                                            |
| Single Cell Table Definition | Contains information on how to map non-repeating elements from a custom XML file into cells in a worksheet. There may be one such part per worksheet.                                                                                                                                                                                                             |
| Styles                       | Contains all the characteristics for all cells in the workbook, including numeric and text formatting, alignment, font, color, and border. A package contains no more than one such part.                                                                                                                                                                         |
| Table Definition             | A spreadsheet can contain regions that have clearly labeled columns, rows, and data regions. Such regions are called tables, and each worksheet can have zero or more tables. For each table in a worksheet there must be a table definitions part containing a description of the table. (The data for the table is stored in the corresponding worksheet part.) |
| Volatile Dependencies        | Cells can contain real-time data formulas that return values that change over time and that require connectivity to programs outside of the workbook. In cases where those programs are not available, the formulas can use information stored in the volatile dependencies part. A package can have only one such part.                                          |
| Workbook                     | Contains data and references to all of the worksheets. There must be one and only one workbook part.                                                                                                                                                                                                                                                              |
| Worksheet                    | Contains all the data, formulas, and characteristics of a given worksheet. There is one such part for each worksheet in the package.                                                                                                                                                                                                                              |

# Parts Shared by Other OOXML Documents

There are a number of part types that may appear in any OOXML package. Below are some of the more relevant parts for SpreadsheetML documents.

| Part                                                       | Description                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Embedded package                                           | Contains a complete package, either internal or external to the referencing package. For example, a SpreadsheetML document might contain a Wordprocessing or PresentationML document.                                                                                                                         |
| Extended File Properties (often found at docProps/app.xml) | Contains properties specific to an OOXML document--properties such as the template used, the number of pages and words, and the application name and version.                                                                                                                                                 |
| File Properties, Core                                      | Core file properties enable the user to discover and set common properties within a package--properties such as creator name, creation date, title. [Dublin Core](http://dublincore.org/) properties (a set of metadate terms used to describe resources) are used whenever possible.                         |
| Image                                                      | Spreadsheets often contain images. An image can be stored in a package as a zip item. The item must be identified by an image part relationship and the appropriate content type.                                                                                                                             |
| Theme                                                      | DrawingML is a shared language across the OOXML document types. It includes a theme part that is included in SpreadsheetML documents when the spreadsheet uses a theme. The theme part contains information about a document's theme, that is, such information as the color scheme, font and format schemes. |
