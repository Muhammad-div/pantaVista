/**
 * API Service for XML-based backend communication
 * Backend URL: https://api.pantavista.net
 */

import { parseXML, getMessageName, getUserMessages, getSystemMessages, extractPreAppInitCaptions, extractLoginTemplate, extractLoginConfirmation, extractSupplierList, extractPosSmallList, extractNextDataLevel, extractAppInitMenuCaptions, extractAppInitPermissions, getToken, getLanguage, type PreAppInitCaptions, type LoginTemplateField, type LoginConfirmation, type Supplier, type POSItem, type UserMessage, type AppInitMenuCaptions, type MenuPermissions } from '../utils/xmlParser';

const API_BASE_URL = 'https://api.pantavista.net';

// Request deduplication: prevent multiple simultaneous identical requests
const pendingRequests = new Map<string, Promise<any>>();

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  messages?: UserMessage[];
}

export interface ApiError {
  message: string;
  status?: number;
  messages?: UserMessage[];
}

/**
 * Detect browser language
 */
function detectLanguage(): { full: string; short: string } {
  const navLang = navigator.language || (navigator as any).browserLanguage || 'en';
  
  if (navLang.toLowerCase().includes('de')) {
    console.log('🌍 Language detected: German (browser:', navLang + ')');
    return { full: 'GERMAN', short: 'DE' };
  }
  console.log('🌍 Language detected: English (browser:', navLang + ')');
  return { full: 'ENGLISH', short: 'EN' };
}

/**
 * Get stored token from localStorage
 */
export function getStoredToken(): string | null {
  return localStorage.getItem('pv.token') || null;
}

/**
 * Store token in localStorage
 */
export function storeToken(token: string): void {
  localStorage.setItem('pv.token', token);
}

/**
 * Clear stored token
 */
export function clearToken(): void {
  localStorage.removeItem('pv.token');
  localStorage.removeItem('pv.lang');
  localStorage.removeItem('pv.displayName');
  localStorage.removeItem('pv.profileImage');
}

/**
 * Get stored language
 */
export function getStoredLanguage(): string {
  return localStorage.getItem('pv.lang') || 'LANGUAGE:ENGLISH';
}

/**
 * Store language
 */
export function storeLanguage(language: string): void {
  localStorage.setItem('pv.lang', language);
}

/**
 * Make XML API request
 */
async function makeXMLRequest(xmlPayload: string): Promise<string> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Accept': 'application/xml,text/plain;q=0.9,*/*;q=0.8',
      },
      body: xmlPayload,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    return xmlText;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    throw new Error(`API request failed: ${errorMessage}`);
  }
}

/**
 * GET_PRE_APP_INIT - Get initial UI captions and texts
 */
export async function getPreAppInit(): Promise<ApiResponse<PreAppInitCaptions>> {
  const requestKey = 'GET_PRE_APP_INIT';
  
  // If there's already a pending request, return it
  if (pendingRequests.has(requestKey)) {
    console.log('getPreAppInit: Reusing pending request');
    return pendingRequests.get(requestKey);
  }
  
  const requestPromise = (async () => {
    try {
      const lang = detectLanguage();
      const token = getStoredToken() || '';
      
      const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE NAME="PV.ENVELOPE" VERSION="1.00" CREATE="">
  <ENVELOPE_DATA>
    <TOKEN>${token}</TOKEN>
    <IPADDRESS />
    <USERAGENT />
    <LANGUAGE>LANGUAGE:${lang.full}</LANGUAGE>
    <ORIGINATOR>PV.TC.WEB.UI</ORIGINATOR>
  </ENVELOPE_DATA>
  <APPLICATION_REQUEST VERSION="1.00" LANGUAGE="${lang.short}">
    <BNO_REQUEST VERSION="1.00">
      <BNO_PRODUCTION_MODE>TRUE</BNO_PRODUCTION_MODE>
      <BNO_GROUP>LOGIN</BNO_GROUP>
      <BNO_INTERACTION_NAME>GET_PRE_APP_INIT</BNO_INTERACTION_NAME>
      <BNO_INTERACTION_VERSION>1.00</BNO_INTERACTION_VERSION>
      <BNO_INTERACTION_MODE>INTERACTION_MODE:VIEW</BNO_INTERACTION_MODE>
      <BNO_PARAMETERS>
        <BNO_PARAM NAME="LINGO">
          <VALUE>${lang.short}</VALUE>
        </BNO_PARAM>
      </BNO_PARAMETERS>
    </BNO_REQUEST>
  </APPLICATION_REQUEST>
</ENVELOPE>`;

      console.log('getPreAppInit: Making API request');
      const xmlResponse = await makeXMLRequest(xmlPayload);
      const doc = parseXML(xmlResponse);
      const messageName = getMessageName(doc);
      
      if (messageName === 'GET_PRE_APP_INIT') {
        const captions = extractPreAppInitCaptions(doc);
        const messages = getUserMessages(doc);
        
        // Store language if returned
        const language = doc.querySelector('LANGUAGE')?.textContent;
        if (language) {
          storeLanguage(language);
        }
        
        return {
          success: true,
          data: captions,
          messages,
        };
      }
      
      throw new Error(`Unexpected message type: ${messageName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get pre-app init';
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // Remove from pending requests after completion
      pendingRequests.delete(requestKey);
    }
  })();
  
  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
}

/**
 * GET_LOGIN_TEMPLATE - Get login form template with field definitions
 */
export async function getLoginTemplate(): Promise<ApiResponse<{ username?: LoginTemplateField; password?: LoginTemplateField }>> {
  const requestKey = 'GET_LOGIN_TEMPLATE';
  
  // If there's already a pending request, return it
  if (pendingRequests.has(requestKey)) {
    console.log('getLoginTemplate: Reusing pending request');
    return pendingRequests.get(requestKey);
  }
  
  const requestPromise = (async () => {
    try {
    const lang = detectLanguage();
    
    // Map language to correct code (German uses "GE" not "DE")
    let langCode = lang.short;
    if (lang.full === 'GERMAN') {
      langCode = 'GE';
    } else if (lang.full === 'ENGLISH') {
      langCode = 'EN';
    }
    
    const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE NAME="PV.ENVELOPE" VERSION="1.00" CREATE="">
  <ENVELOPE_DATA>
    <TOKEN />
    <IPADDRESS />
    <USERAGENT />
    <LANGUAGE>LANGUAGE:${lang.full}</LANGUAGE>
    <ORIGINATOR>PV.TC.WEB.UI</ORIGINATOR>
  </ENVELOPE_DATA>
  <APPLICATION_REQUEST VERSION="1.00" LANGUAGE="${langCode}">
    <BNO_REQUEST VERSION="1.00">
      <BNO_PRODUCTION_MODE>TRUE</BNO_PRODUCTION_MODE>
      <BNO_GROUP>LOGIN</BNO_GROUP>
      <BNO_INTERACTION_NAME>GET_LOGIN_TEMPLATE</BNO_INTERACTION_NAME>
      <BNO_INTERACTION_VERSION>1.00</BNO_INTERACTION_VERSION>
      <BNO_INTERACTION_MODE>INTERACTION_MODE:TEMPLATE</BNO_INTERACTION_MODE>
      <BNO_PARAMETERS />
    </BNO_REQUEST>
  </APPLICATION_REQUEST>
</ENVELOPE>`;

      const xmlResponse = await makeXMLRequest(xmlPayload);
      const doc = parseXML(xmlResponse);
      const messageName = getMessageName(doc);
      
      if (messageName === 'GET_LOGIN_TEMPLATE') {
        const template = extractLoginTemplate(doc);
        const messages = getUserMessages(doc);
        
        return {
          success: true,
          data: template,
          messages,
        };
      }
      
      throw new Error(`Unexpected message type: ${messageName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get login template';
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // Remove from pending requests after completion
      pendingRequests.delete(requestKey);
    }
  })();
  
  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
}

/**
 * SET_T_LOGIN - Perform login with username and password
 */
export async function login(
  username: string,
  password: string
): Promise<ApiResponse<LoginConfirmation>> {
  try {
    if (!username || !password) {
      return {
        success: false,
        error: 'Username and password are required',
      };
    }

    const lang = detectLanguage();
    const prevToken = getStoredToken() || '';
    
    // Hash password with SHA256
    // Trim password to remove any accidental whitespace
    const trimmedPassword = password.trim();
    const { SHA256 } = await import('../utils/sha256');
    const hashedPassword = SHA256(trimmedPassword).toUpperCase(); // Backend expects uppercase
    console.log('Password hash:', hashedPassword);
    
    const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE NAME="PV.ENVELOPE" VERSION="1.00" CREATE="">
  <ENVELOPE_DATA>
    <TOKEN>${prevToken}</TOKEN>
    <IPADDRESS />
    <USERAGENT />
    <LANGUAGE>LANGUAGE:${lang.full}</LANGUAGE>
    <ORIGINATOR>PVNG.WEB.UI</ORIGINATOR>
  </ENVELOPE_DATA>
  <APPLICATION_REQUEST VERSION="1.00" LANGUAGE="EN">
    <BNO_REQUEST VERSION="1.00">
      <BNO_PRODUCTION_MODE>TRUE</BNO_PRODUCTION_MODE>
      <BNO_GROUP>LOGIN</BNO_GROUP>
      <BNO_INTERACTION_NAME>SET_LOGIN</BNO_INTERACTION_NAME>
      <BNO_INTERACTION_VERSION>1.00</BNO_INTERACTION_VERSION>
      <BNO_INTERACTION_MODE>INTERACTION_MODE:CREATE</BNO_INTERACTION_MODE>
      <BNO_PARAMETERS />
    </BNO_REQUEST>
  </APPLICATION_REQUEST>
  <MESSAGE NAME="SET_LOGIN" VERSION="1.00">
    <MESSAGEAREA NAME="INTERACTIONUSER.LOGIN" VERSION="1.00">
      <DATAFIELDS>
        <ENTITIES>
          <ENTITY NAME="LOGINDATA" VERSION="1.00">
            <SETS>
              <SET SORT="1" SET_ID="" PARENT_SET_ID="" ACTION="">
                <ATTRIBUTEGROUP NAME="LOGINDATA" KEY="" KEYVERSION="">
                  <PASSWORD ACTION="">${hashedPassword}</PASSWORD>
                  <USERNAME ACTION="">${username}</USERNAME>
                </ATTRIBUTEGROUP>
              </SET>
            </SETS>
          </ENTITY>
        </ENTITIES>
      </DATAFIELDS>
    </MESSAGEAREA>
  </MESSAGE>
</ENVELOPE>`;

    console.log('Login XML Payload:', xmlPayload);
    const xmlResponse = await makeXMLRequest(xmlPayload);
    console.log('Login XML Response:', xmlResponse);
    const doc = parseXML(xmlResponse);
    const messageName = getMessageName(doc);
    console.log('Message name:', messageName);
    
    if (messageName === 'SET_LOGIN' || messageName === 'SET_T_LOGIN') {
      const messages = getUserMessages(doc);
      console.log('User messages:', messages);
      console.log('User messages details:', JSON.stringify(messages, null, 2));
      
      // Check for error messages (critical level 1 = error)
      const errorMessages = messages.filter((msg) => msg.criticalLevel === '1');
      console.log('Error messages:', errorMessages);
      console.log('Error messages details:', JSON.stringify(errorMessages, null, 2));
      if (errorMessages.length > 0) {
        const errorCaption = errorMessages[0]?.caption || 'Login failed';
        console.log('Login failed with error:', errorCaption);
        return {
          success: false,
          error: errorCaption,
          messages,
        };
      }
      
      // Extract login confirmation (only if token exists)
      const token = getToken(doc);
      if (!token || token.trim() === '') {
        // No token means login failed
        // Check if there are any messages (even if not critical level 1)
        if (messages.length > 0) {
          return {
            success: false,
            error: messages[0]?.caption || 'Login failed',
            messages,
          };
        }
        return {
          success: false,
          error: 'Login failed: No token received from server',
          messages,
        };
      }
      
      const confirmation = extractLoginConfirmation(doc);
      
      if (confirmation && confirmation.token) {
        // Store token and user data
        storeToken(confirmation.token);
        if (confirmation.language) {
          storeLanguage(confirmation.language);
        }
        if (confirmation.displayName) {
          localStorage.setItem('pv.displayName', confirmation.displayName);
        }
        if (confirmation.username) {
          localStorage.setItem('pv.username', confirmation.username);
        }
        
        // Store supplier role for menu permissions
        if (confirmation.isSupplier !== undefined) {
          localStorage.setItem('pv.isSupplier', String(confirmation.isSupplier));
        }
        if (confirmation.orgRole) {
          localStorage.setItem('pv.orgRole', confirmation.orgRole);
        }
        
        return {
          success: true,
          data: confirmation,
          messages,
        };
      }
      
      // If we have a token but couldn't extract confirmation, still consider it success
      // (token is the most important part)
      if (token) {
        storeToken(token);
        const language = getLanguage(doc);
        if (language) {
          storeLanguage(language);
        }
        
        return {
          success: true,
          data: {
            token,
            language: language || '',
          },
          messages,
        };
      }
      
      return {
        success: false,
        error: 'Login failed: No token received from server',
        messages,
      };
    }
    
    throw new Error(`Unexpected message type: ${messageName}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during login';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * GET_SUPPLIER_LIST - Get list of suppliers
 */
export async function getSupplierList(): Promise<ApiResponse<Supplier[]>> {
  const requestKey = 'GET_SUPPLIER_LIST';
  
  // If there's already a pending request, return it
  if (pendingRequests.has(requestKey)) {
    console.log('getSupplierList: Reusing pending request');
    return pendingRequests.get(requestKey);
  }
  
  const requestPromise = (async () => {
    try {
      const lang = detectLanguage();
      const token = getStoredToken();
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please login first.',
        };
      }
      
      const storedLang = getStoredLanguage();
      
      let langCode = lang.short;
      if (storedLang.includes(':')) {
        const parts = storedLang.split(':');
        if (parts.length > 1) {
          const langName = parts[1].toUpperCase();
          if (langName === 'GERMAN') {
            langCode = 'GE';
          } else if (langName === 'ENGLISH') {
            langCode = 'EN';
          } else {
            langCode = langName.substring(0, 2);
          }
        }
      } else if (lang.full === 'GERMAN') {
        langCode = 'GE';
      } else if (lang.full === 'ENGLISH') {
        langCode = 'EN';
      }
      
      const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE NAME="PV.ENVELOPE" VERSION="1.00" CREATE="">
  <ENVELOPE_DATA>
    <TOKEN>${token}</TOKEN>
    <IPADDRESS />
    <USERAGENT />
    <LANGUAGE>LANGUAGE:${lang.full}</LANGUAGE>
    <ORIGINATOR>PVNG.WEB.UI</ORIGINATOR>
  </ENVELOPE_DATA>
  <APPLICATION_REQUEST VERSION="1.00" LANGUAGE="${langCode}">
    <BNO_REQUEST VERSION="1.00">
      <BNO_PRODUCTION_MODE>TRUE</BNO_PRODUCTION_MODE>
      <BNO_GROUP>SUPPLIER</BNO_GROUP>
      <BNO_INTERACTION_NAME>GET_SUPPLIER_LIST</BNO_INTERACTION_NAME>
      <BNO_INTERACTION_VERSION>1.00</BNO_INTERACTION_VERSION>
      <BNO_INTERACTION_MODE>INTERACTION_MODE:VIEW</BNO_INTERACTION_MODE>
      <BNO_PARAMETERS />
    </BNO_REQUEST>
  </APPLICATION_REQUEST>
</ENVELOPE>`;

      console.log('getSupplierList: Making API request');
      const xmlResponse = await makeXMLRequest(xmlPayload);
      const doc = parseXML(xmlResponse);
      const messageName = getMessageName(doc);
      
      // Check for error messages first
      const messages = getUserMessages(doc);
      const systemMessages = getSystemMessages(doc);
      
      // Combine user and system messages for error checking
      const allMessages = [...messages, ...systemMessages];
      
      // Check for critical errors (CL >= 6) - these are system errors
      const criticalErrors = allMessages.filter((msg) => {
        const cl = parseInt(msg.criticalLevel || '0', 10);
        return cl >= 6;
      });
      
      if (criticalErrors.length > 0) {
        // Prefer user message if available, otherwise use system message
        const userErrorMsg = messages.find((msg) => {
          const cl = parseInt(msg.criticalLevel || '0', 10);
          return cl >= 6;
        });
        const errorMsg = userErrorMsg?.caption || criticalErrors[0]?.caption || 'Failed to get supplier list';
        console.error('getSupplierList: Critical error:', errorMsg);
        return {
          success: false,
          error: errorMsg,
          messages: allMessages,
        };
      }
      
      // Check for regular error messages (CL = 1)
      const errorMessages = allMessages.filter((msg) => msg.criticalLevel === '1');
      if (errorMessages.length > 0) {
        const errorMsg = errorMessages[0]?.caption || 'Failed to get supplier list';
        console.error('getSupplierList: Error:', errorMsg);
        return {
          success: false,
          error: errorMsg,
          messages: allMessages,
        };
      }
      
      if (messageName === 'GET_SUPPLIER_LIST' || messageName?.includes('SUPPLIER') || messageName === 'IDF.MESSAGES') {
        const suppliers = extractSupplierList(doc);
        
        return {
          success: true,
          data: suppliers,
          messages,
        };
      }
      
      throw new Error(`Unexpected message type: ${messageName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get supplier list';
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // Remove from pending requests after completion
      pendingRequests.delete(requestKey);
    }
  })();
  
  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
}

/**
 * GET_T_POS_SMALL_LIST - Get list of Point-of-Sale (POS) data
 * @param dataLevel - The data level to fetch (starts at 1)
 */
export async function getPosSmallList(dataLevel: number = 1): Promise<ApiResponse<{ posList: POSItem[]; nextDataLevel: number }>> {
  const requestKey = `GET_T_POS_SMALL_LIST_${dataLevel}`;
  
  // If there's already a pending request for this data level, return it
  if (pendingRequests.has(requestKey)) {
    console.log('getPosSmallList: Reusing pending request');
    return pendingRequests.get(requestKey);
  }
  
  const requestPromise = (async () => {
    try {
      const lang = detectLanguage();
      const token = getStoredToken();
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please login first.',
        };
      }
      
      const storedLang = getStoredLanguage();
      
      let langCode = lang.short;
      if (storedLang.includes(':')) {
        const parts = storedLang.split(':');
        if (parts.length > 1) {
          const langName = parts[1].toUpperCase();
          if (langName === 'GERMAN') {
            langCode = 'GE';
          } else if (langName === 'ENGLISH') {
            langCode = 'EN';
          } else {
            langCode = langName.substring(0, 2);
          }
        }
      } else if (lang.full === 'GERMAN') {
        langCode = 'GE';
      } else if (lang.full === 'ENGLISH') {
        langCode = 'EN';
      }
      
      const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE NAME="PV.ENVELOPE" VERSION="1.00" CREATE="">
  <ENVELOPE_DATA>
    <TOKEN>${token}</TOKEN>
    <IPADDRESS />
    <USERAGENT />
    <LANGUAGE>LANGUAGE:${lang.full}</LANGUAGE>
    <ORIGINATOR>PVNG.WEB.UI</ORIGINATOR>
  </ENVELOPE_DATA>
  <APPLICATION_REQUEST VERSION="1.00" LANGUAGE="${langCode}">
    <BNO_REQUEST VERSION="1.00">
      <BNO_PRODUCTION_MODE>TRUE</BNO_PRODUCTION_MODE>
      <BNO_GROUP>LOGIN</BNO_GROUP>
      <BNO_INTERACTION_NAME>GET_T_POS_SMALL_LIST</BNO_INTERACTION_NAME>
      <BNO_INTERACTION_VERSION>1.00</BNO_INTERACTION_VERSION>
      <BNO_INTERACTION_MODE>INTERACTION_MODE:VIEW</BNO_INTERACTION_MODE>
      <BNO_PARAMETERS>
        <BNO_PARAM NAME="DATA_LEVEL">
          <VALUE>${dataLevel}</VALUE>
        </BNO_PARAM>
      </BNO_PARAMETERS>
    </BNO_REQUEST>
  </APPLICATION_REQUEST>
</ENVELOPE>`;

      console.log('getPosSmallList: Making API request with DATA_LEVEL:', dataLevel);
      const xmlResponse = await makeXMLRequest(xmlPayload);
      const doc = parseXML(xmlResponse);
      const messageName = getMessageName(doc);
      
      // Check for error messages first
      const messages = getUserMessages(doc);
      const systemMessages = getSystemMessages(doc);
      const allMessages = [...messages, ...systemMessages];
      
      // Check for critical errors (CL >= 6)
      const criticalErrors = allMessages.filter((msg) => {
        const cl = parseInt(msg.criticalLevel || '0', 10);
        return cl >= 6;
      });
      
      if (criticalErrors.length > 0) {
        const userErrorMsg = messages.find((msg) => {
          const cl = parseInt(msg.criticalLevel || '0', 10);
          return cl >= 6;
        });
        const errorMsg = userErrorMsg?.caption || criticalErrors[0]?.caption || 'Failed to get POS list';
        console.error('getPosSmallList: Critical error:', errorMsg);
        return {
          success: false,
          error: errorMsg,
          messages: allMessages,
        };
      }
      
      // Check for regular error messages (CL = 1)
      const errorMessages = allMessages.filter((msg) => msg.criticalLevel === '1');
      if (errorMessages.length > 0) {
        const errorMsg = errorMessages[0]?.caption || 'Failed to get POS list';
        console.error('getPosSmallList: Error:', errorMsg);
        return {
          success: false,
          error: errorMsg,
          messages: allMessages,
        };
      }
      
      if (messageName === 'GET_T_POS_SMALL_LIST' || messageName?.includes('POS')) {
        const posList = extractPosSmallList(doc);
        const nextDataLevel = extractNextDataLevel(doc);
        
        return {
          success: true,
          data: {
            posList,
            nextDataLevel: nextDataLevel || 0,
          },
          messages: allMessages,
        };
      }
      
      throw new Error(`Unexpected message type: ${messageName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get POS list';
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // Remove from pending requests after completion
      pendingRequests.delete(requestKey);
    }
  })();
  
  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
}

/**
 * GET_T_APP_INIT - Get application initialization data including menu items and permissions
 */
export async function getAppInit(): Promise<ApiResponse<{ menuCaptions: AppInitMenuCaptions; permissions: MenuPermissions }>> {
  const requestKey = 'GET_APP_INIT';
  
  // If there's already a pending request, return it
  if (pendingRequests.has(requestKey)) {
    console.log('getAppInit: Reusing pending request');
    return pendingRequests.get(requestKey);
  }
  
  const requestPromise = (async () => {
    try {
      const lang = detectLanguage();
      const token = getStoredToken();
      
      if (!token) {
        return {
          success: false,
          error: 'Authentication required. Please login first.',
        };
      }
      
      const storedLang = getStoredLanguage();
      
      let langCode = lang.short;
      if (storedLang.includes(':')) {
        const parts = storedLang.split(':');
        if (parts.length > 1) {
          const langName = parts[1].toUpperCase();
          if (langName === 'GERMAN') {
            langCode = 'GE';
          } else if (langName === 'ENGLISH') {
            langCode = 'EN';
          } else {
            langCode = langName.substring(0, 2);
          }
        }
      } else if (lang.full === 'GERMAN') {
        langCode = 'GE';
      } else if (lang.full === 'ENGLISH') {
        langCode = 'EN';
      }
      
      const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE NAME="PV.ENVELOPE" VERSION="1.00" CREATE="">
  <ENVELOPE_DATA>
    <TOKEN>${token}</TOKEN>
    <IPADDRESS />
    <USERAGENT />
    <LANGUAGE>LANGUAGE:${lang.full}</LANGUAGE>
    <ORIGINATOR>PV.TC.WEB.UI</ORIGINATOR>
  </ENVELOPE_DATA>
  <APPLICATION_REQUEST VERSION="1.00" LANGUAGE="${langCode}">
    <BNO_REQUEST VERSION="1.00">
      <BNO_PRODUCTION_MODE>TRUE</BNO_PRODUCTION_MODE>
      <BNO_GROUP>LOGIN</BNO_GROUP>
      <BNO_INTERACTION_NAME>GET_APP_INIT</BNO_INTERACTION_NAME>
      <BNO_INTERACTION_VERSION>1.00</BNO_INTERACTION_VERSION>
      <BNO_INTERACTION_MODE>INTERACTION_MODE:VIEW</BNO_INTERACTION_MODE>
      <BNO_PARAMETERS />
    </BNO_REQUEST>
  </APPLICATION_REQUEST>
</ENVELOPE>`;

      console.log('getAppInit: Making API request');
      console.log('getAppInit: XML Payload:', xmlPayload);
      const xmlResponse = await makeXMLRequest(xmlPayload);
      console.log('getAppInit: Raw XML Response:', xmlResponse);
      const doc = parseXML(xmlResponse);
      const messageName = getMessageName(doc);
      console.log('getAppInit: Message name:', messageName);
      
      // Check for error messages first
      const messages = getUserMessages(doc);
      const systemMessages = getSystemMessages(doc);
      const allMessages = [...messages, ...systemMessages];
      
      // Check for critical errors (CL >= 6)
      const criticalErrors = allMessages.filter((msg) => {
        const cl = parseInt(msg.criticalLevel || '0', 10);
        return cl >= 6;
      });
      
      if (criticalErrors.length > 0) {
        const userErrorMsg = messages.find((msg) => {
          const cl = parseInt(msg.criticalLevel || '0', 10);
          return cl >= 6;
        });
        const errorMsg = userErrorMsg?.caption || criticalErrors[0]?.caption || 'Failed to get app init';
        console.error('getAppInit: Critical error:', errorMsg);
        return {
          success: false,
          error: errorMsg,
          messages: allMessages,
        };
      }
      
      // Check for regular error messages (CL = 1)
      const errorMessages = allMessages.filter((msg) => msg.criticalLevel === '1');
      if (errorMessages.length > 0) {
        const errorMsg = errorMessages[0]?.caption || 'Failed to get app init';
        console.error('getAppInit: Error:', errorMsg);
        return {
          success: false,
          error: errorMsg,
          messages: allMessages,
        };
      }
      
      if (messageName === 'GET_APP_INIT' || messageName === 'GET_T_APP_INIT' || messageName?.includes('APP_INIT')) {
        console.log('getAppInit: Extracting menu captions and permissions...');
        const menuCaptions = extractAppInitMenuCaptions(doc);
        const permissions = extractAppInitPermissions(doc);
        
        console.log('getAppInit: Extracted menu captions:', menuCaptions);
        console.log('getAppInit: Extracted permissions:', permissions);
        
        return {
          success: true,
          data: {
            menuCaptions,
            permissions,
          },
          messages: allMessages,
        };
      }
      
      console.warn('getAppInit: Unexpected message name:', messageName);
      
      throw new Error(`Unexpected message type: ${messageName}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get app init';
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // Remove from pending requests after completion
      pendingRequests.delete(requestKey);
    }
  })();
  
  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
}

/**
 * SET_T_REQUEST_NEW_PASSWORD - Request a new password for a user
 */
export async function requestNewPassword(username: string): Promise<ApiResponse<{ success: boolean }>> {
  const requestKey = `SET_T_REQUEST_NEW_PASSWORD_${username}`;
  
  // If there's already a pending request for this username, return it
  if (pendingRequests.has(requestKey)) {
    console.log('requestNewPassword: Reusing pending request');
    return pendingRequests.get(requestKey);
  }
  
  const requestPromise = (async () => {
    try {
      if (!username || username.trim() === '') {
        return {
          success: false,
          error: 'Username is required',
        };
      }

      const lang = detectLanguage();
      
      // Map language to correct code (German uses "GE" not "DE")
      let langCode = lang.short;
      if (lang.full === 'GERMAN') {
        langCode = 'GE';
      } else if (lang.full === 'ENGLISH') {
        langCode = 'EN';
      }
      
      const xmlPayload = `<?xml version="1.0" encoding="utf-8"?>
<ENVELOPE NAME="PV.ENVELOPE" VERSION="1.00" CREATE="">
  <ENVELOPE_DATA>
    <TOKEN />
    <IPADDRESS />
    <USERAGENT />
    <LANGUAGE>LANGUAGE:${lang.full}</LANGUAGE>
    <ORIGINATOR>PV.TC.WEB.UI</ORIGINATOR>
  </ENVELOPE_DATA>
  <APPLICATION_REQUEST VERSION="1.00" LANGUAGE="${langCode}">
    <BNO_REQUEST VERSION="1.00">
      <BNO_PRODUCTION_MODE>TRUE</BNO_PRODUCTION_MODE>
      <BNO_GROUP>BNO_BASE</BNO_GROUP>
      <BNO_INTERACTION_NAME>SET_T_REQUEST_NEW_PASSWORD</BNO_INTERACTION_NAME>
      <BNO_INTERACTION_VERSION>1.00</BNO_INTERACTION_VERSION>
      <BNO_INTERACTION_MODE>INTERACTION_MODE:CREATE</BNO_INTERACTION_MODE>
      <BNO_PARAMETERS />
    </BNO_REQUEST>
  </APPLICATION_REQUEST>
  <MESSAGE>
    <MESSAGEAREA>
      <DATAFIELDS>
        <ENTITIES>
          <ENTITY NAME="NEW.PASSWORD" VERSION="1.00">
            <SETS>
              <SET SORT="1" SET_ID="" PARENT_SET_ID="" ACTION="">
                <ATTRIBUTEGROUP NAME="NEW.PASSWORD" KEY="" KEYVERSION="">
                  <USERNAME>${username.trim()}</USERNAME>
                </ATTRIBUTEGROUP>
              </SET>
            </SETS>
          </ENTITY>
        </ENTITIES>
      </DATAFIELDS>
    </MESSAGEAREA>
  </MESSAGE>
</ENVELOPE>`;

      console.log('requestNewPassword XML Payload:', xmlPayload);
      const xmlResponse = await makeXMLRequest(xmlPayload);
      console.log('requestNewPassword XML Response:', xmlResponse);
      const doc = parseXML(xmlResponse);
      const messages = getUserMessages(doc);
      
      // Check for success message (critical level 0)
      const successMessages = messages.filter((msg) => 
        msg.criticalLevel === '0' && 
        msg.name === 'KERNEL.INTERACTIONUSEROPERATION.PASSWORD_RESETTED'
      );
      
      if (successMessages.length > 0) {
        return {
          success: true,
          data: { success: true },
          messages,
        };
      }
      
      // Check for error messages (critical level 1)
      const errorMessages = messages.filter((msg) => msg.criticalLevel === '1');
      if (errorMessages.length > 0) {
        return {
          success: false,
          error: errorMessages[0]?.caption || 'Failed to request new password',
          messages,
        };
      }
      
      // If no specific messages, check if there are any messages at all
      if (messages.length > 0) {
        return {
          success: false,
          error: messages[0]?.caption || 'Failed to request new password',
          messages,
        };
      }
      
      return {
        success: false,
        error: 'No response from server',
        messages,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request new password';
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      // Remove from pending requests after completion
      pendingRequests.delete(requestKey);
    }
  })();
  
  pendingRequests.set(requestKey, requestPromise);
  return requestPromise;
}
