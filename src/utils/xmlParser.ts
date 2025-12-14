/**
 * XML Parser utilities for handling backend XML responses
 */

export interface XMLMessage {
  name: string;
  version: string;
}

export interface XMLEnvelope {
  name: string;
  version: string;
  create?: string;
  envelopeData?: {
    token?: string;
    language?: string;
    ipAddress?: string;
    userAgent?: string;
  };
  messages: XMLMessage[];
}

/**
 * Parse XML string to DOM Document
 */
export function parseXML(xmlString: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');
  
  // Check for parsing errors
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`XML parsing error: ${parserError.textContent}`);
  }
  
  return doc;
}

/**
 * Get text content from XML element safely
 */
export function getTextContent(element: Element | null, defaultValue: string = ''): string {
  return element?.textContent?.trim() || defaultValue;
}

/**
 * Get attribute value from XML element safely
 */
export function getAttribute(element: Element | null, attributeName: string, defaultValue: string = ''): string {
  return element?.getAttribute(attributeName) || defaultValue;
}

/**
 * Find elements by tag name with optional parent
 */
export function findElements(
  parent: Document | Element,
  tagName: string
): Element[] {
  return Array.from(parent.getElementsByTagName(tagName));
}

/**
 * Find single element by tag name
 */
export function findElement(
  parent: Document | Element,
  tagName: string
): Element | null {
  const elements = parent.getElementsByTagName(tagName);
  return elements.length > 0 ? elements[0] : null;
}

/**
 * Extract message name from XML response
 */
export function getMessageName(doc: Document): string | null {
  const message = findElement(doc, 'MESSAGE');
  return message ? getAttribute(message, 'NAME') : null;
}

/**
 * Extract token from XML response
 */
export function getToken(doc: Document): string | null {
  const tokenElement = findElement(doc, 'TOKEN');
  return tokenElement ? getTextContent(tokenElement) : null;
}

/**
 * Extract language from XML response
 */
export function getLanguage(doc: Document): string | null {
  const languageElement = findElement(doc, 'LANGUAGE');
  return languageElement ? getTextContent(languageElement) : null;
}

/**
 * Extract user messages from XML response
 */
export interface UserMessage {
  name: string;
  criticalLevel: string;
  caption: string;
  description?: string;
}

export function getUserMessages(doc: Document): UserMessage[] {
  const messages: UserMessage[] = [];
  
  // Find all MESSAGEAREA elements
  const messageAreas = findElements(doc, 'MESSAGEAREA');
  
  // Find the USER_MESSAGES message area
  const userMessageArea = messageAreas.find(
    (area) => getAttribute(area, 'NAME') === 'USER_MESSAGES'
  );
  
  if (!userMessageArea) {
    return messages;
  }
  
  const msgElements = findElements(userMessageArea, 'MSG');
  
  msgElements.forEach((msg) => {
    const name = getAttribute(msg, 'NAME');
    const criticalLevel = getTextContent(findElement(msg, 'CRITICALLEVEL'));
    const caption = getTextContent(findElement(msg, 'CAPTION'));
    const description = getTextContent(findElement(msg, 'DESCRIPTION'));
    
    messages.push({
      name: name || '',
      criticalLevel,
      caption,
      description: description || undefined,
    });
  });
  
  return messages;
}

/**
 * Extract system messages from XML response
 */
export function getSystemMessages(doc: Document): UserMessage[] {
  const messages: UserMessage[] = [];
  
  // Find all MESSAGEAREA elements
  const messageAreas = findElements(doc, 'MESSAGEAREA');
  
  // Find the SYSTEM_MESSAGES message area
  const systemMessageArea = messageAreas.find(
    (area) => getAttribute(area, 'NAME') === 'SYSTEM_MESSAGES'
  );
  
  if (!systemMessageArea) {
    return messages;
  }
  
  const msgElements = findElements(systemMessageArea, 'MSG');
  
  msgElements.forEach((msg) => {
    const name = getAttribute(msg, 'NAME');
    const criticalLevel = getTextContent(findElement(msg, 'CRITICALLEVEL'));
    const caption = getTextContent(findElement(msg, 'CAPTION'));
    const description = getTextContent(findElement(msg, 'DESCRIPTION'));
    
    messages.push({
      name: name || '',
      criticalLevel,
      caption,
      description: description || undefined,
    });
  });
  
  return messages;
}

/**
 * Extract captions from PRE_APP_INIT response
 */
export interface PreAppInitCaptions {
  welcomePV?: string;
  welcomeInfo?: string;
  requestPassword?: string;
  login?: string;
  cancel?: string;
  ok?: string;
  sendPW?: string;
  requestPasswordHead?: string;
  requestPasswordSub?: string;
  noConnection?: string;
  retry?: string;
  usernameLabel?: string;
  passwordLabel?: string;
  forgotPasswordLabel?: string;
  usernameTooltip?: string;
  passwordTooltip?: string;
  forgotPasswordTooltip?: string;
  loginLogo?: string; // Base64 image data for login logo (data URL format)
}

export function extractPreAppInitCaptions(doc: Document): PreAppInitCaptions {
  const captions: PreAppInitCaptions = {};
  
  // Find the UI.TEXT.DATA entity within MESSAGEAREA NAME="UI.PRE_DATA"
  const messageArea = Array.from(doc.getElementsByTagName('MESSAGEAREA')).find(
    (area) => getAttribute(area, 'NAME') === 'UI.PRE_DATA'
  );
  
  if (!messageArea) {
    console.warn('extractPreAppInitCaptions: MESSAGEAREA UI.PRE_DATA not found');
    return captions;
  }
  
  // The actual data is in DATAFIELDS, not METAFIELDS
  // Find DATAFIELDS first, then look for ENTITY within it
  const dataFields = findElement(messageArea, 'DATAFIELDS');
  if (!dataFields) {
    console.warn('extractPreAppInitCaptions: DATAFIELDS not found');
    return captions;
  }
  
  // Find ENTITY NAME="UI.TEXT.DATA" within DATAFIELDS
  const entities = findElements(dataFields, 'ENTITY');
  const textDataEntity = entities.find(
    (entity) => getAttribute(entity, 'NAME') === 'UI.TEXT.DATA'
  );
  
  if (!textDataEntity) {
    console.warn('extractPreAppInitCaptions: ENTITY UI.TEXT.DATA not found in DATAFIELDS');
    return captions;
  }
  
  // Navigate through SETS -> SET -> ATTRIBUTEGROUP NAME="UI.TEXT.ITEM" -> CAPTION
  const sets = findElements(textDataEntity, 'SET');
  
  if (sets.length === 0) {
    console.warn('extractPreAppInitCaptions: No SET elements found');
    return captions;
  }
  
  sets.forEach((set) => {
    const attributeGroups = findElements(set, 'ATTRIBUTEGROUP');
    const textItemGroup = attributeGroups.find(
      (group) => getAttribute(group, 'NAME') === 'UI.TEXT.ITEM'
    );
    
    if (textItemGroup) {
      const captionElement = findElement(textItemGroup, 'CAPTION');
      if (captionElement) {
        const name = getAttribute(captionElement, 'NAME');
        const text = getTextContent(captionElement);
        
        // Map the actual NAME values from the XML response
        switch (name) {
          case 'TEXT.WELCOME.HEADER':
            captions.welcomePV = text;
            break;
          case 'TEXT.WELCOME.INFO':
            captions.welcomeInfo = text;
            break;
          case 'TEXT.WELCOME.TITLE':
            // This might be used for the login title
            if (!captions.login) {
              captions.login = text;
            }
            break;
          case 'BUTTON.LOGIN':
            captions.login = text;
            break;
          case 'BUTTON.RESEND':
            captions.sendPW = text;
            break;
          case 'LABEL.USER':
            captions.usernameLabel = text;
            break;
          case 'LABEL.PW':
            captions.passwordLabel = text;
            break;
          case 'LABEL.LOSTPW':
            captions.forgotPasswordLabel = text;
            break;
          case 'TOOLTIP.USER':
            captions.usernameTooltip = text;
            break;
          case 'TOOLTIP.PW':
            captions.passwordTooltip = text;
            break;
          case 'TOOLTIP.LOSTPW':
            captions.forgotPasswordTooltip = text;
            break;
          case 'TEXT.RESEND.HEADER':
            captions.requestPasswordHead = text;
            break;
          case 'TEXT.RESEND.INFO':
            captions.requestPasswordSub = text;
            break;
          case 'TEXT.RESEND.TITLE':
            captions.requestPassword = text;
            break;
        }
      }
    }
  });
  
  // Extract login logo from UI.IMAGE.DATA entity
  const imageDataEntity = entities.find(
    (entity) => getAttribute(entity, 'NAME') === 'UI.IMAGE.DATA'
  );
  
  if (imageDataEntity) {
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
          
          // Check if this is the login logo
          if (identifier === 'ICON:LOGIN' && imageData) {
            // Convert base64 to data URL
            captions.loginLogo = `data:image/png;base64,${imageData}`;
            console.log('extractPreAppInitCaptions: Found login logo');
          }
        }
      }
    });
  }
  
  console.log('extractPreAppInitCaptions result:', captions);
  return captions;
}

/**
 * Extract login template fields
 */
export interface LoginTemplateField {
  name: string;
  caption: string;
  editHint: string;
  mustFill: boolean;
  maxLength?: number;
  dataType?: string;
}

export function extractLoginTemplate(doc: Document): {
  username?: LoginTemplateField;
  password?: LoginTemplateField;
} {
  const fields: {
    username?: LoginTemplateField;
    password?: LoginTemplateField;
  } = {};
  
  // Find MESSAGEAREA NAME="INTERACTIONUSER.LOGIN" first
  const messageArea = Array.from(doc.getElementsByTagName('MESSAGEAREA')).find(
    (area) => getAttribute(area, 'NAME') === 'INTERACTIONUSER.LOGIN'
  );
  
  if (!messageArea) {
    console.warn('extractLoginTemplate: MESSAGEAREA INTERACTIONUSER.LOGIN not found');
    return fields;
  }
  
  // Find fields within METAFIELDS -> ENTITIES -> ENTITY NAME="LOGINDATA"
  const fieldElements = findElements(messageArea, 'FIELD');
  console.log('extractLoginTemplate: Found', fieldElements.length, 'field elements');
  
  fieldElements.forEach((field) => {
    const name = getAttribute(field, 'NAME');
    const caption = getTextContent(findElement(field, 'CAPTION'));
    const editHint = getTextContent(findElement(field, 'EDITHINT'));
    const mustFill = getTextContent(findElement(field, 'MUSTFILL')) === 'MUSTFILL:TRUE';
    const maxLengthStr = getTextContent(findElement(field, 'MAXLENGTH'));
    const maxLength = maxLengthStr ? parseInt(maxLengthStr, 10) : undefined;
    const dataType = getTextContent(findElement(field, 'DATATYPE'));
    
    const fieldData: LoginTemplateField = {
      name: name || '',
      caption,
      editHint,
      mustFill,
      maxLength,
      dataType: dataType || undefined,
    };
    
    if (name === 'USERNAME') {
      fields.username = fieldData;
    } else if (name === 'PASSWORD') {
      fields.password = fieldData;
    }
  });
  
  console.log('extractLoginTemplate result:', fields);
  return fields;
}

/**
 * Extract login confirmation data
 */
export interface LoginConfirmation {
  token: string;
  language: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  accessRight?: string;
  orgRole?: string;
  userRoles?: string[];
  isSupplier?: boolean; // True if user has ORGANISATION_ROLE:SUPPLIER
}

export function extractLoginConfirmation(doc: Document): LoginConfirmation | null {
  const token = getToken(doc);
  const language = getLanguage(doc);
  
  // Token might be empty for failed logins, but we still want to extract user data if available
  // However, if there's no token and no user data, return null
  if (!token || token.trim() === '') {
    // Check if there's any user data - if not, this is likely a failed login
    const entities = findElements(doc, 'ENTITY');
    const loginEntity = entities.find(
      (entity) => getAttribute(entity, 'NAME') === 'T.LOGINCONFIRMATION' || 
                  getAttribute(entity, 'NAME') === 'LOGINCONFIRMATION'
    );
    
    // If no login entity found, definitely a failed login
    if (!loginEntity) {
      return null;
    }
    
    // Even if token is empty, we might have user data structure (for failed logins with partial data)
    // But we should return null if token is truly missing
    return null;
  }
  
  const confirmation: LoginConfirmation = {
    token,
    language: language || '',
  };
  
  // Find T.LOGINCONFIRMATION or LOGINCONFIRMATION entity
  const entities = findElements(doc, 'ENTITY');
  const loginEntity = entities.find(
    (entity) => getAttribute(entity, 'NAME') === 'T.LOGINCONFIRMATION' || 
                getAttribute(entity, 'NAME') === 'LOGINCONFIRMATION'
  );
  
  if (loginEntity) {
    // Find all ATTRIBUTEGROUP elements within the SETS
    const sets = findElements(loginEntity, 'SET');
    if (sets.length > 0) {
      const attributeGroups = findElements(sets[0], 'ATTRIBUTEGROUP');
      
      attributeGroups.forEach((group) => {
        const groupName = getAttribute(group, 'NAME');
        
        if (groupName === 'USERDATA') {
          confirmation.username = getTextContent(findElement(group, 'USERNAME'));
          const accessRightEl = findElement(group, 'ACCESSRIGHT_USER');
          if (accessRightEl) {
            confirmation.accessRight = getAttribute(accessRightEl, 'SYSNAME');
          }
        } else if (groupName === 'USERADR') {
          confirmation.firstName = getTextContent(findElement(group, 'FIRSTNAME'));
          confirmation.lastName = getTextContent(findElement(group, 'LASTNAME'));
          // Try to get display name from ORGA_DISPLAYNAME or construct from first/last name
          const orgaDisplayName = getTextContent(findElement(group, 'ORGA_DISPLAYNAME'));
          if (confirmation.firstName && confirmation.lastName) {
            confirmation.displayName = `${confirmation.lastName}, ${confirmation.firstName}`;
          } else if (orgaDisplayName) {
            confirmation.displayName = orgaDisplayName;
          }
        } else if (groupName === 'ORGAROLE') {
          const orgRoleEl = findElement(group, 'ORGAROLE');
          if (orgRoleEl) {
            confirmation.orgRole = getAttribute(orgRoleEl, 'SYSNAME');
            // Check if user is supplier
            const orgRoleSysname = getAttribute(orgRoleEl, 'SYSNAME');
            if (orgRoleSysname === 'ORGANISATION_ROLE:SUPPLIER') {
              // Store supplier flag for menu permissions
              confirmation.isSupplier = true;
            }
          }
        }
      });
    }
  }
  
  // Extract user roles from USERROLES entity
  const userRolesEntity = entities.find((entity) => getAttribute(entity, 'NAME') === 'USERROLES');
  if (userRolesEntity) {
    const sets = findElements(userRolesEntity, 'SET');
    if (sets.length > 0) {
      const userRoleElements = findElements(sets[0], 'USERROLE');
      if (userRoleElements.length > 0) {
        confirmation.userRoles = userRoleElements.map((el) => {
          const sysname = getAttribute(el, 'SYSNAME');
          return sysname || getTextContent(el);
        });
      }
    }
  }
  
  return confirmation;
}

/**
 * Extract supplier list from GET_SUPPLIER_LIST response
 */
export interface Supplier {
  id: string;
  key: string;
  shortName: string;
  supplierNo?: string;
  displayName?: string;
  street?: string;
  zipCode?: string;
  city?: string;
  phoneNumber?: string;
  accessRight?: string;
}

export function extractSupplierList(doc: Document): Supplier[] {
  const suppliers: Supplier[] = [];
  
  // Find MESSAGEAREA first, then look for ENTITY within DATAFIELDS
  const messageAreas = findElements(doc, 'MESSAGEAREA');
  let supplierEntity = null;
  
  // Look for supplier-related MESSAGEAREA (e.g., "T.SUP.LIST", "SUPPLIER.LIST")
  for (const messageArea of messageAreas) {
    const messageAreaName = getAttribute(messageArea, 'NAME');
    if (messageAreaName?.includes('SUPPLIER') || messageAreaName?.includes('SUP')) {
      const datafields = findElement(messageArea, 'DATAFIELDS');
      if (datafields) {
        const entities = findElements(datafields, 'ENTITY');
        supplierEntity = entities.find(
          (entity) => {
            const name = getAttribute(entity, 'NAME');
            return name === 'T.SUP.SMALL.LIST' || 
                   name === 'T.SUPPLIER.LIST' || 
                   name === 'T.SUP.LIST' ||
                   name === 'SUPPLIER.LIST' ||
                   (name?.includes('SUPPLIER') && name?.includes('LIST')) ||
                   (name?.includes('SUP') && name?.includes('LIST'));
          }
        );
        if (supplierEntity) break;
      }
    }
  }
  
  // Fallback: search all entities if not found in MESSAGEAREA
  if (!supplierEntity) {
    const entities = findElements(doc, 'ENTITY');
    supplierEntity = entities.find(
      (entity) => {
        const name = getAttribute(entity, 'NAME');
        return name === 'T.SUP.SMALL.LIST' || 
               name === 'T.SUPPLIER.LIST' || 
               name === 'T.SUP.LIST' ||
               name === 'SUPPLIER.LIST' ||
               (name?.includes('SUPPLIER') && name?.includes('LIST')) ||
               (name?.includes('SUP') && name?.includes('LIST'));
      }
    );
  }
  
  if (!supplierEntity) {
    console.warn('extractSupplierList: Supplier entity not found. Available entities:', 
      Array.from(doc.getElementsByTagName('ENTITY')).map(el => getAttribute(el, 'NAME')));
    return suppliers;
  }
  
  // Navigate through SETS -> SET -> ATTRIBUTEGROUP
  const sets = findElements(supplierEntity, 'SET');
  
  sets.forEach((set) => {
    const setId = getAttribute(set, 'SET_ID') || getAttribute(set, 'KEY') || '';
    const attributeGroups = findElements(set, 'ATTRIBUTEGROUP');
    
    attributeGroups.forEach((group) => {
      const supplier: Supplier = {
        id: setId,
        key: getAttribute(group, 'KEY') || setId,
        shortName: '',
      };
      
      // Extract common supplier fields
      const shortNameEl = findElement(group, 'SHORTNAME') || findElement(group, 'SHORT_NAME');
      if (shortNameEl) {
        supplier.shortName = getTextContent(shortNameEl);
      }
      
      const displayNameEl = findElement(group, 'DISPLAYNAME') || findElement(group, 'DISPLAY_NAME');
      if (displayNameEl) {
        supplier.displayName = getTextContent(displayNameEl);
      }
      
      const supplierNoEl = findElement(group, 'SUPPLIERNO') || findElement(group, 'SUPPLIER_NO') || findElement(group, 'NUMBER');
      if (supplierNoEl) {
        supplier.supplierNo = getTextContent(supplierNoEl);
      }
      
      const cityEl = findElement(group, 'CITY');
      if (cityEl) {
        supplier.city = getTextContent(cityEl);
      }
      
      const streetEl = findElement(group, 'STREET') || findElement(group, 'ADDRESS');
      if (streetEl) {
        supplier.street = getTextContent(streetEl);
      }
      
      const zipCodeEl = findElement(group, 'ZIPCODE') || findElement(group, 'ZIP_CODE') || findElement(group, 'POSTALCODE');
      if (zipCodeEl) {
        supplier.zipCode = getTextContent(zipCodeEl);
      }
      
      const phoneEl = findElement(group, 'PHONE') || findElement(group, 'PHONENUMBER') || findElement(group, 'PHONE_NUMBER');
      if (phoneEl) {
        supplier.phoneNumber = getTextContent(phoneEl);
      }
      
      const accessRightEl = findElement(group, 'ACCESSRIGHT') || findElement(group, 'ACCESS_RIGHT');
      if (accessRightEl) {
        supplier.accessRight = getAttribute(accessRightEl, 'SYSNAME') || getTextContent(accessRightEl);
      }
      
      // Only add if we have at least a shortName or displayName
      if (supplier.shortName || supplier.displayName) {
        suppliers.push(supplier);
      }
    });
  });
  
  console.log('extractSupplierList result:', suppliers);
  return suppliers;
}

/**
 * Extract POS (Point-of-Sale) list from GET_T_POS_SMALL_LIST response
 */
export interface POSItem {
  id: string;
  pvno: string; // POS number
  displayName: string;
  address: string; // ADDRESS1
  city: string;
  pcode: string; // Postal code
  phone?: string; // PHONE1
}

export function extractPosSmallList(doc: Document): POSItem[] {
  const posList: POSItem[] = [];
  
  // Find MESSAGEAREA with NAME="T.POS.SMALL.LIST" or similar
  const messageAreas = findElements(doc, 'MESSAGEAREA');
  let posMessageArea = messageAreas.find(
    (area) => {
      const name = getAttribute(area, 'NAME');
      return name === 'T.POS.SMALL.LIST' || 
             name === 'T.POS.LIST' ||
             name === 'POS.SMALL.LIST' ||
             (name?.includes('POS') && name?.includes('LIST'));
    }
  );
  
  // If not found by name, try to find any MESSAGEAREA that contains POS data
  if (!posMessageArea && messageAreas.length > 0) {
    // Look for MESSAGEAREA that has DATAFIELDS with ENTITY containing POS
    for (const area of messageAreas) {
      const dataFields = findElement(area, 'DATAFIELDS');
      if (dataFields) {
        const entities = findElements(dataFields, 'ENTITY');
        const posEntity = entities.find(
          (entity) => {
            const name = getAttribute(entity, 'NAME');
            return name === 'T.POS.SMALL.LIST' || 
                   name === 'T.POS.LIST' ||
                   name === 'POS.SMALL.LIST' ||
                   (name?.includes('POS') && name?.includes('LIST'));
          }
        );
        if (posEntity) {
          posMessageArea = area;
          break;
        }
      }
    }
  }
  
  if (!posMessageArea) {
    console.warn('extractPosSmallList: POS MESSAGEAREA not found. Available MESSAGEAREAs:', 
      messageAreas.map(el => getAttribute(el, 'NAME')));
    // Fallback: try to find ENTITY directly
    const entities = findElements(doc, 'ENTITY');
    const posEntity = entities.find(
      (entity) => {
        const name = getAttribute(entity, 'NAME');
        return name === 'T.POS.SMALL.LIST' || 
               name === 'T.POS.LIST' ||
               name === 'POS.SMALL.LIST' ||
               (name?.includes('POS') && name?.includes('LIST'));
      }
    );
    
    if (posEntity) {
      const sets = findElements(posEntity, 'SET');
      sets.forEach((set, index) => {
        const setId = getAttribute(set, 'SET_ID') || `${index}`;
        const attributeGroups = findElements(set, 'ATTRIBUTEGROUP');
        
        attributeGroups.forEach((group) => {
          const pvno = getTextContent(findElement(group, 'PVNO'));
          const displayName = getTextContent(findElement(group, 'DISPLAYNAME'));
          const address = getTextContent(findElement(group, 'ADDRESS1'));
          const city = getTextContent(findElement(group, 'CITY'));
          const pcode = getTextContent(findElement(group, 'PCODE'));
          const phone = getTextContent(findElement(group, 'PHONE1'));
          
          if (pvno || displayName) {
            posList.push({
              id: setId,
              pvno: pvno || '',
              displayName: displayName || '',
              address: address || '',
              city: city || '',
              pcode: pcode || '',
              phone: phone || undefined,
            });
          }
        });
      });
      console.log('extractPosSmallList result (fallback):', posList);
      return posList;
    }
    return posList;
  }
  
  // Navigate through DATAFIELDS -> ENTITIES -> ENTITY -> SETS -> SET -> ATTRIBUTEGROUP
  const dataFields = findElement(posMessageArea, 'DATAFIELDS');
  if (!dataFields) {
    console.warn('extractPosSmallList: DATAFIELDS not found in MESSAGEAREA');
    return posList;
  }
  
  const entities = findElements(dataFields, 'ENTITY');
  const posEntity = entities.find(
    (entity) => {
      const name = getAttribute(entity, 'NAME');
      return name === 'T.POS.SMALL.LIST' || 
             name === 'T.POS.LIST' ||
             name === 'POS.SMALL.LIST' ||
             (name?.includes('POS') && name?.includes('LIST'));
    }
  );
  
  if (!posEntity) {
    console.warn('extractPosSmallList: POS ENTITY not found in DATAFIELDS. Available entities:', 
      entities.map(el => getAttribute(el, 'NAME')));
    return posList;
  }
  
  // Navigate through SETS -> SET -> ATTRIBUTEGROUP
  const sets = findElements(posEntity, 'SET');
  
  sets.forEach((set, index) => {
    const setId = getAttribute(set, 'SET_ID') || `${index}`;
    const attributeGroups = findElements(set, 'ATTRIBUTEGROUP');
    
    attributeGroups.forEach((group) => {
      const pvno = getTextContent(findElement(group, 'PVNO'));
      const displayName = getTextContent(findElement(group, 'DISPLAYNAME'));
      const address = getTextContent(findElement(group, 'ADDRESS1'));
      const city = getTextContent(findElement(group, 'CITY'));
      const pcode = getTextContent(findElement(group, 'PCODE'));
      const phone = getTextContent(findElement(group, 'PHONE1'));
      
      if (pvno || displayName) {
        posList.push({
          id: setId,
          pvno: pvno || '',
          displayName: displayName || '',
          address: address || '',
          city: city || '',
          pcode: pcode || '',
          phone: phone || undefined,
        });
      }
    });
  });
  
  console.log('extractPosSmallList result:', posList.length, 'items');
  return posList;
}

/**
 * Extract NEXT_DATA_LEVEL from GET_T_POS_SMALL_LIST response
 * Returns the next data level to use, or 0 if no more levels available
 */
export function extractNextDataLevel(doc: Document): number {
  // Find MESSAGEAREA and look for MSG with NAME="BASE.COMMON.NEXT_DATA_LEVEL"
  const messageAreas = findElements(doc, 'MESSAGEAREA');
  
  for (const messageArea of messageAreas) {
    const msgElements = findElements(messageArea, 'MSG');
    
    for (const msg of msgElements) {
      const name = getAttribute(msg, 'NAME');
      if (name === 'BASE.COMMON.NEXT_DATA_LEVEL') {
        const caption = getTextContent(findElement(msg, 'CAPTION'));
        const nextLevel = parseInt(caption || '0', 10);
        console.log('extractNextDataLevel: Found next data level:', nextLevel);
        return nextLevel;
      }
    }
  }
  
  console.warn('extractNextDataLevel: NEXT_DATA_LEVEL message not found');
  return 0;
}

/**
 * Menu item interface for dynamic menu
 */
export interface MenuItem {
  id: string;
  name: string; // Internal identifier (e.g., 'activities', 'orders')
  label: string; // Display text from CAPTION
  tooltip?: string; // Tooltip text
  path: string; // Route path
  icon?: string; // Icon identifier (for future use)
  permission?: string; // Permission key (e.g., 'showActivity', 'showOrder')
}

/**
 * Permissions interface
 */
export interface MenuPermissions {
  showActivity: boolean;
  showOrder: boolean;
  showPOS: boolean;
}

/**
 * App Init Menu Captions interface
 */
export interface AppInitMenuCaptions {
  activities?: string;
  activitiesTooltip?: string;
  orders?: string;
  ordersTooltip?: string;
  dailyAgenda?: string;
  dailyAgendaTooltip?: string;
  exchangeData?: string;
  exchangeDataTooltip?: string;
  pos?: string;
  suppliers?: string;
  logout?: string;
  logo?: string; // Base64 logo image data URL
  logoutIcon?: string; // Base64 logout icon image data URL
  [key: string]: string | undefined;
}

/**
 * Extract menu captions from GET_T_APP_INIT response
 * Note: Data is in MESSAGEAREA > DATAFIELDS > ENTITIES > ENTITY (not METAFIELDS)
 */
export function extractAppInitMenuCaptions(doc: Document): AppInitMenuCaptions {
  const captions: AppInitMenuCaptions = {};
  
  console.log('extractAppInitMenuCaptions: Starting extraction...');
  
  // Find MESSAGEAREA first
  const messageAreas = findElements(doc, 'MESSAGEAREA');
  let dataFields: Element | null = null;
  
  // Look for DATAFIELDS in MESSAGEAREA (this is where actual data is, not METAFIELDS)
  for (const messageArea of messageAreas) {
    const df = findElement(messageArea, 'DATAFIELDS');
    if (df) {
      dataFields = df;
      console.log('extractAppInitMenuCaptions: Found DATAFIELDS in MESSAGEAREA');
      break;
    }
  }
  
  // If DATAFIELDS not found, fallback to searching all entities (for backward compatibility)
  const searchRoot = dataFields || doc;
  const entities = findElements(searchRoot, 'ENTITY');
  console.log('extractAppInitMenuCaptions: Found', entities.length, 'ENTITY elements in', dataFields ? 'DATAFIELDS' : 'document');
  
  // Find all CAPTION elements in DATAFIELDS entities
  const allCaptions: Array<{ name: string; text: string; entityName?: string }> = [];
  
  entities.forEach((entity) => {
    const entityName = getAttribute(entity, 'NAME');
    const sets = findElements(entity, 'SET');
    
    sets.forEach((set) => {
      const attributeGroups = findElements(set, 'ATTRIBUTEGROUP');
      
      attributeGroups.forEach((group) => {
        const captionElements = findElements(group, 'CAPTION');
        
        captionElements.forEach((caption) => {
          const name = getAttribute(caption, 'NAME');
          const text = getTextContent(caption);
          
          if (name && text) {
            allCaptions.push({ name, text, entityName });
            
            // Log menu-related captions
            if (name.includes('MENU') || name.includes('ACTIVITY') || name.includes('ORDER') || name.includes('AGENDA') || name.includes('EXCHANGE') || name.includes('POS') || name.includes('SUPPLIER') || name.includes('LOGOUT')) {
              console.log(`extractAppInitMenuCaptions: Found CAPTION NAME="${name}" TEXT="${text}" in ENTITY="${entityName}"`);
            }
            
            // Match menu captions (checking multiple possible formats)
            switch (name) {
              case 'MENU:ACTIVITIES':
              case 'LABEL:ACTIVITIES':
              case 'TEXT:ACTIVITIES':
                captions.activities = text;
                break;
              case 'MENU_TOOLTIP:ACTIVITIES':
              case 'ACTIVITY.TOOLTIP:ACTIVITY':
              case 'TOOLTIP:ACTIVITIES':
                captions.activitiesTooltip = text;
                break;
              case 'MENU:ORDERS':
              case 'LABEL:ORDERS':
              case 'TEXT:ORDERS':
                captions.orders = text;
                break;
              case 'MENU_TOOLTIP:ORDERS':
              case 'TOOLTIP:ORDERS':
                captions.ordersTooltip = text;
                break;
              case 'MENU_DAILYAGENDA':
              case 'MENU:DAILYAGENDA':
              case 'LABEL:AGENDA':
              case 'TEXT:AGENDA':
                captions.dailyAgenda = text;
                break;
              case 'MENU_TOOLTIP:DAILYAGENDA':
              case 'TOOLTIP:AGENDA':
                captions.dailyAgendaTooltip = text;
                break;
              case 'MENU:EXCHANGEDATA':
              case 'MENU:EXCHANGE_DATA':
              case 'TEXT:EXCHANGEDATA':
                captions.exchangeData = text;
                break;
              case 'MENU_TOOLTIP:EXCHANGEDATA':
              case 'MENU_TOOLTIP:EXCHANGE_DATA':
              case 'TOOLTIP:EXCHANGEDATA':
                captions.exchangeDataTooltip = text;
                break;
              case 'TEXT:POS':
              case 'LABEL:POS':
              case 'MENU:POS':
                captions.pos = text;
                break;
              case 'TEXT:SUPPLIER':
              case 'TEXT:SUPPLIERS':
              case 'LABEL:SUPPLIERS':
              case 'LABEL:SUPPLIER':
              case 'MENU:SUPPLIERS':
                captions.suppliers = text;
                break;
              case 'MENU:LOGOUT':
              case 'TEXT:LOGOUT':
              case 'LABEL:LOGOUT':
                captions.logout = text;
                break;
              default:
                // Store other captions for future use
                if (name && text) {
                  captions[name] = text;
                }
                break;
            }
          }
        });
      });
    });
  });
  
  // Extract images (logos) from UI.IMAGE.DATA entity
  const imageDataEntity = entities.find(
    (entity) => getAttribute(entity, 'NAME') === 'UI.IMAGE.DATA'
  );
  
  if (imageDataEntity) {
    console.log('extractAppInitMenuCaptions: Found UI.IMAGE.DATA entity, extracting images...');
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
          
          if (imageData) {
            // Convert base64 to data URL
            const dataUrl = `data:image/png;base64,${imageData}`;
            
            if (identifier === 'PLACEHOLDER:LOGO' || identifier === 'ICON:LOGO') {
              captions.logo = dataUrl;
              console.log('extractAppInitMenuCaptions: Found logo image');
            } else if (identifier === 'ICON:LOGOUT') {
              captions.logoutIcon = dataUrl;
              console.log('extractAppInitMenuCaptions: Found logout icon');
            }
          }
        }
      }
    });
  } else {
    console.warn('extractAppInitMenuCaptions: UI.IMAGE.DATA entity not found');
  }
  
  console.log(`extractAppInitMenuCaptions: Processed ${allCaptions.length} total CAPTION elements`);
  
  // Log all extracted menu captions for debugging
  console.log('extractAppInitMenuCaptions: Extracted captions:', {
    activities: captions.activities,
    orders: captions.orders,
    pos: captions.pos,
    suppliers: captions.suppliers,
    dailyAgenda: captions.dailyAgenda,
    exchangeData: captions.exchangeData,
    logout: captions.logout,
    hasLogo: !!captions.logo,
    hasLogoutIcon: !!captions.logoutIcon,
  });
  
  console.log('extractAppInitMenuCaptions result:', captions);
  return captions;
}

/**
 * Extract permissions from GET_T_APP_INIT response
 * Permissions are determined by INTERACTION_NAME elements
 */
export function extractAppInitPermissions(doc: Document): MenuPermissions {
  const permissions: MenuPermissions = {
    showActivity: false,
    showOrder: false,
    showPOS: false,
  };
  
  console.log('extractAppInitPermissions: Starting extraction...');
  
  // Check if user is a supplier (has supplier role) from localStorage
  // This is set during login when ORGAROLE is ORGANISATION_ROLE:SUPPLIER
  const isSupplier = localStorage.getItem('pv.isSupplier') === 'true';
  console.log('extractAppInitPermissions: isSupplier from localStorage:', isSupplier);
  
  // Check if user is a supplier (has supplier role)
  // This is typically indicated by a specific entity or field
  const entities = findElements(doc, 'ENTITY');
  console.log('extractAppInitPermissions: Found', entities.length, 'ENTITY elements');
  
  // Look for supplier-related indicators
  entities.forEach((entity, index) => {
    const entityName = getAttribute(entity, 'NAME');
    console.log(`extractAppInitPermissions: ENTITY[${index}] NAME="${entityName}"`);
    
    if (entityName?.includes('SUPPLIER') || entityName?.includes('SUP')) {
      console.log('extractAppInitPermissions: Found supplier-related entity:', entityName);
      // Additional check might be needed here
    }
  });
  
  // Extract INTERACTION_NAME elements to determine permissions
  const interactionNames: string[] = [];
  
  entities.forEach((entity, entityIndex) => {
    const interactionNameElements = findElements(entity, 'INTERACTION_NAME');
    console.log(`extractAppInitPermissions: Found`, interactionNameElements.length, 'INTERACTION_NAME elements in ENTITY', entityIndex);
    
    interactionNameElements.forEach((el, elIndex) => {
      const interactionName = getTextContent(el);
      console.log(`extractAppInitPermissions: INTERACTION_NAME[${elIndex}]="${interactionName}"`);
      if (interactionName) {
        interactionNames.push(interactionName);
      }
    });
  });
  
  // Determine permissions based on interaction names
  if (isSupplier) {
    console.log('extractAppInitPermissions: User is supplier, setting showPOS=true');
    permissions.showPOS = true;
    permissions.showActivity = false;
    permissions.showOrder = false;
  } else {
    // Check for activity-related interactions (multiple possible names)
    if (interactionNames.some(name => 
      name === 'SET_T_ACTIVITY_INPUT_CREATE' || 
      name === 'SET_ACTIVITIES' ||
      name.includes('ACTIVITY') && (name.includes('CREATE') || name.includes('SET'))
    )) {
      console.log('extractAppInitPermissions: Found activity interaction, setting showActivity=true');
      permissions.showActivity = true;
    }
    
    // Check for order-related interactions
    if (interactionNames.some(name => 
      name === 'SET_T_ORDER_INPUT_CREATE' || 
      name.includes('ORDER') && (name.includes('CREATE') || name.includes('SET'))
    )) {
      console.log('extractAppInitPermissions: Found order interaction, setting showOrder=true');
      permissions.showOrder = true;
    }
    
    // Check for POS-related interactions
    if (interactionNames.some(name => 
      name.includes('POS') || name.includes('GET_POS') || name.includes('GET_T_POS')
    )) {
      console.log('extractAppInitPermissions: Found POS interaction, setting showPOS=true');
      permissions.showPOS = true;
    }
  }
  
  console.log('extractAppInitPermissions result:', permissions);
  console.log('extractAppInitPermissions: Found interaction names:', interactionNames);
  
  return permissions;
}

