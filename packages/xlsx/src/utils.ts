export function parseCellPosition(cell: string, options?: { raw?: boolean }) {
  // use regex to split cell into column and row
  const regex = /([A-Za-z]+)(\d+)/;

  const [column, row] = cell.match(regex)?.slice(1) ?? [];

  if (!column || !row) {
    throw new Error("Invalid cell position");
  }

  // convert column to column number
  const columnNumber = column
    .split("")
    .reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0);

  return { column: options?.raw ? column : columnNumber, row: Number(row) };
}

export function generateCellColumn(column: number) {
  let result = "";
  let col = column;
  while (col > 0) {
    const modulo = (col - 1) % 26;
    result = String.fromCharCode(65 + modulo) + result;
    col = Math.floor((col - modulo) / 26);
  }
  return result;
}
