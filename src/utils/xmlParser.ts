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
  
  // Find ENTITY NAME="T.SUP.SMALL.LIST" or similar
  const entities = findElements(doc, 'ENTITY');
  const supplierEntity = entities.find(
    (entity) => {
      const name = getAttribute(entity, 'NAME');
      return name === 'T.SUP.SMALL.LIST' || 
             name === 'T.SUPPLIER.LIST' || 
             name === 'SUPPLIER.LIST' ||
             name?.includes('SUPPLIER') && name?.includes('LIST');
    }
  );
  
  if (!supplierEntity) {
    console.warn('extractSupplierList: Supplier entity not found');
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

