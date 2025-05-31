/**
 * Presentation container utilities (.ptcx)
 */

import type { PresentationContainer } from "../types";

/**
 * Insert text content at the specified position
 */
export function presentationInsertText(
  container: PresentationContainer,
  index: number,
  text: string
): void {
  container.content.insert(index, text);
}

/**
 * Delete text from the specified range
 */
export function presentationDeleteText(
  container: PresentationContainer,
  index: number,
  length: number
): void {
  container.content.delete(index, length);
}

/**
 * Get the current text content
 */
export function presentationGetText(container: PresentationContainer): string {
  return container.content.toString();
}

/**
 * Set layout property
 */
export function presentationSetLayoutProperty(
  container: PresentationContainer,
  key: string,
  value: unknown
): void {
  container.layout.set(key, value);
}

/**
 * Get layout property
 */
export function presentationGetLayoutProperty(
  container: PresentationContainer,
  key: string
): unknown {
  return container.layout.get(key);
}

/**
 * Get all layout properties
 */
export function presentationGetLayout(
  container: PresentationContainer
): Record<string, unknown> {
  return Object.fromEntries(container.layout.entries());
}

/**
 * Set slide count
 */
export function presentationSetSlideCount(
  container: PresentationContainer,
  count: number
): void {
  container.layout.set("slideCount", count);
}

/**
 * Get slide count
 */
export function presentationGetSlideCount(
  container: PresentationContainer
): number {
  return (container.layout.get("slideCount") as number) || 1;
}
