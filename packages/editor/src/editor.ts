/**
 * Main DocenEditor class - container-aware collaborative editor
 */

import type { AnyContainer, ContainerType } from "@docen/containers";
import { EventEmitter } from "eventemitter3";

/**
 * Editor events
 */
export interface EditorEvents {
  "container:loaded": (container: AnyContainer) => void;
  "container:changed": (container: AnyContainer) => void;
  "mode:changed": (mode: ContainerType) => void;
}

/**
 * Main editor class that adapts UI based on container type
 */
export class DocenEditor extends EventEmitter<EditorEvents> {
  private currentContainer: AnyContainer | null = null;
  private element: HTMLElement | null = null;

  constructor(element?: HTMLElement) {
    super();
    if (element) {
      this.mount(element);
    }
  }

  /**
   * Mount editor to DOM element
   */
  mount(element: HTMLElement): void {
    this.element = element;
    this.render();
  }

  /**
   * Load a container into the editor
   */
  loadContainer(container: AnyContainer): void {
    this.currentContainer = container;
    this.emit("container:loaded", container);
    this.emit("mode:changed", container.type);
    this.render();
  }

  /**
   * Get current container
   */
  getContainer(): AnyContainer | null {
    return this.currentContainer;
  }

  /**
   * Get current editor mode based on container type
   */
  getMode(): ContainerType | null {
    return this.currentContainer?.type || null;
  }

  /**
   * Render the appropriate UI based on container type
   */
  private render(): void {
    if (!this.element || !this.currentContainer) {
      return;
    }

    // Clear existing content
    this.element.innerHTML = "";

    // Render based on container type
    switch (this.currentContainer.type) {
      case "document":
        this.renderDocumentEditor();
        break;
      case "data":
        this.renderDataEditor();
        break;
      case "presentation":
        this.renderPresentationEditor();
        break;
    }
  }

  /**
   * Render document editor UI (.mdcx)
   */
  private renderDocumentEditor(): void {
    if (
      !this.element ||
      !this.currentContainer ||
      this.currentContainer.type !== "document"
    ) {
      return;
    }

    const editor = document.createElement("div");
    editor.className = "docen-document-editor";
    editor.innerHTML = `
      <div class="toolbar">
        <button>Bold</button>
        <button>Italic</button>
        <button>Link</button>
      </div>
      <div class="content" contenteditable="true"></div>
    `;

    this.element.appendChild(editor);
  }

  /**
   * Render data editor UI (.dtcx)
   */
  private renderDataEditor(): void {
    if (
      !this.element ||
      !this.currentContainer ||
      this.currentContainer.type !== "data"
    ) {
      return;
    }

    const editor = document.createElement("div");
    editor.className = "docen-data-editor";
    editor.innerHTML = `
      <div class="toolbar">
        <button>Add Row</button>
        <button>Add Column</button>
        <button>Sort</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Column 1</th></tr></thead>
          <tbody><tr><td contenteditable="true">Cell 1</td></tr></tbody>
        </table>
      </div>
    `;

    this.element.appendChild(editor);
  }

  /**
   * Render presentation editor UI (.ptcx)
   */
  private renderPresentationEditor(): void {
    if (
      !this.element ||
      !this.currentContainer ||
      this.currentContainer.type !== "presentation"
    ) {
      return;
    }

    const editor = document.createElement("div");
    editor.className = "docen-presentation-editor";
    editor.innerHTML = `
      <div class="toolbar">
        <button>Add Slide</button>
        <button>Layout</button>
        <button>Theme</button>
      </div>
      <div class="slides-panel">
        <div class="slide-thumbnail">Slide 1</div>
      </div>
      <div class="slide-editor">
        <div class="slide-content" contenteditable="true">
          Click to edit slide content
        </div>
      </div>
    `;

    this.element.appendChild(editor);
  }

  /**
   * Destroy editor and cleanup
   */
  destroy(): void {
    if (this.element) {
      this.element.innerHTML = "";
    }
    this.removeAllListeners();
    this.currentContainer = null;
    this.element = null;
  }
}
