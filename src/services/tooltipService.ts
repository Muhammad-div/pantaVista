/**
 * Tooltip Service
 * Enhanced tooltip management with categorization and context-aware tooltips
 */

import type { APIMenuItem } from '../types/appInit';

export interface TooltipCategory {
  name: string;
  pattern: RegExp;
  description: string;
  count: number;
  examples: string[];
}

export interface TooltipAnalysis {
  totalTooltips: number;
  categories: TooltipCategory[];
  spacerCount: number;
  uniqueTooltips: string[];
}

class TooltipService {
  private menuItems: APIMenuItem[] = [];
  private initialized = false;

  /**
   * Initialize tooltip service with menu items
   */
  initialize(menuItems: APIMenuItem[]): void {
    this.menuItems = [...menuItems];
    this.initialized = true;
    console.log('TooltipService: Initialized with', menuItems.length, 'menu items');
  }

  /**
   * Get all tooltips from menu items
   */
  getAllTooltips(): string[] {
    if (!this.initialized) return [];
    
    return this.menuItems
      .map(item => item.tooltip || '')
      .filter(tooltip => tooltip.trim() !== '')
      .filter(tooltip => tooltip !== 'SPACER');
  }

  /**
   * Get unique tooltips
   */
  getUniqueTooltips(): string[] {
    const tooltips = this.getAllTooltips();
    return Array.from(new Set(tooltips)).sort();
  }

  /**
   * Categorize tooltips by action type
   */
  categorizeTooltips(): TooltipAnalysis {
    const allTooltips = this.getAllTooltips();
    const uniqueTooltips = this.getUniqueTooltips();
    
    const categories: TooltipCategory[] = [
      {
        name: 'View/Show Actions',
        pattern: /shows?\s+(you\s+)?(detailed\s+information|a\s+list|selected|activities)/i,
        description: 'Tooltips for viewing or displaying data',
        count: 0,
        examples: []
      },
      {
        name: 'Edit Actions',
        pattern: /(edit|modify)\s+/i,
        description: 'Tooltips for editing existing data',
        count: 0,
        examples: []
      },
      {
        name: 'Create Actions',
        pattern: /(create|new)\s+/i,
        description: 'Tooltips for creating new items',
        count: 0,
        examples: []
      },
      {
        name: 'Window/Navigation',
        pattern: /opens?\s+(a\s+)?new\s+window/i,
        description: 'Tooltips for opening new windows or navigation',
        count: 0,
        examples: []
      },
      {
        name: 'Map/Geographic',
        pattern: /(map|geographic|location)/i,
        description: 'Tooltips for map-related functions',
        count: 0,
        examples: []
      },
      {
        name: 'Document Actions',
        pattern: /(document|file|pdf)/i,
        description: 'Tooltips for document operations',
        count: 0,
        examples: []
      },
      {
        name: 'Assignment/Relationship',
        pattern: /(assignment|assigned|relationship)/i,
        description: 'Tooltips for managing assignments and relationships',
        count: 0,
        examples: []
      },
      {
        name: 'Simple Labels',
        pattern: /^[A-Za-z\s-]+$/,
        description: 'Simple section labels without action descriptions',
        count: 0,
        examples: []
      }
    ];

    // Categorize each unique tooltip
    uniqueTooltips.forEach(tooltip => {
      let categorized = false;

      for (const category of categories) {
        if (category.pattern.test(tooltip)) {
          category.count++;
          if (category.examples.length < 3) {
            category.examples.push(tooltip);
          }
          categorized = true;
          break;
        }
      }

      // If not categorized, add to simple labels
      if (!categorized) {
        const simpleCategory = categories.find(cat => cat.name === 'Simple Labels');
        if (simpleCategory) {
          simpleCategory.count++;
          if (simpleCategory.examples.length < 3) {
            simpleCategory.examples.push(tooltip);
          }
        }
      }
    });

    // Get spacer count
    const spacerCount = this.menuItems.filter(item => 
      item.tooltip === 'SPACER' || 
      item.caption?.includes('SPACER')
    ).length;

    return {
      totalTooltips: allTooltips.length,
      categories: categories.filter(cat => cat.count > 0),
      spacerCount,
      uniqueTooltips
    };
  }

  /**
   * Get tooltip for specific menu item with enhancements
   */
  getEnhancedTooltip(menuItem: APIMenuItem): string {
    const tooltip = menuItem.tooltip || '';
    
    // If it's a basic tooltip, enhance it with context
    if (tooltip && !tooltip.includes('Shows') && !tooltip.includes('Edit') && !tooltip.includes('Create')) {
      // For main sections, add contextual information
      switch (menuItem.menuType) {
        case 'MENUTYPE:PARENT':
          return `${tooltip} - Main navigation section`;
        case 'MENUTYPE:FLYOUT':
          return `${tooltip} - Click to open flyout menu`;
        case 'MENUTYPE:CONTEXT':
          return `${tooltip} - Context menu item`;
        case 'MENUTYPE:SUB':
          return `${tooltip} - Sub-menu section`;
        default:
          return tooltip;
      }
    }
    
    return tooltip;
  }

  /**
   * Get tooltips by menu type
   */
  getTooltipsByMenuType(): Record<string, string[]> {
    if (!this.initialized) return {};

    const result: Record<string, string[]> = {};
    
    this.menuItems.forEach(item => {
      if (!item.tooltip || item.tooltip === 'SPACER') return;
      
      const menuType = item.menuType || 'UNKNOWN';
      if (!result[menuType]) {
        result[menuType] = [];
      }
      
      if (!result[menuType].includes(item.tooltip)) {
        result[menuType].push(item.tooltip);
      }
    });

    return result;
  }

  /**
   * Search tooltips by content
   */
  searchTooltips(query: string): Array<{item: APIMenuItem, tooltip: string}> {
    if (!this.initialized || !query.trim()) return [];

    const searchTerm = query.toLowerCase();
    return this.menuItems
      .filter(item => item.tooltip && item.tooltip.toLowerCase().includes(searchTerm))
      .map(item => ({ item, tooltip: item.tooltip! }));
  }

  /**
   * Get tooltips with action keywords
   */
  getActionTooltips(): Record<string, Array<{item: APIMenuItem, tooltip: string}>> {
    const actions = ['show', 'edit', 'create', 'new', 'open', 'remove', 'delete'];
    const result: Record<string, Array<{item: APIMenuItem, tooltip: string}>> = {};

    actions.forEach(action => {
      result[action] = this.searchTooltips(action);
    });

    return result;
  }

  /**
   * Get main navigation tooltips (PARENT menu types)
   */
  getMainNavigationTooltips(): Array<{caption: string, tooltip: string, sortOrder: number}> {
    if (!this.initialized) return [];

    return this.menuItems
      .filter(item => 
        item.menuType === 'MENUTYPE:PARENT' && 
        item.tooltip && 
        !item.parentId
      )
      .map(item => ({
        caption: item.caption,
        tooltip: item.tooltip!,
        sortOrder: item.sortOrder
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * Get tooltip statistics
   */
  getTooltipStats(): {
    totalMenuItems: number;
    itemsWithTooltips: number;
    itemsWithoutTooltips: number;
    spacerItems: number;
    uniqueTooltipCount: number;
    averageTooltipLength: number;
    longestTooltip: string;
    shortestTooltip: string;
  } {
    if (!this.initialized) {
      return {
        totalMenuItems: 0,
        itemsWithTooltips: 0,
        itemsWithoutTooltips: 0,
        spacerItems: 0,
        uniqueTooltipCount: 0,
        averageTooltipLength: 0,
        longestTooltip: '',
        shortestTooltip: ''
      };
    }

    const allTooltips = this.getAllTooltips();
    const uniqueTooltips = this.getUniqueTooltips();
    const spacerItems = this.menuItems.filter(item => 
      item.tooltip === 'SPACER' || item.caption?.includes('SPACER')
    ).length;

    const tooltipLengths = allTooltips.map(t => t.length);
    const averageLength = tooltipLengths.length > 0 
      ? tooltipLengths.reduce((a, b) => a + b, 0) / tooltipLengths.length 
      : 0;

    const sortedByLength = [...uniqueTooltips].sort((a, b) => a.length - b.length);
    
    return {
      totalMenuItems: this.menuItems.length,
      itemsWithTooltips: this.menuItems.filter(item => item.tooltip && item.tooltip !== 'SPACER').length,
      itemsWithoutTooltips: this.menuItems.filter(item => !item.tooltip || item.tooltip === 'SPACER').length,
      spacerItems,
      uniqueTooltipCount: uniqueTooltips.length,
      averageTooltipLength: Math.round(averageLength),
      longestTooltip: sortedByLength[sortedByLength.length - 1] || '',
      shortestTooltip: sortedByLength[0] || ''
    };
  }

  /**
   * Check if tooltip service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Clear tooltip data
   */
  clear(): void {
    this.menuItems = [];
    this.initialized = false;
  }
}

// Export singleton instance
export const tooltipService = new TooltipService();

// Export class
export { TooltipService };

/**
 * React hook for tooltip service
 */
export function useTooltipService() {
  return tooltipService;
}
