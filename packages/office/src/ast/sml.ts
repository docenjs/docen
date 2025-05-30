// --- SML Specific Element Types --- //

/*
Example SML node structure (placeholders):

export interface OoxmlSheet extends OoxmlParent {
  type: "element";
  name: "sheet";
  children: OoxmlRow[];
  data?: OoxmlData & { ooxmlType: "sheet", properties?: { name: string, sheetId: string } };
}

export interface OoxmlRow extends OoxmlParent {
  type: "element";
  name: "row";
  children: OoxmlCell[];
  data?: OoxmlData & { ooxmlType: "row", properties?: { index: number, height?: number } };
}

export interface OoxmlCell extends OoxmlParent {
  type: "element";
  name: "cell";
  children: (OoxmlCellValue | OoxmlInlineString)[]; // Cell content
  data?: OoxmlData & { ooxmlType: "cell", properties?: { ref: string, type?: string, styleId?: string } };
}

export interface OoxmlCellValue extends OoxmlLiteral {
  type: "literal"; // Or specific value type like 'number', 'string'
  data?: OoxmlData & { ooxmlType: "cellValue" };
}

export interface OoxmlInlineString extends OoxmlParent { // Represents <is><t>...</t></is>
   type: "element";
   name: "inlineString";
   children: XastText[];
   data?: OoxmlData & { ooxmlType: "inlineString" };
}
*/

// --- SML Content Union Types (if needed) --- //
// export type SmlContent = OoxmlSheet | OoxmlRow | OoxmlCell | ...;
