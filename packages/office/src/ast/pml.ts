// --- PML Specific Element Types --- //

/*
Example PML node structure (placeholders):

// Represents a slide (<p:sld>)
export interface OoxmlSlide extends OoxmlParent {
  type: "element";
  name: "slide";
  children: OoxmlShapeTree[]; // Or other top-level slide elements
  data?: OoxmlData & { ooxmlType: "slide", properties?: { layoutId?: string } };
}

// Represents the shape tree on a slide (<p:spTree>)
export interface OoxmlShapeTree extends OoxmlParent {
  type: "element";
  name: "shapeTree";
  children: (OoxmlShape | OoxmlPicture | OoxmlGraphicFrame)[]; // Common shapes
  data?: OoxmlData & { ooxmlType: "shapeTree" };
}

// Represents a shape (<p:sp>)
export interface OoxmlShape extends OoxmlParent {
  type: "element";
  name: "shape";
  children: OoxmlTextBody[]; // Shapes often contain text
  data?: OoxmlData & { ooxmlType: "shape", properties?: { geometry, style, etc. } };
}

// Represents a picture (<p:pic>)
// Similar to OoxmlImage in DML, but might have PML specific context/properties
export interface OoxmlPicture extends OoxmlNode {
  type: "picture"; // Custom type for clarity?
  relationId: string;
  data?: OoxmlData & { ooxmlType: "picture", properties?: import("./shared").PositionalProperties & {  } };
}

// Represents graphical frames (<p:graphicFrame> for charts, tables, diagrams)
export interface OoxmlGraphicFrame extends OoxmlParent {
   type: "element";
   name: "graphicFrame";
   // Children would depend on the graphic type (e.g., a chart defined in DML)
   data?: OoxmlData & { ooxmlType: "graphicFrame", properties?: { type, positioning } };
}

// Represents text body within a shape (<p:txBody>)
export interface OoxmlTextBody extends OoxmlParent {
  type: "element";
  name: "textBody";
  children: import("./wml").OoxmlParagraph[]; // Text body contains paragraphs (using WML's definition for now)
  data?: OoxmlData & { ooxmlType: "textBody" };
}

*/

// --- PML Content Union Types (if needed) --- //
// export type PmlContent = OoxmlSlide | OoxmlShapeTree | OoxmlShape | ...;
