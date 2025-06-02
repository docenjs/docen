/**
 * Data container utilities (.dtcx)
 */

import { Map as YMap } from "yjs";
import type { DataContainer } from "../types";

/**
 * Add a new row to the data container
 */
export function dataAddRow(
  container: DataContainer,
  rowData: Record<string, unknown>,
): void {
  const row = new YMap();
  for (const [key, value] of Object.entries(rowData)) {
    row.set(key, value);
  }
  container.data.push([row]);
}

/**
 * Update a specific cell in the data container
 */
export function dataUpdateCell(
  container: DataContainer,
  rowIndex: number,
  column: string,
  value: unknown,
): void {
  const row = container.data.get(rowIndex);
  if (row instanceof YMap) {
    row.set(column, value);
  }
}

/**
 * Get all data as an array of objects
 */
export function dataGetData(
  container: DataContainer,
): Record<string, unknown>[] {
  return container.data.toArray().map((row) => {
    if (row instanceof YMap) {
      return Object.fromEntries(row.entries());
    }
    return {};
  });
}

/**
 * Delete a row from the data container
 */
export function dataDeleteRow(container: DataContainer, index: number): void {
  container.data.delete(index, 1);
}

/**
 * Get the number of rows
 */
export function dataGetRowCount(container: DataContainer): number {
  return container.data.length;
}
