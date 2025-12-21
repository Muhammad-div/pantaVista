/**
 * Text/Localization Service
 * Handles UI text data from GET_APP_INIT response and provides localization functionality
 */

import type { UIText } from '../types/appInit';

class TextService {
  private textMap: Map<string, string> = new Map();
  private initialized = false;

  /**
   * Initialize the text service with UI text data
   */
  initialize(uiTexts: UIText[]): void {
    this.textMap.clear();
    
    uiTexts.forEach(text => {
      this.textMap.set(text.name, text.caption);
    });
    
    this.initialized = true;
    console.log('TextService: Initialized with', uiTexts.length, 'text entries');
  }

  /**
   * Get localized text by key
   * @param key - The text key (e.g., "WINDOW.TITLE", "LABEL:STOREINFORMATION")
   * @param fallback - Fallback text if key is not found
   * @param params - Parameters to replace in the text (e.g., ##DISPLAYNAME##)
   */
  getText(key: string, fallback?: string, params?: Record<string, string>): string {
    if (!this.initialized) {
      console.warn('TextService: Not initialized, returning fallback or key');
      return fallback || key;
    }

    let text = this.textMap.get(key) || fallback || key;

    // Replace parameters if provided
    if (params && Object.keys(params).length > 0) {
      text = this.replaceParameters(text, params);
    }

    return text;
  }

  /**
   * Check if a text key exists
   */
  hasText(key: string): boolean {
    return this.textMap.has(key);
  }

  /**
   * Get all available text keys
   */
  getAvailableKeys(): string[] {
    return Array.from(this.textMap.keys());
  }

  /**
   * Get texts by category/prefix
   * @param prefix - Text key prefix (e.g., "WINDOW.", "LABEL:", "MESSAGE.")
   */
  getTextsByPrefix(prefix: string): Array<{ key: string; text: string }> {
    const results: Array<{ key: string; text: string }> = [];
    
    for (const [key, text] of this.textMap.entries()) {
      if (key.startsWith(prefix)) {
        results.push({ key, text });
      }
    }
    
    return results.sort((a, b) => a.key.localeCompare(b.key));
  }

  /**
   * Get window titles
   */
  getWindowTitles(): Array<{ key: string; title: string }> {
    return this.getTextsByPrefix('WINDOW.TITLE').map(item => ({
      key: item.key,
      title: item.text
    }));
  }

  /**
   * Get window headers
   */
  getWindowHeaders(): Array<{ key: string; header: string }> {
    return this.getTextsByPrefix('WINDOW.HEADER').map(item => ({
      key: item.key,
      header: item.text
    }));
  }

  /**
   * Get labels
   */
  getLabels(): Array<{ key: string; label: string }> {
    return this.getTextsByPrefix('LABEL:').map(item => ({
      key: item.key,
      label: item.text
    }));
  }

  /**
   * Get messages
   */
  getMessages(): Array<{ key: string; message: string }> {
    return this.getTextsByPrefix('MESSAGE.').map(item => ({
      key: item.key,
      message: item.text
    }));
  }

  /**
   * Get communication channel texts
   */
  getCommChannelTexts(): Array<{ key: string; text: string }> {
    return this.getTextsByPrefix('COMCHANNEL.').map(item => ({
      key: item.key,
      text: item.text
    }));
  }

  /**
   * Get map-related texts
   */
  getMapTexts(): Array<{ key: string; text: string }> {
    return this.getTextsByPrefix('MAP.').map(item => ({
      key: item.key,
      text: item.text
    }));
  }

  /**
   * Replace parameters in text (e.g., ##DISPLAYNAME##, ##STARTDATE##)
   */
  private replaceParameters(text: string, params: Record<string, string>): string {
    let result = text;
    
    for (const [key, value] of Object.entries(params)) {
      const placeholder = `##${key.toUpperCase()}##`;
      result = result.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return result;
  }

  /**
   * Format delete confirmation message
   */
  getDeleteConfirmation(itemName?: string): string {
    if (itemName) {
      return this.getText('MESSAGE.DELETE:OM', 'The person ##DISPLAYNAME## will be deleted permanently. Do you want to continue?', {
        DISPLAYNAME: itemName
      });
    } else {
      return this.getText('MESSAGE.DELETE:GENERAL', 'The record will be deleted permanently. Do you want to continue?');
    }
  }

  /**
   * Format communication channel tooltip
   */
  getCommChannelTooltip(
    status: 'GREEN' | 'LIGHTGREEN' | 'YELLOW' | 'RED' | 'NOTADDED' | 'NONE',
    isActive: boolean,
    params?: { comData?: string; comChannel?: string; startDate?: string; endDate?: string }
  ): string {
    const activePrefix = isActive ? 'ACTIVE' : 'INACTIVE';
    const key = `COMCHANNEL.TOOLTIP.${activePrefix}:${status}`;
    
    if (status === 'NONE') {
      return this.getText('COMCHANNEL.TOOLTIP:NONE', 'This channel is currently not available.');
    }
    
    return this.getText(key, `Communication channel status: ${status}`, params);
  }

  /**
   * Clear all stored texts
   */
  clear(): void {
    this.textMap.clear();
    this.initialized = false;
  }

  /**
   * Get initialization status
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get statistics about loaded texts
   */
  getStats(): {
    totalTexts: number;
    windowTitles: number;
    windowHeaders: number;
    labels: number;
    messages: number;
    commChannelTexts: number;
    mapTexts: number;
  } {
    return {
      totalTexts: this.textMap.size,
      windowTitles: this.getWindowTitles().length,
      windowHeaders: this.getWindowHeaders().length,
      labels: this.getLabels().length,
      messages: this.getMessages().length,
      commChannelTexts: this.getCommChannelTexts().length,
      mapTexts: this.getMapTexts().length,
    };
  }
}

// Export a singleton instance
export const textService = new TextService();

// Export the class for testing or multiple instances if needed
export { TextService };

// Export types (UIText is already exported from xmlParser)

/**
 * React hook for using the text service
 */
export function useTextService() {
  return textService;
}

/**
 * React hook for getting localized text
 */
export function useText(key: string, fallback?: string, params?: Record<string, string>): string {
  return textService.getText(key, fallback, params);
}
