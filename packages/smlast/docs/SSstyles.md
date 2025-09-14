# Spreadsheet Styles

Spreadsheets can be styled using styles, themes, and direct formatting. There are cell styles, table styles, and pivot styles. However, unlike in WordprocessingML, styling XML never appears with the content in a worksheet. The formatting is always stored separately within a single styles part for the workbook. There is also a single theme part for the entire workbook.

A cell style can specify number format, cell alignment, font information, cell borders, and background/foreground fills. Table styles specify formatting for regions of a table, such as, e.g., headers are bold or a gray fill should be applied to alternating rows. Pivot table styles specify formatting for regions of a pivot table, such as colors for totals or for the row axis. Themese define a set of colors, font information, and effects on shapes. A style or formatting element can define a color, font, or effect by referencing a theme, but of course that format may change if the thme is changed.

## Text-Level Formatting

Before getting to the styles applied to a worksheet, however, let's first cover formatting at the text level, that is, not formatting applied to the entire cell, but formatting that might change from word to word, such as different colors or effects. For example, see cell A13 below, with blue color for the first word and orange underline for the second. Obviously this cannot be accomplished with a cell style. This formatting is done within the shared string part where the text of the cell is stored.

![formatting within a cell](ssImages\SSstyles1.gif)

Let's look at the XML for the first cell in row 13 of the worksheet part. We know from the type attribute for the cell t="s" that the text is stored in the shared strings part, and from <v="25"/> we know that string is the 26th string or <si>. (Remember that it is a zero-based index.)

<row r="13">

<c r="A13" t="s">

<v>25</v>

</c>

. . .

</row>

The XML for the string is below. Note that the formatting is applied directly within the string item, just as direct formatting is applied to text runs (<r>) using run properties (<rPr>) within wordprocessingML (docx) documents.

<si>

<r>

<rPr>

<sz val="11"/>

<color theme="4"/>

<rFont val="Calibri"/>

<family val="2"/>

<scheme val="minor"/>

</rPr>

<t>Blue</t>

</r>

<r>

<rPr>

<sz val="11"/>

<color theme="1"/>

<rFont val="Calibri"/>

<family val="2"/>

<scheme val="minor"/>

</rPr>

<t xml:space="preserve"> </t>

</r>

<r>

<rPr>

<u/>

<sz val="11"/>

<color theme="9"/>

<rFont val="Calibri"/>

<family val="2"/>

<scheme val="minor"/>

</rPr>

<t>Widget</t>

</r>

</si>

## Cell-Level Formatting

Now let's return to cell styles. Styles within spreadsheetML are implemented to minimize repetition, and this is done with collections. Within the styles part there are the collections shown below.

<stylesheet xmls="http://schemas.openxmlformats.org/spreadsheetml/2006/main">

<numFmts/>

<fonts/>

<fills/>

<borders/>

<cellStyleXfs/>

<cellXfs/>

<cellStyles/>

<dxfs/>

<tableStyles/>

</stylesheet>

Most of the collections above (except for <dxfs> and <tableStyles>) relate to cells. And the first four--numFmts, fonts, fills, and borders--contain all of the possible charateristics for every cell in the workbook. Each may have many elements, each one defining the characteristics for a set of cells that have the same such characteristics. For example, below is a sample of the <fills> for a workbook. Every cell in the workbook will use one of these fill definitions.

<fills count="5">

<fill>

<patternFill patternType="none"/>

</fill>

<fill>

<patternFill patternType="gray125"/>

</fill>

<fill>

<patternFill patternType="solid">

<fgColor rgb="FFFFEB9C"/>

</patternFill/>

</fill>

<fill>

<patternFill patternType="solid">

<fgColor theme="5" tint="0.39997558519241921"/>

<bgColor indexed="65"/>

</patternFill/>

</fill>

<fill>

<patternFill patternType="solid">

<fgColor rgb="FFC6EFCE"/>

</patternFill/>

</fill>

</fills>

The <fill> for a particular cell is specified with a zero-based index into the above fills collection. The same is true of the font for the cell, the number format, and the borders. So the formatting for a cell can be specified with a list or collection of indices into these four collections. And in fact, that is what the <cellXfs> is. It contains a collection of groups of indices, one group for every combination of cell formatting characteristics found in the workbook. Below is one such grouping.

<cellXfs count="14">

<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>

. . .

</cellXfs>

Every cell will have a reference to one <xf> in the <cellXfs> collection. This is direct formatting for the cell. To apply a style to the cell, the <xf> references the style using the xfId attribute. The xfId attribute is an index into the <cellStyleXFs> collection, which collects the cell styles available to the user. The <cellStyleXFs> contains one <xf> for each style. Each such <xf> is tied to its name via an index (in its xfId attribute) from the <cellStyles> collection.

Let's try and tie it all together by looking at a sample. Consider row 10 in the sample below.

![formatting within a cell](ssImages\SSstyles2.gif)

The first cell A10 has a cell style applied. The XML for the cell in the worksheet is below.

<row r="10">

<c r="A10" s="12" t="s">

<v>6</v>

</c>

. . .

</row>

From the attribute s="12" we know that the cell's formatting is stored at the 13th (zero-based index) <xf> within the <cellXfs> collection in the styles part. The 13th <xf> is below.

<xf numFmtId="0" fontId="8" fillId="4" borderId="0" xfId="3"/>

So for this cell, the number format is the first (index value is 0) within the <numFmts> collection. The cell uses the font format found within the 9th <font> in the <fonts> collection, the 5th <fill> within the <fills> collection (which references a theme for the green), and the first <border> within the <borders> collection. This cell also applies a style (xfId="3")--the 4th <xf> within the <cellStyleXfs> collection. The style is shown below.

<xf numFmtId="0" fontId="8" fillId="4" borderId="0" applyNumberFormat="0" applyBorder="0" applyAlignment="0" applyProtection="0"/>

The formatting of the style is same as the direct formatting, and the attributes applyNumberFormat, applyBorder, applyAlignment, and applyProtection, each with values of 0, tell us not to apply the corresponding values of the style but instead apply the values for the direct formatting. In this case they are the same, so there is no difference anyway.

## Table-Level Formatting

A table applies a table style by specifying a <tableStyleInfo> element within the table definition in the tables part. For example, the following sample table definition specifies the TableStyleMedium9 style. Note that it is specified by name. Note also that not only is the style specified, but the specification also tells us which aspects of the style are turned on (e.g., showRowStripes="1") and which are turned off (e.g., showLastColumn="0"). Each table style is made up of a collection of formatting definitions, each of which corresponds to a particular region of the table--e.g., whole table, first column stripe, first row stripe, first column, header column, first header cell, etc. Each of these formatting definitions can be turned on or off.

<table xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" id="1" name="Table1" displayName="Table1" ref="A18:C22" totalRowShown="0">

<autoFilter ref="A18:C22"/>

<tableColumns count="3">

tableColumn id="1" name="Expenses"

tableColumn id="2" name="Amount"

tableColumn id="3" name="Date Paid"

</tableColumns>

<tableStyleInfo name="TableStyleMedium9" showFirstColumn="0" showLastColumn="0" showRowStripes="1" showColumnStripes="0"/>

</table>

Annex G of the ECMA-376, 3rd Edition (June, 2011) OOXML specification defines built-in styles for cells, tables, and pivot tables, and style TableStyleMedium9 is among the built-in table styles. The built-in table and pivot table styles are not stored in the styles part--only custom styles are.

Below is a custom style defined in the styles part, based on the TableStyleMedium9 style.

<tableStyles count="1" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleLight16">

<tableStyle name="My Custom Table Style" pivot="0" count="3">

<tableStyleElement type="wholeTable" dxfId="2">

<tableStyleElement type="headerRow" dxfId="1">

<tableStyleElement type="firstColumn" dxfId="0">

</tableStyle>

</tableStyles>

The style looks like this:

![custom table style](ssImages\SSstyles3.gif)

The style definition above uses differential formatting records (<dxf> elements referenced from the dxfId attribute), which enables subsets of formatting to be specified instead of specifying all formatting. Looking at the sample above, we see that the default style is the TableStyleMedium9 style. From that we are altering three aspects -- the wholeTable, headerRow, and firstColumn. Each of these elements references (again using a zero-based index) the <dxfs> collection within the styles part. For example, the <headerRow> element references the second <dxf> (dxfId="1"). It applies bold and a fill background color to the default table style defaultTableStyle="TableStyleMedium9".

<dxfs count="3">

<dxf>

<font>

<b val="0"/>

<i/>

<strike/>

</font>

<fill>

<patternFill>

<bgColor theme="2" tint="-0.2499465926081701"/>

</patternFill>

</fill>

</dxf>

<dxf>

<font>

<b/>

<i val="0"/>

<strike val="0"/>

</font>

<fill>

<patternFill>

<bgColor theme="8" tint="0.59996337778862885"/>

</patternFill>

</fill>

</dxf>

<dxf>

<fill>

<patternFill>

<bgColor theme="5" tint="0.59996337778862885"/>

</patternFill>

</fill>

<border>

<left style="hair">

<color auto="1"/>

</left>

<right style="hair">

<color auto="1"/>

</right>

<top style="hair">

<color auto="1"/>

</top>

<bottom style="hair">

<color auto="1"/>

</bottom>

<vertical style="hair">

<color auto="1"/>

</vertical>

<horizontal style="hair">

<color auto="1"/>

</horizontal>

</border>

</dxf>

</dxfs>

## Conditional Formatting

Conditional formatting is a format such as cell shading or font color that a spreadsheet can apply automatically to cells if a specified condition is true. For example, you can specify that a cell fill color should be red if the value in the cell is above 50. It can be a very effective tool for visually highlighting important aspects of the data in a worksheet.

Conditional formatting rules are stored in the worksheet part, within a <conditionalFormatting> element after the <sheetData> element. The range of cells to which the formatting applies is specified with the sqref attribute. Each condition is within a <cfRule> element. Multiple rules can be set, each with a different priority. There are several different types of rules to specify different conditions. For example, type="cellIs" will determine a cell format based on whether a cell value is greater than or less than a specified value, or between two values. A type="dataBar" will display a bar of varying length within a cell based on the value in the cell. Theses types are set with the type attribute on <cfRule>. A type="iconSet" will display an icon in the cell based upon the value in a cell. Below is a sample table which applies two conditions to the cells B2:B7 - one which applies a pink color fill if the value of the cell is greater than 500 and the other which applies a green fill if the value is less than 300.

![conditional formatting](ssImages\SSstyles4.gif)

The XML for the conditions is below.

<conditionalFormatting sqref="B2:B7">

<cfRule type="cellIs" dxfId="0" priority="2" operator="greaterThan">

<formula>500</formula>

</cfRule>

<cfRule type="cellIs" dxfId="1" priority="1" operator="lessThan">

<formula>300</formula>

</cfRule>

</conditionalFormatting>

Footer
