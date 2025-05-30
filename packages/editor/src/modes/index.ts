/**
 * Editor modes for different container types
 */

// Placeholder for future mode-specific implementations
export interface EditorMode {
  type: "document" | "data" | "presentation";
  render(element: HTMLElement): void;
  destroy(): void;
}
