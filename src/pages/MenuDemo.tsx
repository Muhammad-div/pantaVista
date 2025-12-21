import React, { useState } from 'react';
import { useAppInit } from '../contexts/AppInitContext';
import { useTextService } from '../services/textService';
import { useMenuService } from '../services/menuService';
import { useTooltipService } from '../services/tooltipService';
import DynamicMenu from '../components/DynamicMenu';
import type { APIMenuItem } from '../types/appInit';
import './MenuDemo.css';

const MenuDemo: React.FC = () => {
  const { menuItems, uiTexts, loading, error, initialized } = useAppInit();
  const textService = useTextService();
  const menuService = useMenuService();
  const tooltipService = useTooltipService();
  const [selectedMenuItem, setSelectedMenuItem] = useState<APIMenuItem | null>(null);
  const [textSearch, setTextSearch] = useState('');

  const handleMenuItemClick = (item: APIMenuItem) => {
    console.log('Menu item clicked:', item);
    setSelectedMenuItem(item);
  };

  const getFilteredTexts = () => {
    if (!textSearch.trim()) {
      return uiTexts.slice(0, 20); // Show first 20 by default
    }
    
    const searchTerm = textSearch.toLowerCase();
    return uiTexts.filter(text => 
      text.name.toLowerCase().includes(searchTerm) ||
      text.caption.toLowerCase().includes(searchTerm)
    ).slice(0, 50); // Limit to 50 results
  };

  if (loading) {
    return (
      <div className="menu-demo loading">
        <div className="loading-message">
          <h2>Loading App Initialization Data...</h2>
          <p>Fetching menu items and UI texts from GET_APP_INIT API...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-demo error">
        <div className="error-message">
          <h2>Failed to Load App Data</h2>
          <p>Error: {error}</p>
          <p>Please check your authentication and try again.</p>
        </div>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div className="menu-demo not-initialized">
        <div className="not-initialized-message">
          <h2>App Not Initialized</h2>
          <p>Please log in to load app initialization data.</p>
        </div>
      </div>
    );
  }

  const stats = textService.getStats();
  const filteredTexts = getFilteredTexts();
  const menuStats = menuService.isInitialized() ? menuService.getMenuStats() : null;
  const rootMenuItems = menuService.isInitialized() ? menuService.getRootMenuItems() : [];
  const menuCategories = menuService.isInitialized() ? menuService.getMenuCategories() : [];
  const tooltipAnalysis = tooltipService.isInitialized() ? tooltipService.categorizeTooltips() : null;
  const tooltipStats = tooltipService.isInitialized() ? tooltipService.getTooltipStats() : null;
  const mainNavTooltips = tooltipService.isInitialized() ? tooltipService.getMainNavigationTooltips() : [];

  return (
    <div className="menu-demo">
      <div className="demo-header">
        <h1>Menu & Text Data Demo</h1>
        <p>Dynamic menu and localization data from GET_APP_INIT API</p>
      </div>

      <div className="demo-stats">
        <div className="stat">
          <span className="stat-value">{menuItems.length}</span>
          <span className="stat-label">Total Menu Items</span>
        </div>
        <div className="stat">
          <span className="stat-value">{menuStats?.parentItems || 0}</span>
          <span className="stat-label">Main Sections</span>
        </div>
        <div className="stat">
          <span className="stat-value">{menuStats?.flyoutItems || 0}</span>
          <span className="stat-label">Flyout Items</span>
        </div>
        <div className="stat">
          <span className="stat-value">{uiTexts.length}</span>
          <span className="stat-label">UI Texts</span>
        </div>
        <div className="stat">
          <span className="stat-value">{menuStats?.maxDepth || 0}</span>
          <span className="stat-label">Max Menu Depth</span>
        </div>
      </div>

      {/* Enhanced Menu Analysis */}
      {menuStats && (
        <div className="menu-analysis">
          <h3>Menu Structure Analysis</h3>
          <div className="analysis-grid">
            <div className="analysis-item">
              <strong>Main Sections (PARENT):</strong> {menuStats.parentItems}
            </div>
            <div className="analysis-item">
              <strong>Flyout Menus:</strong> {menuStats.flyoutItems}
            </div>
            <div className="analysis-item">
              <strong>Context Menus:</strong> {menuStats.contextItems}
            </div>
            <div className="analysis-item">
              <strong>Sub Menus:</strong> {menuStats.subItems}
            </div>
            <div className="analysis-item">
              <strong>Action Items:</strong> {menuStats.actionItems}
            </div>
            <div className="analysis-item">
              <strong>Spacer Items:</strong> {menuStats.spacerItems}
            </div>
          </div>
        </div>
      )}

      {/* Root Menu Items Preview */}
      {rootMenuItems.length > 0 && (
        <div className="root-menu-preview">
          <h3>Main Navigation Items ({rootMenuItems.length})</h3>
          <div className="root-items-grid">
            {rootMenuItems.map(item => (
              <div key={item.id} className="root-item-card">
                <div className="root-item-header">
                  <strong>{item.caption}</strong>
                  <span className="sort-order">#{item.sortOrder}</span>
                </div>
                <div className="root-item-details">
                  <div>Route: {item.route || '/development'}</div>
                  <div>Children: {item.children.length}</div>
                  <div>Interaction: {item.interactionId}</div>
                  {item.tooltip && <div className="tooltip-text">"{item.tooltip}"</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="demo-content">
        {/* Menu Section */}
        <div className="demo-section menu-section">
          <h2>Dynamic Menu</h2>
          <div className="menu-container">
            <DynamicMenu
              menuItems={menuItems}
              uiTexts={uiTexts}
              onMenuItemClick={handleMenuItemClick}
              className="demo-menu"
            />
          </div>
          
          {selectedMenuItem && (
            <div className="selected-item">
              <h3>Selected Menu Item</h3>
              <div className="item-details">
                <div className="detail">
                  <strong>Caption:</strong> {selectedMenuItem.caption}
                </div>
                <div className="detail">
                  <strong>Action:</strong> {selectedMenuItem.action || 'None'}
                </div>
                <div className="detail">
                  <strong>Type:</strong> {selectedMenuItem.menuType}
                </div>
                <div className="detail">
                  <strong>Interaction ID:</strong> {selectedMenuItem.interactionId || 'None'}
                </div>
                {selectedMenuItem.tooltip && (
                  <div className="detail">
                    <strong>Tooltip:</strong> {selectedMenuItem.tooltip}
                  </div>
                )}
                <div className="detail">
                  <strong>Parent ID:</strong> {selectedMenuItem.parentId || 'Root'}
                </div>
                <div className="detail">
                  <strong>Sort Order:</strong> {selectedMenuItem.sortOrder}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Text Data Section */}
        <div className="demo-section text-section">
          <h2>UI Text Data</h2>
          
          <div className="text-search">
            <input
              type="text"
              placeholder="Search texts by name or content..."
              value={textSearch}
              onChange={(e) => setTextSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="text-categories">
            <div className="category">
              <h4>Window Titles ({stats.windowTitles})</h4>
              {textService.getWindowTitles().slice(0, 5).map(item => (
                <div key={item.key} className="text-item">
                  <span className="text-key">{item.key}:</span>
                  <span className="text-value">{item.title}</span>
                </div>
              ))}
            </div>
            
            <div className="category">
              <h4>Labels ({stats.labels})</h4>
              {textService.getLabels().slice(0, 5).map(item => (
                <div key={item.key} className="text-item">
                  <span className="text-key">{item.key}:</span>
                  <span className="text-value">{item.label}</span>
                </div>
              ))}
            </div>
            
            <div className="category">
              <h4>Messages ({stats.messages})</h4>
              {textService.getMessages().slice(0, 3).map(item => (
                <div key={item.key} className="text-item">
                  <span className="text-key">{item.key}:</span>
                  <span className="text-value">{item.message}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="all-texts">
            <h4>All Texts ({textSearch ? 'Filtered' : 'First 20'})</h4>
            <div className="texts-list">
              {filteredTexts.map(text => (
                <div key={text.key} className="text-item">
                  <div className="text-name">{text.name}</div>
                  <div className="text-caption">{text.caption}</div>
                </div>
              ))}
            </div>
            {uiTexts.length > 20 && !textSearch && (
              <p className="show-more">Showing first 20 of {uiTexts.length} texts. Use search to find specific texts.</p>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip Analysis */}
      {tooltipAnalysis && (
        <div className="demo-section tooltip-section">
          <h2>Menu Tooltips Analysis</h2>
          
          <div className="tooltip-stats">
            <div className="tooltip-stat">
              <span className="stat-value">{tooltipAnalysis.totalTooltips}</span>
              <span className="stat-label">Total Tooltips</span>
            </div>
            <div className="tooltip-stat">
              <span className="stat-value">{tooltipAnalysis.uniqueTooltips.length}</span>
              <span className="stat-label">Unique Tooltips</span>
            </div>
            <div className="tooltip-stat">
              <span className="stat-value">{tooltipAnalysis.spacerCount}</span>
              <span className="stat-label">Spacer Items</span>
            </div>
            <div className="tooltip-stat">
              <span className="stat-value">{tooltipStats?.averageTooltipLength || 0}</span>
              <span className="stat-label">Avg Length</span>
            </div>
          </div>

          <div className="tooltip-categories">
            <h4>Tooltip Categories</h4>
            {tooltipAnalysis.categories.map(category => (
              <div key={category.name} className="tooltip-category">
                <div className="category-header">
                  <strong>{category.name}</strong>
                  <span className="category-count">({category.count})</span>
                </div>
                <div className="category-description">{category.description}</div>
                <div className="category-examples">
                  <strong>Examples:</strong>
                  {category.examples.map((example, index) => (
                    <div key={index} className="example-tooltip">"{example}"</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="main-nav-tooltips">
            <h4>Main Navigation Tooltips (in sort order)</h4>
            <div className="nav-tooltips-grid">
              {mainNavTooltips.map((item, index) => (
                <div key={index} className="nav-tooltip-item">
                  <div className="nav-tooltip-header">
                    <strong>{item.caption}</strong>
                    <span className="sort-badge">#{item.sortOrder}</span>
                  </div>
                  <div className="nav-tooltip-text">"{item.tooltip}"</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Text Service Examples */}
      <div className="demo-section examples-section">
        <h2>Text Service Examples</h2>
        
        <div className="example">
          <h4>Get Text Example</h4>
          <code>textService.getText('WINDOW.TITLE')</code>
          <div className="result">
            Result: "{textService.getText('WINDOW.TITLE', 'Default Title')}"
          </div>
        </div>

        <div className="example">
          <h4>Delete Confirmation Message</h4>
          <code>textService.getDeleteConfirmation('John Doe')</code>
          <div className="result">
            Result: "{textService.getDeleteConfirmation('John Doe')}"
          </div>
        </div>

        <div className="example">
          <h4>Communication Channel Tooltip</h4>
          <code>textService.getCommChannelTooltip('GREEN', true, params)</code>
          <div className="result">
            Result: "{textService.getCommChannelTooltip('GREEN', true, {
              comData: 'email@example.com',
              comChannel: 'EMAIL',
              startDate: '2024-01-01'
            })}"
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuDemo;
