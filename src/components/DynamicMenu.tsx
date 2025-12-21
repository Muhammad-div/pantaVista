import React, { useEffect, useState } from 'react';
import { Tooltip, Fade } from '@mui/material';
import type { APIMenuItem, UIText, MenuNode } from '../types/appInit';
import { useMenuService } from '../services/menuService';
import './DynamicMenu.css';

interface DynamicMenuProps {
  menuItems: APIMenuItem[];
  uiTexts: UIText[];
  onMenuItemClick?: (item: APIMenuItem) => void;
  className?: string;
}

// MenuNode is now imported from types/appInit.ts

/**
 * Dynamic Menu Component
 * Renders menu structure from GET_APP_INIT response data
 */
const DynamicMenu: React.FC<DynamicMenuProps> = ({ 
  menuItems, 
  uiTexts, 
  onMenuItemClick, 
  className = '' 
}) => {
  const [menuTree, setMenuTree] = useState<MenuNode[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [uiTextMap, setUITextMap] = useState<Map<string, string>>(new Map());
  const [showOnlyParents, setShowOnlyParents] = useState(false);
  const menuService = useMenuService();

  useEffect(() => {
    // Create a map of UI texts for quick lookup
    const textMap = new Map<string, string>();
    uiTexts.forEach(text => {
      textMap.set(text.name, text.caption);
    });
    setUITextMap(textMap);
  }, [uiTexts]);

  useEffect(() => {
    // Build enhanced menu tree structure with proper sorting
    const buildMenuTree = (items: APIMenuItem[]): MenuNode[] => {
      const itemMap = new Map<string, MenuNode>();
      const rootItems: MenuNode[] = [];

      // First, create all menu nodes with enhanced properties
      items.forEach(item => {
        const node: MenuNode = {
          ...item,
          children: [],
          level: 0
        };
        itemMap.set(item.id, node);
      });

      // Build the tree structure - check for both undefined and empty string parentId
      items.forEach(item => {
        const node = itemMap.get(item.id);
        if (!node) return;

        if (item.parentId && item.parentId.trim() !== '' && itemMap.has(item.parentId)) {
          const parent = itemMap.get(item.parentId);
          if (parent) {
            node.level = parent.level + 1;
            parent.children.push(node);
          }
        } else {
          // Root level item (no parentId or empty parentId)
          rootItems.push(node);
        }
      });

      // Enhanced sorting: Sort all levels recursively by sortOrder
      const sortNodesRecursively = (nodes: MenuNode[]): MenuNode[] => {
        return nodes
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(node => ({
            ...node,
            children: sortNodesRecursively(node.children)
          }));
      };

      const sortedTree = sortNodesRecursively(rootItems);
      
      console.log('DynamicMenu: Built enhanced tree with', rootItems.length, 'root items');
      console.log('DynamicMenu: Root items by sort order:', sortedTree.map(item => ({
        sort: item.sortOrder,
        caption: item.caption,
        type: item.menuType,
        children: item.children.length
      })));

      return sortedTree;
    };

    if (menuItems.length > 0) {
      const tree = buildMenuTree(menuItems);
      setMenuTree(tree);
    }
  }, [menuItems]);

  const getLocalizedText = (textKey: string, fallback?: string): string => {
    return uiTextMap.get(textKey) || fallback || textKey;
  };

  const handleItemClick = (item: MenuNode) => {
    // Toggle expanded state for parent items
    if (item.children.length > 0) {
      const newExpanded = new Set(expandedItems);
      if (expandedItems.has(item.id)) {
        newExpanded.delete(item.id);
      } else {
        newExpanded.add(item.id);
      }
      setExpandedItems(newExpanded);
    }

    // Call external click handler
    if (onMenuItemClick) {
      onMenuItemClick(item);
    }
  };

  const renderMenuItem = (item: MenuNode): React.ReactNode => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children.length > 0;
    const isParent = item.menuType?.includes('PARENT');
    const isSpacer = item.menuType?.includes('SPACER');
    const isContextMenu = item.menuType?.includes('CONTEXT');
    const isFlyout = item.menuType?.includes('FLYOUT');

    // Skip spacers for now (they could be rendered as dividers)
    if (isSpacer && item.caption === 'SPACER') {
      return (
        <div 
          key={item.id} 
          className={`menu-spacer level-${item.level}`}
        />
      );
    }

    const itemClasses = [
      'menu-item',
      `level-${item.level}`,
      isParent ? 'menu-parent' : '',
      isFlyout ? 'menu-flyout' : '',
      isContextMenu ? 'menu-context' : '',
      hasChildren ? 'has-children' : '',
      isExpanded ? 'expanded' : '',
      item.action ? `action-${item.action.toLowerCase()}` : ''
    ].filter(Boolean).join(' ');

    return (
      <div key={item.id} className="menu-item-container">
        <Tooltip
          title={item.tooltip || item.caption || 'No description available'}
          placement="right"
          arrow
          enterDelay={200}
          leaveDelay={100}
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 300 }}
          componentsProps={{
            tooltip: {
              sx: {
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                fontSize: '13px',
                fontWeight: 500,
                maxWidth: '300px',
                padding: '10px 14px',
                borderRadius: '8px',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                lineHeight: 1.4,
              }
            },
            arrow: {
              sx: {
                color: 'rgba(0, 0, 0, 0.9)',
              }
            }
          }}
        >
          <div 
            className={itemClasses}
            onClick={() => handleItemClick(item)}
            data-interaction-id={item.interactionId}
            data-action={item.action}
          >
          <div className="menu-item-content">
            {hasChildren && (
              <span className={`menu-toggle ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded ? '▼' : '▶'}
              </span>
            )}
            <span className="menu-caption">
              {item.caption}
            </span>
            {item.action && (
              <span className="menu-action-hint" title={`Action: ${item.action}`}>
                {item.action === 'ADDWINDOW' ? '⧉' : 
                 item.action === 'DETERMINATION_USER_EDIT' ? '✎' : 
                 item.action === 'DETERMINATION_SUPPLIERMEMBER_DELETE' ? '🗑' : 
                 '•'}
              </span>
            )}
          </div>
          </div>
        </Tooltip>
        
        {hasChildren && isExpanded && (
          <div className={`menu-children level-${item.level + 1}`}>
            {item.children.map(child => renderMenuItem(child))}
          </div>
        )}
      </div>
    );
  };

  if (menuTree.length === 0) {
    return (
      <div className={`dynamic-menu ${className} loading`}>
        <div className="menu-loading">Loading menu...</div>
      </div>
    );
  }

  // Filter menu items based on display mode
  const getDisplayItems = (): MenuNode[] => {
    if (showOnlyParents) {
      return menuTree.filter(item => item.menuType === 'MENUTYPE:PARENT');
    }
    return menuTree;
  };

  return (
    <div className={`dynamic-menu ${className}`}>
      <div className="menu-header">
        <div className="menu-title">Menu ({menuItems.length} items)</div>
        <div className="menu-controls">
          <button 
            className={`filter-btn ${showOnlyParents ? 'active' : ''}`}
            onClick={() => setShowOnlyParents(!showOnlyParents)}
            title={showOnlyParents ? 'Show all menu items' : 'Show only main sections'}
          >
            {showOnlyParents ? 'Show All' : 'Main Only'}
          </button>
        </div>
      </div>
      <div className="menu-tree">
        {getDisplayItems().map(item => renderMenuItem(item))}
      </div>
    </div>
  );
};

export default DynamicMenu;
