/**
 * Menu Service
 * Enhanced menu management with proper sorting, tooltips, and hierarchy
 */

import type { APIMenuItem } from '../types/appInit';

export interface EnhancedMenuItem extends APIMenuItem {
  key?: string;
  keyVersion?: string;
  children: EnhancedMenuItem[];
  level: number;
  isRoot: boolean;
  route?: string;
  hasAction: boolean;
}

export interface MenuCategory {
  name: string;
  items: EnhancedMenuItem[];
  totalCount: number;
}

class MenuService {
  private menuItems: APIMenuItem[] = [];
  private enhancedMenuTree: EnhancedMenuItem[] = [];
  private initialized = false;

  /**
   * Initialize menu service with menu items from GET_APP_INIT
   */
  initialize(menuItems: APIMenuItem[]): void {
    this.menuItems = [...menuItems];
    this.enhancedMenuTree = this.buildEnhancedMenuTree();
    this.initialized = true;
    console.log('MenuService: Initialized with', menuItems.length, 'menu items');
    console.log('MenuService: Built tree with', this.enhancedMenuTree.length, 'root items');
  }

  /**
   * Build enhanced menu tree with proper sorting and hierarchy
   */
  private buildEnhancedMenuTree(): EnhancedMenuItem[] {
    if (!this.menuItems || this.menuItems.length === 0) {
      return [];
    }

    const itemMap = new Map<string, EnhancedMenuItem>();
    const rootItems: EnhancedMenuItem[] = [];

    // First pass: Create enhanced menu items
    this.menuItems.forEach(item => {
      const enhanced: EnhancedMenuItem = {
        ...item,
        children: [],
        level: 0,
        isRoot: !item.parentId,
        route: this.getRouteForMenuItem(item),
        hasAction: !!item.action && item.action.trim() !== '',
      };

      itemMap.set(item.id, enhanced);
    });

    // Second pass: Build hierarchy and set levels
    this.menuItems.forEach(item => {
      const enhanced = itemMap.get(item.id);
      if (!enhanced) return;

      if (item.parentId && itemMap.has(item.parentId)) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          enhanced.level = parent.level + 1;
          enhanced.isRoot = false;
          parent.children.push(enhanced);
        }
      } else {
        // Root level item
        enhanced.isRoot = true;
        enhanced.level = 0;
        rootItems.push(enhanced);
      }
    });

    // Third pass: Sort all levels properly
    const sortMenuLevel = (items: EnhancedMenuItem[]): void => {
      items.sort((a, b) => a.sortOrder - b.sortOrder);
      items.forEach(item => {
        if (item.children.length > 0) {
          sortMenuLevel(item.children);
        }
      });
    };

    sortMenuLevel(rootItems);
    return rootItems;
  }

  /**
   * Get appropriate route for menu item based on caption and interaction
   */
  private getRouteForMenuItem(item: APIMenuItem): string {
    const caption = item.caption?.toLowerCase() || '';
    
    // Map based on caption
    switch (caption) {
      case 'points-of-sale':
      case 'point-of-sale':
        return '/pos';
      case 'suppliers':
      case 'supplier':
        return '/suppliers';
      case 'regions':
      case 'region':
        return '/regions';
      case 'persons':
      case 'person':
        return '/persons';
      case 'transactions':
      case 'transaction':
        return '/transactions';
      case 'documents':
      case 'document':
        return '/documents';
      case 'products':
      case 'product':
        return '/products';
      case 'pantaree':
        return '/pentaree';
      case 'activities':
      case 'activity':
        return '/activities';
      default:
        // For sub-items or unknown items, use development route
        return '/development';
    }
  }

  /**
   * Get root level menu items (main navigation)
   */
  getRootMenuItems(): EnhancedMenuItem[] {
    if (!this.initialized) {
      console.warn('MenuService: Not initialized');
      return [];
    }

    return this.enhancedMenuTree.filter(item => 
      item.isRoot && 
      item.menuType === 'MENUTYPE:PARENT' && 
      item.caption && 
      !item.caption.includes('SPACER')
    );
  }

  /**
   * Get menu items by type
   */
  getMenuItemsByType(menuType: string): EnhancedMenuItem[] {
    return this.getAllMenuItems().filter(item => item.menuType === menuType);
  }

  /**
   * Get all menu items (flat list)
   */
  getAllMenuItems(): EnhancedMenuItem[] {
    const allItems: EnhancedMenuItem[] = [];
    
    const addItemsRecursively = (items: EnhancedMenuItem[]) => {
      items.forEach(item => {
        allItems.push(item);
        if (item.children.length > 0) {
          addItemsRecursively(item.children);
        }
      });
    };

    addItemsRecursively(this.enhancedMenuTree);
    return allItems;
  }

  /**
   * Get menu items by category
   */
  getMenuCategories(): MenuCategory[] {
    const categories: MenuCategory[] = [
      {
        name: 'Main Navigation',
        items: this.getRootMenuItems(),
        totalCount: this.getRootMenuItems().length,
      },
      {
        name: 'Context Menus',
        items: this.getMenuItemsByType('MENUTYPE:CONTEXT'),
        totalCount: this.getMenuItemsByType('MENUTYPE:CONTEXT').length,
      },
      {
        name: 'Flyout Menus',
        items: this.getMenuItemsByType('MENUTYPE:FLYOUT'),
        totalCount: this.getMenuItemsByType('MENUTYPE:FLYOUT').length,
      },
      {
        name: 'Sub Menus',
        items: this.getMenuItemsByType('MENUTYPE:SUB'),
        totalCount: this.getMenuItemsByType('MENUTYPE:SUB').length,
      },
    ];

    return categories.filter(cat => cat.totalCount > 0);
  }

  /**
   * Find menu item by ID
   */
  findMenuItem(id: string): EnhancedMenuItem | null {
    const allItems = this.getAllMenuItems();
    return allItems.find(item => item.id === id) || null;
  }

  /**
   * Find menu items by caption (fuzzy search)
   */
  searchMenuItems(query: string): EnhancedMenuItem[] {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return this.getAllMenuItems().filter(item =>
      item.caption?.toLowerCase().includes(searchTerm) ||
      item.tooltip?.toLowerCase().includes(searchTerm) ||
      item.action?.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get menu item with children by ID
   */
  getMenuItemWithChildren(id: string): EnhancedMenuItem | null {
    return this.findMenuItem(id);
  }

  /**
   * Get navigation breadcrumb for menu item
   */
  getBreadcrumb(id: string): EnhancedMenuItem[] {
    const item = this.findMenuItem(id);
    if (!item) return [];

    const breadcrumb: EnhancedMenuItem[] = [];
    let current: EnhancedMenuItem | null = item;

    // Build breadcrumb by traversing up the tree
    while (current) {
      breadcrumb.unshift(current);
      
      if (current.parentId) {
        current = this.findMenuItem(current.parentId);
      } else {
        current = null;
      }
    }

    return breadcrumb;
  }

  /**
   * Get statistics about the menu structure
   */
  getMenuStats(): {
    totalItems: number;
    rootItems: number;
    parentItems: number;
    flyoutItems: number;
    contextItems: number;
    subItems: number;
    spacerItems: number;
    actionItems: number;
    maxDepth: number;
  } {
    const allItems = this.getAllMenuItems();
    
    return {
      totalItems: allItems.length,
      rootItems: allItems.filter(item => item.isRoot).length,
      parentItems: allItems.filter(item => item.menuType === 'MENUTYPE:PARENT').length,
      flyoutItems: allItems.filter(item => item.menuType === 'MENUTYPE:FLYOUT').length,
      contextItems: allItems.filter(item => item.menuType === 'MENUTYPE:CONTEXT').length,
      subItems: allItems.filter(item => item.menuType === 'MENUTYPE:SUB').length,
      spacerItems: allItems.filter(item => item.menuType?.includes('SPACER')).length,
      actionItems: allItems.filter(item => item.hasAction).length,
      maxDepth: Math.max(...allItems.map(item => item.level), 0),
    };
  }

  /**
   * Check if menu service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Clear menu data
   */
  clear(): void {
    this.menuItems = [];
    this.enhancedMenuTree = [];
    this.initialized = false;
  }
}

// Export singleton instance
export const menuService = new MenuService();

// Export class for testing
export { MenuService };

/**
 * React hook for menu service
 */
export function useMenuService() {
  return menuService;
}
