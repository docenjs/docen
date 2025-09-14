# Spreadsheet Content Overview

A SpreadsheetML document is a package containing a number of different parts, mostly XML files.

![package relationships part](ssImages\rootStructure2.gif)

However, most of the actual content is found within one or more worksheet parts (one for each worksheet), and one sharedStrings part. For Microsoft Excel, the content is found within an xl folder, and the worksheets are within a worksheet sub-folder.

![worksheet parts](ssImages\rootStructure5.gif)

The workbook part contains no actual content but merely some properties of the spreadsheet, with references to the separate worksheet parts which contain the data.

<workbook . . .>

. . .

<workbookPr . . ./>

<sheets>

<sheet name="sheet1" r:id="rId1">

<sheet name="sheet2" r:id="rId2">

<sheet name="sheet3" r:id="rId3">

</sheets>

. . .

</workbook>

A worksheet can be either a grid, a chart, or a dialog sheet.

### The Grid

A grid of cells (or a "cell table") is the most common type or worksheet. Cells can contain text, booleans, numbers, dates, and formulas. It is important to understand from the outset that most text values are not stored within a worksheept part. In an effort to minimize duplication of values, a cell value that is a string is stored separately in the shareStrings part.(There is an exception to this generalization, however. A cell can be of type inlineStr, in which case the string is stored in the cell itself, within an is element.) All other cell values--booleans, numbers, dates, and formulas (as well as the values of formulas) are stored within the cell.

Some properties for the sheet are at the beginning of the root <worksheet> element. The number and sizes of the columns of the grid are defined within a <cols>. And then the core data of the worksheet follows within the <sheetData> element. The sheet data is divided into rows (<row>), and within each row are cells (<c>). Rows are numbered or indexed, beginning with 1, with the r attribute (e.g., row r="1"). Each cell in the row also has a reference attribute which combines the row number with the column to make the reference attribute (e.g., <c r="D3">). If a cell within a row has no content, then the cell is omitted from the row definition.

<worksheet . . .>

. . .

<cols>

<col min="1" max="1" width="26.140625" customWidth="1"/>

. . .

</cols>

<sheetData>

<row r="1">

<c r="A1" s="1" t="s">

<v>0</v>

. . .

</c>

</row>

. . .

</sheetData>

. . .

<mergeCells count="1">

<mergeCell ref="B12:J16"/>

</mergeCells>

<pageMargins . . ./>

<pageSetup . . ./>

<tableParts ccount="1">

<tableParts count="1">

</tablePart r:id="rId2"/>

</worksheet>

The make-up of a cell is important in understanding the overall architecture of the spreadsheet content. Each cell specifies its type with the t attribute. Possible values include:

- b for boolean
- d for date
- e for error
- inlineStr for an inline string (i.e., not stored in the shared strings part, but directly in the cell)
- n for number
- s for shared string (so stored in the shared strings part and not in the cell)
- str for a formula (a string representing the formula)

When a cell is a number, then the value is stored in the <v> element as a child of <c> (the cell element).

<c r="B2" s="5" t="n">

<v>400</v>

</c>

A date is the same, though the date is stored as a value in the ISO 8601 format. For inline strings, the value is within an <is> element. But of course the actual text is further nested within a t since the text can be formatted.

<c r="C4" s="2" t="inlineStr">

<is>

<t>my string</t>

</is>

</c>

For a formula, the formula itself is stored within an f element as a child element of <c>. Following the formula is the actual calculated value within a <v> element.

<c r="B9" s="3" t="str">

<f>SUM(B2:B8)</f>

<v>2105</v>

</c>

When the data type of the cell is s for shared string, then the string is stored in the shared strings part. However, the cell still contains a value within a <v> element, and that value is the index (zero-based) of the stored string in the shared strings part. So, for example, in the example below, the actual string is the 9th occurrence of the <si> element within the shared strings part.

<c r="C1" s="4" t="s">

<v>8</v>

</c>

The shared string part may look like this:

<sst xmls="http://schemas.openmlformats.org/spreadsheetml/2006/main" count="19" uniqueCount="13">

<si><t>Expenses</t></si>

<si><t>Amount</t></si>

<si><t>Food</t></si>

<si><t>Totals</t></si>

<si><t>Entertainment</t></si>

<si><t>Car Payment</t></si>

<si><t>Rent</t></si>

<si><t>Utilities</t></si>

<si><t>Insurance</t></si>

<si><t>Date Paid</t></si>

. . .

</sst>

### Tables

Data on a worksheet can be organized into tables. Tables help provide structure and formatting to the data by having clearly labeled columns, rows, and data regions. Rows and columns can be added easily, and filter and sort abilities are automatically added with the drop down arrows.

![worksheet table](ssImages\tableExample1.gif)

The actual table data for the cells is usually stored in the worksheet part as any other data, but the definition of the table is stored in a separate table part which is referenced from the worksheet in which the table appears.

<worksheet . . .>

. . .

<sheetData>

. . .

</sheetData>

. . .

<tableParts count="1">

<tableParts count="1">

</tablePart r:id="rId2"/>

</worksheet>

Within the rels part for the worksheet is the following:

<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/table" Target=".. /tables/table1.xml"/>

The table part is shown below.

![worksheet table](ssImages\tablePart.gif)

The content of the table part is below.

<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="Table1" displayName="Table1" ref="A18:C22" totalRowShown="0">

<autoFilter ref="A18:C22"/>

<tableColumns count="3">

tableColumn id="1" name="Expenses"

tableColumn id="2" name="Amount"

tableColumn id="3" name="Date Paid"

</tableColumns>

<tableStyleInfo name="TableStyleMedium9" showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/>

</table>

The ref attribute in red above defines the range of cells within the worksheet that comprise the table.

### Pivot Tables

Pivot tables are used to aggregate data, and to summarize and display it in an understandable layout. For example, suppose I have a large spreasheet which captures the sales of four products in four cities. I may have a column for the product, date, quantity sold, city, and state. Each day has an entry for each product in each city, or 16 entries per day. So even with only 4 products in 4 cities, I could have 5840 rows of data for a year. What if wanted to determine what city had the most sales in the spring months? What product was improving? What city had the greatest sales of red widgets? Pivot tables help to summarize the data and quickly provide the answers to these questions.

![worksheet table](ssImages\pivotData.gif)

Pivot tables have a row axis, a column axis, a values area, and a report filter area. Each table also has a field list from which users can select which fields to include in the pivot table. Below is a pivot table that summarizes the sales and revenue by product.

![worksheet data for a pivot table](ssImages\pivotTable2.gif)

A pivot table is comprised of the following components.

1. There is the underlying data that the pivot table summarizes. This data may be on the same worksheet as the pivot table, on a different worksheet, or it may be from an external source.
2. A cache or copy of that data is created in a part called the pivotCacheRecords part; a cache is needed when, e.g., the external data source is unavailable.
3. There is a pivotCacheDefinition part that defines each field in the pivot table and contains shared items, much like the sharedStrings part contains strings to remove redundancy in a worksheet.
4. The pivotTable part defines the layout of the pivot table itself, specifying what fields are on the row axix, the column axix, the report filter, and the values area.

![pivot table file architecture](ssImages\pivotTable3.gif)

The workbook points to and owns the pivotCacheDefinition part. There is the reference in the workbook to the cache of data for the pivot table, following the references to the worksheets:

<pivotCaches>

<pivotCache cacheId="13" r:id="rId4"/>

</pivotCaches>

The rels part for the workbook contains that reference:

<Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/pivotCacheDefinition" Target="pivotCache/pivotCacheDefinition1.xml"/>

The pivotCacheDefinition part in turn points to the pivotCacheRecords part.

<pivotCacheDefinition xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/spreadsheetml/2006/relationships" r:id="rId1" refreshBy="XXXX" refreshedDate="41059.666109143516" createdVersion="1" refreshedVersion="3" recordCount="32" upgradeOnRefresh="1">

. . .

</pivotCacheDefinition>

The rels part for the pivotCacheDefinition contains that reference:

<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/pivotCacheRecord" Target="pivotCacheRecords1.xml"/>

The pivotCacheDefinition part also references the source data in its <cacheSource> element:

<cacheSource type="worksheet">

<worksheetSource ref="A1:F33" sheet="Sheet1"/>

</cacheSource>

The worksheet that contains the pivot table references the pivotTable part. (There may be more than one, since a worksheet can have more than one pivot table.) The rels part for the worksheet contains that reference:

<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/pivotTable" Target="../pivotTables/pivotTable1.xml"/>

The pivotTable part references the pivotCacheDefinitions part. The rels part for the pivotTable part contains that reference:

<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/pivotCacheDefinition" Target="../pivotCache/pivotCacheDefinition1.xml"/>

#### pivotCacheDefinition

Now let's look briefly at these parts and try to make sense out of them. Let's begin with the pivotCacheDefinition. As mentioned above, it specifies the location of the source data. It also defines each field (such as data type and formatting to be used) in the source data, including those not used in the pivot table. (What fields are actually used is specified in the pivot table part.) And it is used as a cache for shared strings, just as the SharedStrings part is used to store strings that appear in worksheets.

The definition of the six fields in our example worksheet is below.

<pivotCacheDefinition . . .>

<cacheSource type="worksheet">

> worksheetSource ref="A1:F33" sheet="Sheet1"/>

</cacheSource>

<cacheFields count="6">

<cacheField name="Product" numFmtId="0">

<sharedItems count="4">

<s v="Green Widget"/>

<s v="Red Widget"/>

<s v="Grey Widget"/>

<s v="Blue Widget"/>

</sharedItems>

</cacheField>

<cacheField name="Quantity Sold" numFmtId="0">

<sharedItems containsSemiMixedTypes="0" containsString="0" containsNumber="1" containsInteger="1" minValue="1" maxValue="9"/>

</cacheField>

<cacheField name="Date" numFmtId="14">

<sharedItems containsSemiMixedTypes="0" containsNoDate="0" containsDate="1" containsString="0" minDate="2012-03-04T00:00:00" maxDate="2012-03-06T00:00:00 count=2">

<d v="2012-03-04T00:00:00"/>

<d v="2012-03-05T00:00:00"/>

</sharedItems>

</cacheField>

<cacheField name="Revenue" numFmtId="165">

<sharedItems containsSemiMixedTypes="0" containsString="0" containsNumber="1" containsInteger="1" minValue="1" maxValue="9"/>

</cacheField>

<cacheField name="City" numFmtId="0">

<sharedItems count="4">

<s v="Rochester"/>

<s v="Albany"/>

<s v="Pittsburgh"/>

<s v="Philadelphia"/>

</sharedItems>

</cacheField>

<cacheField name="State" numFmtId="0">

<sharedItems count=2">

<s v="NY"/>

<s v="PA"/>

</sharedItems>

</cacheField>

</cacheFields>

</pivotCacheDefinition>

The first field defined above is the product field. It consists of shared string values. If the field does not have shared string values (such as the second field defined above--the Quantity Sold field), then the values are stored directly in the pivotCacheRecords part.

#### pivotCacheRecords

Let's look at the pivotCacheRecords part to see how the field definitions relate to the cached data. Below are the first two rows of data in the cache.

<pivotCacheRecords . . .>

<r>

<x v="0"/>

<n v="2"/>

<x v="0"/>

<n v="2"/>

<x v="0"/>

<x v="0"/>

</r>

<r>

<x v="1"/>

<n v="3"/>

<x v="0"/>

<n v="3"/>

<x v="0"/>

<x v="0"/>

</r>

. . .

</pivotCacheRecords>

This corresponds to the data from the worksheet shown below.

![sample of record data from the worksheet](ssImages\pivotTable4.gif)

Note first that each record (<r>) of the cached data has the same number of values as are defined in the pivotCacheDefinition--in our case, six. Within each record are the following possible elements:

- <x> \- indicating the index value referencing an item for the field as defined in the pivotCacheDefinition
- <s> \- indicating a string value is being expressed inline in the record
- <n> \- indicating a numeric value is being expressed inline in the record

Looking at the two sample records from the pivotCacheRecords above, we know from the pivotCacheDefinition that the six values are product, quantity, date, revenue, city, and state in that order. The Product field in the first record is <x v="0"/>, so the value (0) is an index into the items listed in the product field. The first one listed (index 0) is Green Widget. The second or quantity field value is <n v="2"/>, so the value (2) is a numeric value expressed inline. The third or date field value is <x v="0"/>, so the value (0) is an index into the items listed in the date field (2012-03-04T00:00:00 or 3/4). Etc.

#### pivotTable

Now let's look at the pivotTable part. The root element is the <pivotTableDefinition> element. There are several components within this. First, the location of the pivot table on the worksheet is specified. The location is straightforward. Note that both the first header and data columns are specified.

<pivotTableDefinition . . .>

<location ref="B37:G43 firstHeaderRow="1" firstDataRow="2" firstDataCol="4"/>

</cacheSource>

The order of items for fields and other field information for each field is then specified by <pivotField> elements within a <pivotFields>.

<pivotFields count="6">

<pivotField axis="axisRow" compact="0" outline="0" subtotalTop="0" showAll="0" includeNewItemsFilter="1">

<items count="5">

<item sd="0" x="3"/>

<item sd="0" x="0"/>

<item sd="0" x="2"/>

<item sd="0" x="1"/>

<item t="default"/>

</items>

</pivotField>

<pivotField dataField="1" compact="0" outline="0" subtotalTop="0" showAll="0" includeNewItemsFilter="1"/>

<pivotField axis="axisRow" compact="0" numFmtId="14" outline="0" subtotalTop="0" showAll="0" includeNewItemsFilter="1">

<items count="3">

<item sd="0" x="0"/>

<item sd="0" x="1"/>

<item t="default"/>

</items>

</pivotField>

. . .

</pivotFields count="6">

From the pivotCacheDefinition we know that the first <pivotField> above is the product. It has 5 items listed. The first one is <item sd="0" x="3"/>. The sd attribute indicates whether the item is hidden. A value of 0 means the item is not hidden. The x attribute is the index for the items in the <cacheField> for the product in the pivotCacheDefinition. The <cacheField> is shown below. Note that the value of the item at index 3 is Blue Widget, so Blue Widget should appear first in the pivot table if and where the product field is shown.

<cacheField name="Product" numFmtId="0">

<sharedItems count="4">

<s v="Green Widget"/>

<s v="Red Widget"/>

<s v="Grey Widget"/>

<s v="Blue Widget"/>

</sharedItems>

</cacheField>

The second item has an index of 0, or "Green Widget", the third is 2 or "Grey Widget," and the fourth is 1 or "Red Widget." Note that <item t="default"/> indicates a subtotal or total.

Following the <pivotFields> collection is the <rowFields> collection. This collection specifies what fields are actually in the pivot table on the row axis, and in what order. In our example, when we fully expand the first row, we see that a row consists of first a product, then a city, followed by a state, and then a date. These are the row fields.

![expanded pivot table row](ssImages\pivotTable5.gif)

Following the index order in the <pivotFields> collection, this is 0, 4, 5, 2. The corresponding <rowFields> looks like this.

<rowFields count="4">

<field x="0"/>

<field x="4"/>

<field x="5"/>

<field x="2"/>

</rowFields>

After the <rowFields> collection is the <rowItems> collection. This is a collection of all the values in the row axis. There is an <i> element for each row in the pivot table. And for each <i> there are as many <x> elements as there are item values in the row. The v attribute is a zero-based index referencing a <pivotField> item value. If there is no v then the value is assumed to be 0. The value of grand for t indicates a grand total as the last row item value.

<rowItems count="5">

<i>

<x/>

</i>

<i>

<x v="1"/>

</i>

<i>

<x v="2"/>

</i>

<i>

<x v="3"/>

</i>

<i t="grand">

<x/>

</i>

</rowItems>

The <colFields> collection follows, indicating which fields are on the column axis of the pivot table. Here again <x> is an index into the <pivotField> collection.

<colFields count="1">

<field x="-2"/>

</colFields>

The <colItems> collection follows, listing all of the values on the column axis.

<colItems count="2">

<i>

<x/>

</i>

<i i="1">

<x v="1"/>

</i>

</colItems>

There may also be a <pageFields> collection which describes which fields are found in the report filter area.

Finally, there is a <dataFields> collection, which describes what fields are found in the values area of the pivot table. In our example, there are two fields in the values area -- sum of quantity sold and sum of revenue. Below is the collection. The fld attribute is the index of the field being summarized.

<dataFields count="2">

<dataField name="Sum of Quantity Sold" fld="1" baseField="0" baseItem="0"/>

<dataField name="Sum of Revenue" fld="3" baseField="0" baseItem="0"/>

</dataFields>
