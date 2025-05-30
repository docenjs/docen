/**
 * Document container utilities (.mdcx)
 */

import type { DocumentContainer } from "../types";

/**
 * Insert text at the specified position
 */
export function documentInsertText(
  container: DocumentContainer,
  index: number,
  text: string,
): void {
  container.content.insert(index, text);
}

/**
 * Delete text from the specified range
 */
export function documentDeleteText(
  container: DocumentContainer,
  index: number,
  length: number,
): void {
  container.content.delete(index, length);
}

/**
 * Get the current text content
 */
export function documentGetText(container: DocumentContainer): string {
  return container.content.toString();
}

/**
 * Set the entire text content
 */
export function documentSetText(
  container: DocumentContainer,
  text: string,
): void {
  container.content.delete(0, container.content.length);
  container.content.insert(0, text);
}
