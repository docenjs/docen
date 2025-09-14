![PresentationXML.com](images\PresentationMLBanner.png)

# DrawingML Tables - Styles

A drawingML table can have various properties applicable to the table as a whole--such properties as special formatting for banded rows or columns, or for first or last columns or rows. A table can also have headers. Finally, a table can be set up right to left rather than the default left to right. (Note that although the ECMA specification indicates that a table may have a table-wide fill, Microsoft PowerPoint does not seem to support it. Fills seem to be implemented at the cell level only.) The properties of a table are specified in the <a:tblPr> element, which is a child of the <a:tbl> element. The child elements of <a:tbl> are mostly related to table fill. The other child elements are related to table styles. The attributes to <a:tbl> are related to the operation of the table styles, such as banded rows and columns, and so are covered in the table styles section below.

## Table Styles

Styles for a table are specified in one of two ways. A table style can be specified in line with the specification of the table within the slide part by placing it in a <a:tblStyle> element, which is a child element of the <a:tblpr> element. Alternatively, a table style can be defined separately in a table styles part and referenced from a <a:tblStyleId> element, which is also a child of <a:tblpr>.

Most typically table styles will be referenced from <a:tblStyleId>. The <a:tblStyleId> element contains a GUID, which matches the value of a styleId attribute of a <a:tblStyle> element found within the table styles part in the package. There is only one table styles part per presentation. It is named tableStyles.xml and found under the ppt folder in PowerPoint packages.

The table styles part is referenced in the .rels file for the presentation (presentation.xml.rels).

<Relationship Id="rId6" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/>

Below is first the specification of a table (as it appears in a presentation slide) referencing a table style . Below that is the specification of the table style as it appears in the table styles part.

<a:tbl>

<a:tblPr firstRow="1" bandRow="1">

<a:tableStyleId>{F5AB1C69-6EDB-4FF4-983F-18BD219EF322}</a:tableStyleId>

. . .

</a:tbl>

Within the table styles part are one or more table styles within a <a:tblStyleLst>. Below is the table style referenced above:

<a:tblStyleLst . . .>

<a:tblStyle styleId="{F5AB1C69-6EDB-4FF4-983F-18BD219EF322}" styleName="Medium Style 2 - Accent 3">

<a:wholeTbl>

. . .

</a:wholeTbl>

. . .

. . .

</a:tblStyleLst>

There are fourteen possible child elements of a table style which can determine the styling of a table. They provide visual formatting of various aspects of a table that can turned on or off as toggles. The toggles are:

- first row on/off - associated element <a:firstRow>
- last row on/off - associated element <a:lastRow>
- first column on/off - associated element <a:firstCol>
- last column on/off - associated element <a:lastCol>
- row banding on/off - associated element <a:band1H>, <a:band2H>. (Banding relies on alternating styles, and so two different styles are required.)
- column banding on/off - associated element <a:band1V>, <a:band2V>. (Banding relies on alternating styles, and so two different styles are required.)

The toggles are turned on and off with attributes of <a:tblPr>. For example, the following specification for a table's attributes turns on first row and banded row formatting: <a:tblPr firstRow="1" bandRow="1">.

There are six possible attributes associated with the six toggles. Each is a boolean with possible values of 1 or true and 0 or false.

- bandCol \- a value of true enables the banded columns style defined in the table styles by <a:band1V> and <a:band2V>
- bandRow \- a value of true enables the banded row style defined in the table styles by <a:band1H> and <a:band2H>
- firstCol \- a value of true enables the style for the first column defined by <a:firstCol>
- firstRow \- a value of true enable the style for the first row defined by <a:firstRow>
- lastCol \- a value of true enables the style for the last column defined by <a:lastCol>
- lastRow \- a value of true enables the style for the last row defined by <a:lastRow>

In addition to the 8 elements for column and row styling mentioned above, there are four specialty child elements of <a:tblStyle> to handle the cases in which row and column styling intersect - that is, the 4 corners of the table or the northeast cell (<a:neCell>), northwest cell (<a:nwCell>), southeast cell (<a:seCell>), and southwest cell (<a:swCell>). So, for example, the style as specified by the southeast cell element will apply when both the last row and last column toggles are turned on.

When all of the toggles are off (the default value for each is false), the formatting for the table is specified in the <a:wholeTbl> element. The last of the 14 possible child elements of a table style is the <a:tblBg> or table background element, which specifies a background for the table.

Each of the above-named elements (except for <a:tblBg>) can contain child elements which specify a table cell style (<a:tcStyle>) and a table cell text style (<a:tcTxStyle>).

## Table Cell Styles

The style for a table cell can consist of a fill and/or borders. (A cell can have 3-D properties such a a bevel, but these properties are not discussed here.) A table cell fill can be specified in line within the <a:tcStyle> element, inside a <a:fill> element, or a fill specification within a presentation's theme can be referenced with a <a:fillRef> element. The <a:fillRef> element has a idx attribute which is an index to the theme's fill styles. See [PresentationML - Slides - Properties - Fills](http://www.officeopenxml.com/prSlide-styles-themes.md) for more.

The fill is specified as discussed in the context of drawingML shape fills--as a blip fill, gradient fill, solid fill, pattern fill, or no fill. See [DrawingML - Shapes - Fill](http://www.officeopenxml.com/drwSp-shapeFill.md).

A table cell style may specify up to 8 borders within a <a:tcBdr> element. Each is a child element:

- <a:bottom> \- bottom border
- <a:insideH> \- inside horizontal border
- <a:insideV> \- inside vertical border
- <a:left> \- left border
- <a:right> \- right border
- <a:tl2br> \- top left to bottom right border
- <a:top> \- top border
- <a:tl2br> \- top right to bottom left border

Each of the border elements has either a line element (<a:ln>) or a line reference element (<a:lnRef>). See the discussion at [DrawingML - Shapes - Outline](http://www.officeopenxml.com/drwSp-outline.md) for more on the <a:ln> element. See the discussion at [DrawingML - Shapes - Styles](http://www.officeopenxml.com/drwSp-styles.md) for more on the <a:lnRef> element.

## Table Cell Text Styles

The properties of text within a cell are specified in <a:tcTxStyle> element. There are two major properties that can be specified for text: font and text color. The font can be either specified inline within a <a:font> element or a font may be referenced within a <a:fontRef> element. The <a:fontRef> element is an empty element with two attributes: script, which specifies the language, and typeface, which specifies the font face. The <a:fontRef> element simply references a font specified within a theme. For details on the font reference, see [DrawingML - Shapes - Styles](http://www.officeopenxml.com/drwSp-styles.md).

The color of text may be specified using the familiar elements that are used to specify color, all as children of <a:tcTxStyle>: <a:hslClr> (hue, saturation, and luminance), <a:prstClr> (preset color), <a:schemeClr> (scheme or theme color), <a:sysClr> (system color), <a:scrgbClr> (RGB color - percent), and <a:srgbClr> (RGB color - hex). For more on color, see [PresentationML - Slides - Properties - Color Scheme](http://www.officeopenxml.com/prSlide-color.md).

In addition to the properties of font and color, represented as child elements of <a:tcTxStyle>, there are two possible attributes of <a:tcTxStyle> which specify that the text is to be bold (b) and italicized (1), both of which can have values of either on or off.

## Table Headers

There are two facets to identifying cells as headers. First, a cell that is to act as a header is given a unique identifier in the id attribute of the <a:tc> element. E.g., <a:tc id="HeaderA"/>. Second, cells which have one or more headers (that is, a vertical and/or horizontal header) must identify their header cells by including a list of headers in the <a:tcPr> element, within a <a:headers> element. Each header associated with the cell appears as an empty <a:header val="HeaderA"/> element. Consider the table below, with header cells A, B, C, and D.

![DrawingML - Table - Styles](drwImages\drwTable-tableStyles4.gif)

The XML for the table with such headers is below.

<a:tbl>

. . .

<a:tr>

. . .

<a:tc>

. . .

</a:tc>

<a:tc id="HeaderA">

. . .

<a:p>

<a:r>

<a:t>A</a:t>

</a:r>

</a:p>

</a:tc>

. . .

</a:tr>

<a:tr>

. . .

<a:tc>

. . .

</a:tc>

<a:tc id="HeaderC">

. . .

<a:p>

<a:r>

<a:t>C</a:t>

</a:r>

</a:p>

</a:tc>

<a:tc>

<a:p>

<a:r>

<a:t>x1</a:t>

</a:r>

</a:p>

<a:tcPr>

. . .

<a:headers>

<a:header val="HeaderA"/>

<a:header val="HeaderC"/>

</a:headers>

. . .

</a:tcPr>

</a:tc>

. . .

</a:tr>

. . .

</a:tbl>

## Table Styles Example

Now to pull it all together, let's look at an sample table with a table style. The table below applies a style with banded rows and styling for the first column.

![DrawingML - Table - Styles](drwImages\drwTable-tableStyles1.gif)

First, in the slide part we has a reference to the table style:

<a:tbl>

<a:tblPr firstCol="1" bandRow="1">

<a:tableStyleId>{F5AB1C69-6EDB-4FF4-983F-18BD219EF322}</a:tableStyleId>

</a:tblPr>

. . .

</a:tbl>

The table styles part at the root of the package has the style:

<a:tblStyle styleId="{F5AB1C69-6EDB-4FF4-983F-18BD219EF322}" styleName="Medium Style 2 - Accent 3">

. . .

<a:band1H>

<a:tcStyle>

<a:tcBdr/>

<a:fill>

<a:solidFill>

<a:schemeClr val="accent3">

<a:tint val="40000"/>

</a:schemeClr>

</a:solidFill>

</a:fill>

</a:tcStyle>

</a:band1H>

<a:band2H>

<a:tcStyle>

<a:tcBdr/>

</a:tcStyle>

</a:band2H>

. . .

<a:firstCol>

<a:tcStyle>

<a:tcTxStyle b="on">

<a:fontRef idx="minor">

<a:prstClr val="black"/>

</a:fontRef>

<a:schemeClr val="lt1"/>

</a:tcTxStyle>

<a:tcBdr/>

<a:fill>

<a:solidFill>

<a:schemeClr val="accent3"/>

</a:solidFill>

</a:fill>

</a:tcStyle>

</a:firstCol>

. . .

</a:tblStyle>

Now let's alter the style. We change the fill for the first column to make it black, changing the fill from <a:schemeClr val="accent3"/> to <a:prstClr val="black"/>. The resulting table will look like the table below.

NOTE: In older versions of Microsoft Word, changes to the table style are not always reflected in the table.

<a:tblStyle styleId="{F5AB1C69-6EDB-4FF4-983F-18BD219EF322}" styleName="Medium Style 2 - Accent 3">

. . .

<a:band1H>

. . .

</a:band1H>

<a:band2H>

. . .

</a:band2H>

. . .

<a:firstCol>

<a:tcStyle>

. . .

<a:fill>

<a:solidFill>

<a:prstClr val="black"/>

</a:solidFill>

</a:fill>

</a:tcStyle>

</a:firstCol>

. . .

</a:tblStyle>

![DrawingML - Table - Styles](drwImages\drwTable-tableStyles2.gif)

Now let's also alter the text style for the horizontal band found within the <a:band1H> element. Let's make the text italics and red as follows.

<a:tblStyle styleId="{F5AB1C69-6EDB-4FF4-983F-18BD219EF322}" styleName="Medium Style 2 - Accent 3">

. . .

<a:band1H>

<a:tcTxStyle i="on">

<a:fontRef idx="minor"/>

<a:prstClr val="red"/>

</a:tcTxStyle>

<a:tcStyle>

<a:tcBdr/>

<a:fill>

<a:solidFill>

<a:schemeClr val="accent3">

<a:tint val="40000" />

</a:schemeClr>

</a:solidFill>

</a:fill>

</a:tcStyle>

</a:band1H>

<a:band2H>

. . .

</a:band2H>

. . .

<a:firstCol>

. . .

</a:firstCol>

. . .

</a:tblStyle>

The result is below.

![DrawingML - Table - Styles](drwImages\drwTable-tableStyles3.gif)

## Right-To-Left Tables

A table can be arranged right-to-left rather than the default left-to-right by setting to a true value the rtl attribute on the <a:tblPr> element. E.g., <a:tblPr rtl="1"/>. Below is first a left-to-right table.

![DrawingML - Table - Styles](drwImages\drwTable-tableStyles6.gif)

The following is the same table arranged right-to-left.

![DrawingML - Table - Styles](drwImages\drwTable-tableStyles5.gif)
