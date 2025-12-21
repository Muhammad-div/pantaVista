/**
 * Types for App Initialization Data from GET_APP_INIT API
 */

/**
 * Menu item structure from GET_APP_INIT
 */
export interface APIMenuItem {
  id: string;
  sortOrder: number;
  parentId?: string;
  action: string;
  caption: string;
  interactionId?: string;
  menuType: string;
  tooltip?: string;
  closeCaller?: string;
  key?: string;
  keyVersion?: string;
}

/**
 * UI Text/Localization data from GET_APP_INIT
 */
export interface UIText {
  name: string; // The NAME attribute (e.g., "WINDOW.TITLE", "LABEL:STOREINFORMATION")
  caption: string; // The text content
  key: string; // Internal key
}

/**
 * Menu node with hierarchical structure for rendering
 */
export interface MenuNode extends APIMenuItem {
  children: MenuNode[];
  level: number;
}
