/**
 * Image Service for managing dynamic images from GET_APP_INIT API response
 * Extracts and caches images from UI.IMAGE.DATA entity
 */

import { findElements, findElement, getAttribute, getTextContent } from '../utils/xmlParser';

export interface UIImageItem {
  identifier: string;
  imageData: string; // Base64 encoded image data
  dataUrl: string; // Data URL format for use in src attributes
  key?: string;
  keyVersion?: string;
}

export interface UIImages {
  // Logos
  logo?: UIImageItem;
  logoOrg?: UIImageItem; // Organization logo
  pantavistaLogo?: UIImageItem;
  
  // Menu icons
  logoutIcon?: UIImageItem;
  settingsIcon?: UIImageItem;
  posIcon?: UIImageItem;
  supplierIcon?: UIImageItem;
  organisationIcon?: UIImageItem;
  multiOmIcon?: UIImageItem;
  orgamemberIcon?: UIImageItem;
  activityIcon?: UIImageItem;
  userIcon?: UIImageItem;
  productIcon?: UIImageItem;
  regionAgencyIcon?: UIImageItem;
  commChannelIcon?: UIImageItem;
  distributiveChannelIcon?: UIImageItem;
  targetIcon?: UIImageItem;
  targetGroupIcon?: UIImageItem;
  reportFilterIcon?: UIImageItem;
  documentAccessIcon?: UIImageItem;
  dashboardContactsIcon?: UIImageItem;
  dashboardSettingsIcon?: UIImageItem;
  ownProfileIcon?: UIImageItem;
  activityInputIcon?: UIImageItem;
  salesReportIcon?: UIImageItem;
  proxyIcon?: UIImageItem;
  contractIcon?: UIImageItem;
  documentsIcon?: UIImageItem;
  eventsIcon?: UIImageItem;
  allocationIcon?: UIImageItem;
  securityIcon?: UIImageItem;
  
  // Action icons
  editIcon?: UIImageItem;
  copyIcon?: UIImageItem;
  plusIcon?: UIImageItem;
  minusIcon?: UIImageItem;
  arrowUpIcon?: UIImageItem;
  arrowDownIcon?: UIImageItem;
  infoIcon?: UIImageItem;
  errorIcon?: UIImageItem;
  warningIcon?: UIImageItem;
  pdfIcon?: UIImageItem;
  mapIcon?: UIImageItem;
  mailIcon?: UIImageItem;
  smsIcon?: UIImageItem;
  
  // Placeholders
  placeholderPos?: UIImageItem;
  placeholderSupplier?: UIImageItem;
  placeholderAgency?: UIImageItem;
  placeholderMale?: UIImageItem;
  placeholderFemale?: UIImageItem;
  
  // Window icons
  windowCalendarIcon?: UIImageItem;
  windowConfigIcon?: UIImageItem;
  windowDeleteIcon?: UIImageItem;
  windowEditIcon?: UIImageItem;
  windowExportIcon?: UIImageItem;
  windowListIcon?: UIImageItem;
  windowNewIcon?: UIImageItem;
  windowPrintIcon?: UIImageItem;
  windowSaveIcon?: UIImageItem;
  windowReportIcon?: UIImageItem;
  
  // Allow any other icon identifiers
  [key: string]: UIImageItem | undefined;
}

class ImageService {
  private images: UIImages = {};
  private initialized: boolean = false;

  /**
   * Initialize the image service with UI.IMAGE.DATA from GET_APP_INIT
   */
  initialize(doc: Document): void {
    console.log('ImageService: Initializing with GET_APP_INIT response...');
    this.images = {};
    
    try {
      // Find the UI.IMAGE.DATA entity
      const entities = findElements(doc, 'ENTITY');
      const imageDataEntity = entities.find(
        (entity) => getAttribute(entity, 'NAME') === 'UI.IMAGE.DATA'
      );
      
      if (!imageDataEntity) {
        console.warn('ImageService: UI.IMAGE.DATA entity not found in response');
        this.initialized = true;
        return;
      }
      
      console.log('ImageService: Found UI.IMAGE.DATA entity, extracting images...');
      const imageSets = findElements(imageDataEntity, 'SET');
      
      imageSets.forEach((set) => {
        const attributeGroups = findElements(set, 'ATTRIBUTEGROUP');
        const imageItemGroup = attributeGroups.find(
          (group) => getAttribute(group, 'NAME') === 'UI.IMAGE.ITEM'
        );
        
        if (imageItemGroup) {
          const imageIdentifierEl = findElement(imageItemGroup, 'IMAGE_IDENTIFIER');
          const imageEl = findElement(imageItemGroup, 'IMAGE');
          
          if (imageIdentifierEl && imageEl) {
            const identifier = getTextContent(imageIdentifierEl);
            const imageData = getTextContent(imageEl);
            const key = getAttribute(imageItemGroup, 'KEY');
            const keyVersion = getAttribute(imageItemGroup, 'KEYVERSION');
            
            if (imageData && imageData.trim() && imageData !== 'base64_data') {
              // Skip placeholder text "base64_data"
              // Create data URL
              const dataUrl = `data:image/png;base64,${imageData}`;
              
              const imageItem: UIImageItem = {
                identifier,
                imageData,
                dataUrl,
                key: key || undefined,
                keyVersion: keyVersion || undefined,
              };
              
              // Map identifiers to standardized keys
              this.mapImageItem(identifier, imageItem);
              
              console.log(`ImageService: Processed image ${identifier} (${Math.round(imageData.length / 1024)}KB)`);
            } else if (imageData === 'base64_data') {
              console.log(`ImageService: Skipping placeholder image ${identifier}`);
            }
          }
        }
      });
      
      console.log('ImageService: Initialized with', Object.keys(this.images).length, 'images');
      console.log('ImageService: Available images:', Object.keys(this.images));
      this.initialized = true;
      
    } catch (error) {
      console.error('ImageService: Error during initialization:', error);
      this.initialized = true; // Mark as initialized even on error to prevent retry loops
    }
  }
  
  /**
   * Map image identifiers from API to standardized keys
   */
  private mapImageItem(identifier: string, imageItem: UIImageItem): void {
    // Store with original identifier as key for flexibility
    this.images[identifier] = imageItem;
    
    // Also store with standardized keys for easy access
    switch (identifier) {
      // Logo mappings - prioritize Pantavista logo
      case 'ICON:PANTAVISTA':
        this.images.logo = imageItem;
        this.images.pantavistaLogo = imageItem;
        break;
        
      case 'PLACEHOLDER:LOGO':
      case 'ICON:LOGO':
        if (!this.images.logo) {
          this.images.logo = imageItem;
        }
        break;
        
      case 'SYSOWNER_ORGA_LOGO':
        this.images.logoOrg = imageItem;
        if (!this.images.logo) {
          this.images.logo = imageItem;
        }
        break;
        
      // Menu icons
      case 'ICON:LOGOUT':
        this.images.logoutIcon = imageItem;
        break;
        
      case 'ICON:SETTINGS':
        this.images.settingsIcon = imageItem;
        break;
        
      case 'ICON:POS':
        this.images.posIcon = imageItem;
        break;
        
      case 'ICON:SUPPLIER':
        this.images.supplierIcon = imageItem;
        break;
        
      case 'ICON:ORGANISATION':
        this.images.organisationIcon = imageItem;
        break;
        
      case 'ICON:MULTI_OM':
        this.images.multiOmIcon = imageItem;
        break;
        
      case 'ICON:ORGAMEMBER':
        this.images.orgamemberIcon = imageItem;
        break;
        
      case 'ICON:ACTIVITY':
        this.images.activityIcon = imageItem;
        break;
        
      case 'ICON:USER':
        this.images.userIcon = imageItem;
        break;
        
      case 'ICON:EDIT':
        this.images.editIcon = imageItem;
        break;
        
      case 'ICON:COPY':
        this.images.copyIcon = imageItem;
        break;
        
      case 'ICON:PLUS':
        this.images.plusIcon = imageItem;
        break;
        
      case 'ICON:MINUS':
        this.images.minusIcon = imageItem;
        break;
        
      case 'ICON:ARROW_UP':
        this.images.arrowUpIcon = imageItem;
        break;
        
      case 'ICON:ARROW_DOWN':
        this.images.arrowDownIcon = imageItem;
        break;
        
      case 'ICON:INFO':
        this.images.infoIcon = imageItem;
        break;
        
      case 'ICON:ERROR':
        this.images.errorIcon = imageItem;
        break;
        
      case 'ICON:WARNING':
        this.images.warningIcon = imageItem;
        break;
        
      case 'ICON:PDF':
        this.images.pdfIcon = imageItem;
        break;
        
      case 'ICON:MAP':
        this.images.mapIcon = imageItem;
        break;
        
      case 'ICON:MAIL':
        this.images.mailIcon = imageItem;
        break;
        
      case 'ICON:SMS':
        this.images.smsIcon = imageItem;
        break;
        
      case 'ICON:PRODUCT':
        this.images.productIcon = imageItem;
        break;
        
      case 'ICON:ALLOCATION':
        this.images.allocationIcon = imageItem;
        break;
        
      case 'ICON:SECURITY':
        this.images.securityIcon = imageItem;
        break;
        
      case 'ICON:REGION_AGENCY':
        this.images.regionAgencyIcon = imageItem;
        break;
        
      case 'ICON:COMMCHANNEL':
        this.images.commChannelIcon = imageItem;
        break;
        
      case 'ICON:DISTRIBUTIVECHANNEL':
        this.images.distributiveChannelIcon = imageItem;
        break;
        
      case 'ICON:TARGET':
        this.images.targetIcon = imageItem;
        break;
        
      case 'ICON:TARGETGROUP':
        this.images.targetGroupIcon = imageItem;
        break;
        
      case 'ICON:REPORT_FILTER':
        this.images.reportFilterIcon = imageItem;
        break;
        
      case 'ICON:DOCUMENT_ACCESS':
        this.images.documentAccessIcon = imageItem;
        break;
        
      case 'ICON:DASHBOARD_CONTACTS':
        this.images.dashboardContactsIcon = imageItem;
        break;
        
      case 'ICON:DASHBOARD_SETTINGS':
        this.images.dashboardSettingsIcon = imageItem;
        break;
        
      case 'ICON:OWN_PROFILE':
        this.images.ownProfileIcon = imageItem;
        break;
        
      case 'ICON:ACTIVITY_INPUT':
        this.images.activityInputIcon = imageItem;
        break;
        
      case 'ICON:SALES_REPORT':
        this.images.salesReportIcon = imageItem;
        break;
        
      case 'ICON:PROXY':
        this.images.proxyIcon = imageItem;
        break;
        
      case 'ICON:CONTRACT':
        this.images.contractIcon = imageItem;
        break;
        
      case 'ICON:DOCUMENTS2':
        this.images.documentsIcon = imageItem;
        break;
        
      case 'ICON:EVENTS2':
        this.images.eventsIcon = imageItem;
        break;
        
      // Placeholders
      case 'PLACEHOLDER:POS':
        this.images.placeholderPos = imageItem;
        break;
        
      case 'PLACEHOLDER:SUPPLIER':
        this.images.placeholderSupplier = imageItem;
        break;
        
      case 'PLACEHOLDER:AGENCY':
        this.images.placeholderAgency = imageItem;
        break;
        
      case 'PLACEHOLDER:MALE':
        this.images.placeholderMale = imageItem;
        break;
        
      case 'PLACEHOLDER:FEMALE':
        this.images.placeholderFemale = imageItem;
        break;
        
      // Window icons
      case 'WINDOW.ICON:CALENDAR':
        this.images.windowCalendarIcon = imageItem;
        break;
        
      case 'WINDOW.ICON:CONFIG':
        this.images.windowConfigIcon = imageItem;
        break;
        
      case 'WINDOW.ICON:DELETE':
        this.images.windowDeleteIcon = imageItem;
        break;
        
      case 'WINDOW.ICON:EDIT':
        this.images.windowEditIcon = imageItem;
        break;
        
      case 'WINDOW.ICON:EXPORT':
        this.images.windowExportIcon = imageItem;
        break;
        
      case 'WINDOW.ICON:LIST':
        this.images.windowListIcon = imageItem;
        break;
        
      case 'WINDOW.ICON:NEW':
        this.images.windowNewIcon = imageItem;
        break;
        
      case 'WINDOW.ICON:PRINT':
        this.images.windowPrintIcon = imageItem;
        break;
        
      case 'WINDOW.ICON:SAVE':
        this.images.windowSaveIcon = imageItem;
        break;
        
      case 'WINDOW.ICON:REPORT':
        this.images.windowReportIcon = imageItem;
        break;
        
      default:
        // Store with lowercased version for easier access
        const key = identifier.toLowerCase().replace(/[:\s]/g, '_');
        this.images[key] = imageItem;
        break;
    }
  }
  
  /**
   * Get image by identifier or standardized key
   */
  getImage(key: string): UIImageItem | null {
    const image = this.images[key];
    if (image) {
      return image;
    }
    
    // Try with different variations of the key
    const variations = [
      key.toUpperCase(),
      key.toLowerCase(),
      `ICON:${key.toUpperCase()}`,
      `PLACEHOLDER:${key.toUpperCase()}`,
      key.replace(/[_\s]/g, ':').toUpperCase(),
    ];
    
    for (const variation of variations) {
      const found = this.images[variation];
      if (found) {
        return found;
      }
    }
    
    return null;
  }
  
  /**
   * Get image data URL by key
   */
  getImageUrl(key: string): string | null {
    const image = this.getImage(key);
    return image?.dataUrl || null;
  }
  
  /**
   * Get logo image (prioritizes ICON:PANTAVISTA, then PLACEHOLDER:LOGO, falls back to SYSOWNER_ORGA_LOGO)
   */
  getLogo(): UIImageItem | null {
    return this.images.logo || this.images.logoOrg || null;
  }
  
  /**
   * Get logo URL for use in img src attributes
   * Prioritizes: SYSOWNER_ORGA_LOGO > ICON:PANTAVISTA > PLACEHOLDER:LOGO
   */
  getLogoUrl(): string | null {
    // First try SYSOWNER_ORGA_LOGO (organization logo from API)
    const orgLogo = this.images.logoOrg || this.getImage('SYSOWNER_ORGA_LOGO');
    if (orgLogo) {
      return orgLogo.dataUrl;
    }
    
    // Then try Pantavista logo
    const pantavistaLogo = this.images.pantavistaLogo || this.getImage('ICON:PANTAVISTA');
    if (pantavistaLogo) {
      return pantavistaLogo.dataUrl;
    }
    
    // Finally try general logo
    const logo = this.getLogo();
    return logo?.dataUrl || null;
  }
  
  /**
   * Get logout icon URL
   */
  getLogoutIconUrl(): string | null {
    const logoutIcon = this.images.logoutIcon || this.getImage('ICON:LOGOUT');
    return logoutIcon?.dataUrl || null;
  }
  
  /**
   * Get POS icon URL
   */
  getPosIconUrl(): string | null {
    const posIcon = this.images.posIcon || this.getImage('ICON:POS');
    return posIcon?.dataUrl || null;
  }
  
  /**
   * Get icon for menu items by caption, action, interaction ID, or type
   */
  getMenuIcon(action: string | undefined, caption?: string, interactionId?: string): string | null {
    // Check if service is initialized
    if (!this.initialized) {
      console.warn('ImageService: getMenuIcon called before initialization');
      return null;
    }
    
    // First, try to match by caption (most reliable)
    if (caption) {
      // Normalize caption: lowercase, trim, replace multiple spaces with single space
      const captionLower = caption.toLowerCase().trim().replace(/\s+/g, ' ');
      console.log('ImageService: getMenuIcon - searching for caption:', captionLower, 'action:', action, 'interactionId:', interactionId);
      
      // Map captions to icon identifiers
      const captionMappings: { [key: string]: string } = {
        // Points of Sale
        'points-of-sale': 'ICON:POS',
        'point-of-sale': 'ICON:POS',
        'points of sale': 'ICON:POS',
        'pos': 'ICON:POS',
        
        // Suppliers
        'suppliers': 'ICON:SUPPLIER',
        'supplier': 'ICON:SUPPLIER',
        
        // Organisation
        'organisation': 'ICON:ORGANISATION',
        'organization': 'ICON:ORGANISATION',
        'organisations': 'ICON:ORGANISATION',
        'organizations': 'ICON:ORGANISATION',
        
        // Activity
        'activities': 'ICON:ACTIVITY',
        'activity': 'ICON:ACTIVITY',
        'agenda': 'ICON:ACTIVITY',
        'daily agenda': 'ICON:ACTIVITY',
        
        // Settings
        'settings': 'ICON:SETTINGS',
        'setting': 'ICON:SETTINGS',
        
        // Exchange Data
        'exchange data': 'ICON:SETTINGS',
        'exchange': 'ICON:SETTINGS',
        
        // Regions/Agency
        'regions': 'ICON:REGION_AGENCY',
        'region': 'ICON:REGION_AGENCY',
        'agency': 'ICON:REGION_AGENCY',
        'agencies': 'ICON:REGION_AGENCY',
        
        // Products
        'products': 'ICON:PRODUCT',
        'product': 'ICON:PRODUCT',
        
        // Documents
        'documents': 'ICON:DOCUMENTS2',
        'document': 'ICON:DOCUMENTS2',
        
        // Persons/Users
        'persons': 'ICON:USER',
        'person': 'ICON:USER',
        'users': 'ICON:USER',
        'user': 'ICON:USER',
        
        // Transactions
        'transactions': 'ICON:CONTRACT',
        'transaction': 'ICON:CONTRACT',
        
        // Pantaree
        'pantaree': 'ICON:PANTAVISTA',
        'pantavista': 'ICON:PANTAVISTA',
        
        // Logout
        'logout': 'ICON:LOGOUT',
        'log out': 'ICON:LOGOUT',
      };
      
      // Try exact match first
      if (captionMappings[captionLower]) {
        const iconId = captionMappings[captionLower];
        console.log('ImageService: Found caption mapping:', captionLower, '→', iconId);
        const icon = this.getImage(iconId);
        if (icon) {
          console.log('ImageService: Successfully retrieved icon for', iconId);
          return icon.dataUrl;
        } else {
          console.warn('ImageService: Icon ID', iconId, 'not found in image cache');
        }
      }
      
      // Try partial matches
      for (const [key, iconId] of Object.entries(captionMappings)) {
        if (captionLower.includes(key) || key.includes(captionLower)) {
          console.log('ImageService: Found partial caption match:', key, '→', iconId);
          const icon = this.getImage(iconId);
          if (icon) {
            console.log('ImageService: Successfully retrieved icon for', iconId);
            return icon.dataUrl;
          }
        }
      }
      
      console.warn('ImageService: No caption match found for:', captionLower);
    }
    
    // Try by interaction ID
    if (interactionId) {
      const interactionLower = interactionId.toLowerCase();
      const interactionMappings: { [key: string]: string } = {
        'pos': 'ICON:POS',
        'supplier': 'ICON:SUPPLIER',
        'suppliers': 'ICON:SUPPLIER',
        'organisation': 'ICON:ORGANISATION',
        'organization': 'ICON:ORGANISATION',
        'activity': 'ICON:ACTIVITY',
        'activities': 'ICON:ACTIVITY',
        'agenda': 'ICON:ACTIVITY',
        'product': 'ICON:PRODUCT',
        'products': 'ICON:PRODUCT',
        'document': 'ICON:DOCUMENTS2',
        'documents': 'ICON:DOCUMENTS2',
        'region': 'ICON:REGION_AGENCY',
        'agency': 'ICON:REGION_AGENCY',
        'user': 'ICON:USER',
        'person': 'ICON:USER',
        'settings': 'ICON:SETTINGS',
      };
      
      for (const [key, iconId] of Object.entries(interactionMappings)) {
        if (interactionLower.includes(key)) {
          const icon = this.getImage(iconId);
          if (icon) {
            return icon.dataUrl;
          }
        }
      }
    }
    
    // Fallback to action-based mapping
    if (action) {
      const actionKey = action.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Map common menu actions to icon keys
      const iconMappings: { [key: string]: string } = {
        'logout': 'ICON:LOGOUT',
        'settings': 'ICON:SETTINGS',
        'pos': 'ICON:POS',
        'supplier': 'ICON:SUPPLIER',
        'suppliers': 'ICON:SUPPLIER',
        'organisation': 'ICON:ORGANISATION',
        'organization': 'ICON:ORGANISATION',
        'orgamember': 'ICON:ORGAMEMBER',
        'multiom': 'ICON:MULTI_OM',
        'activities': 'ICON:ACTIVITY',
        'activity': 'ICON:ACTIVITY',
        'agenda': 'ICON:ACTIVITY',
        'dailyagenda': 'ICON:ACTIVITY',
        'orders': 'ICON:SUPPLIER',
        'order': 'ICON:SUPPLIER',
        'exchangedata': 'ICON:SETTINGS',
        'exchange': 'ICON:SETTINGS',
        'user': 'ICON:USER',
        'profile': 'ICON:OWN_PROFILE',
        'ownprofile': 'ICON:OWN_PROFILE',
        'documents': 'ICON:DOCUMENTS2',
        'document': 'ICON:DOCUMENTS2',
        'products': 'ICON:PRODUCT',
        'product': 'ICON:PRODUCT',
        'regions': 'ICON:REGION_AGENCY',
        'region': 'ICON:REGION_AGENCY',
        'agency': 'ICON:REGION_AGENCY',
      };
      
      if (iconMappings[actionKey]) {
        const icon = this.getImage(iconMappings[actionKey]);
        if (icon) {
          return icon.dataUrl;
        }
      }
      
      // Try direct lookup with action (with ICON: prefix)
      const directImage = this.getImage(action) || this.getImage(`ICON:${action.toUpperCase()}`);
      if (directImage) {
        return directImage.dataUrl;
      }
    }
    
    return null;
  }
  
  /**
   * Get all available images
   */
  getAllImages(): UIImages {
    return { ...this.images };
  }
  
  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
  
  /**
   * Get total number of images loaded
   */
  getImageCount(): number {
    return Object.keys(this.images).length;
  }
  
  /**
   * Get all available image identifiers (for debugging)
   */
  getAvailableImageIdentifiers(): string[] {
    return Object.keys(this.images).filter(key => {
      const image = this.images[key];
      return image && typeof image === 'object' && image.identifier;
    }).map(key => {
      const image = this.images[key];
      return typeof image === 'object' && image.identifier ? image.identifier : key;
    });
  }
  
  /**
   * Clear all cached images
   */
  clear(): void {
    this.images = {};
    this.initialized = false;
    console.log('ImageService: Cleared all cached images');
  }
}

// Export singleton instance
export const imageService = new ImageService();
