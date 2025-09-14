![PresentationXML.com](images\PresentationMLBanner.png)

# DrawingML Tables - Rows, Cells and Cell Content

A table is comprised of one or more rows, and a row contains one or more cells.

A table row is defined with the <a:tr> element. The row element can contain a height attribute (h), as either EMUs or as a number followed by a unit identifier. The row element contains one or more cell elements (<a:tc>).

All content within a table is defined within the cell element. A cell can contain only text. A cell may also have properties. (Note that a table may also have properties, but a row does not have properties other than a height.) The permitted child elements of <a:tc> include <a:txBody> for text and <a:tcPr> for cell properties.

A cell may also have the following attributes, which are discussed more fully at [DrawingML - Tables - Structure](dwrTableGrid.md).

| Attribute | Description                                                                                                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| gridSpan  | Specifies the number of columns that a merged cell spans. Used in combination with the hMerge attribute on other cells in order to specify the beginning cell of a horizontal merge                              |
| hMerge    | Values are booleans. When set to 1 or true, the cell is to be merged with the previous horizontal table cell.                                                                                                    |
| id        | Specifies a unique identifier for the cell. The identifier must be unique within the table, and is used to identify the cell as a header cell for other cells within the table, using the headers child element. |
| rowSpan   | Specifies the number of rows that a merged cell spans. Used in combination with the vMerge attribute on other cells in order to specify the beginning cell of a horizontal merge.                                |
| vMerge    | Values are booleans. When set to 1 or true, the cell is to be merged with the previous vertical table cell.                                                                                                      |

### Text Content within a Cell

Text within a presentation table cell is specified like text is specified within a drawingML shape -- that is, within a <a:txBody> element. For details, see [DrawingML - Shapes - Text](drwSp-text.md). Note one difference. The namespace for the <a:txBody> element is the main drawingML namespace (prefix 'a') rather than the presentation ('p') or other namespace.

Below is a sample presentation table with three rows. The middle row has text. Below the table is the xml for the row that contains the text.

![DrawingML - Table](drwImages\drwTableWithText.gif)

<a:tr h="370840">

<a:tc>

<a:txBody>

<a:bodyPr/>

<a:lstStyle/>

<a:p>

<a:r>

<a:rPr lang="en-US" dirty="0" smtClean="0"/>

<a:t>Bach</a:t>

</a:r>

<a:endParaRPr lang="en-US" dirty="0"/>

</a:p>

</a:txBody>

<a:tcPr/>

</a:tc>

<a:tc>

<a:txBody>

<a:bodyPr/>

<a:lstStyle/>

<a:p>

<a:r>

<a:rPr lang="en-US" dirty="0" smtClean="0"/>

<a:t>Beethoven</a:t>

</a:r>

<a:endParaRPr lang="en-US" dirty="0"/>

</a:p>

</a:txBody>

<a:tcPr/>

</a:tc>

<a:tc>

<a:txBody>

<a:bodyPr/>

<a:lstStyle/>

<a:p>

<a:r>

<a:rPr lang="en-US" dirty="0" smtClean="0"/>

<a:t>Brahms</a:t>

</a:r>

<a:endParaRPr lang="en-US" dirty="0"/>

</a:p>

</a:txBody>

<a:tcPr/>

</a:tc>

</a:tr>
