/**
 * Theme Service for ServiceExample_Theme plugin
 *
 * This service provides a comprehensive wrapper around BrainDrive's Theme Service Bridge,
 * demonstrating best practices for theme management within the BrainDrive platform.
 *
 * Key Features:
 * - Type-safe theme operations
 * - Automatic theme change detection
 * - Error handling and validation
 * - Educational logging for debugging
 * - Service availability checking
 *
 * Based on the BrainDriveBasicAIChat reference implementation
 */

/**
 * Available theme types in BrainDrive
 */
export type Theme = 'light' | 'dark';

/**
 * Theme change listener callback type
 */
export type ThemeChangeListener = (theme: Theme) => void;

/**
 * Interface for the ThemeService bridge provided by BrainDrive
 *
 * This is the core interface that BrainDrive provides to plugins for theme management.
 * Your plugin receives an implementation of this interface through the services prop.
 */
interface ThemeServiceBridge {
  /**
   * Get the current theme
   * @returns The current theme ('light' or 'dark')
   */
  getCurrentTheme: () => Theme;
  
  /**
   * Set the theme
   * @param theme - The theme to set ('light' or 'dark')
   */
  setTheme?: (theme: Theme) => void;
  
  /**
   * Toggle between light and dark themes
   */
  toggleTheme?: () => void;
  
  /**
   * Add a listener for theme changes
   * @param listener - Function to call when theme changes
   */
  addThemeChangeListener: (listener: ThemeChangeListener) => void;
  
  /**
   * Remove a theme change listener
   * @param listener - The listener function to remove
   */
  removeThemeChangeListener: (listener: ThemeChangeListener) => void;
}

/**
 * Custom error types for Theme Service operations
 */
export class ThemeServiceError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ThemeServiceError';
  }
}

/**
 * Validation utilities for theme operations
 */
class ThemeValidator {
  /**
   * Validate that a theme value is valid
   */
  static validateTheme(theme: any): theme is Theme {
    if (typeof theme !== 'string') {
      console.warn('[ThemeService] Invalid theme: not a string');
      return false;
    }
    
    if (theme !== 'light' && theme !== 'dark') {
      console.warn('[ThemeService] Invalid theme: must be "light" or "dark"');
      return false;
    }
    
    return true;
  }
  
  /**
   * Validate theme change listener
   */
  static validateListener(listener: any): listener is ThemeChangeListener {
    if (typeof listener !== 'function') {
      console.warn('[ThemeService] Invalid listener: must be a function');
      return false;
    }
    
    return true;
  }
}

/**
 * Plugin-specific Theme Service wrapper
 *
 * This class provides a high-level interface for BrainDrive's Theme Service Bridge,
 * automatically handling common patterns and providing educational logging.
 *
 * Key Features:
 * - Automatic plugin identification for all operations
 * - Comprehensive error handling and validation
 * - Educational logging for debugging and learning
 * - Service availability checking
 * - Theme validation and sanitization
 * - Listener management and cleanup
 *
 * Usage Pattern:
 * 1. Create instance with createThemeService(pluginId, moduleId)
 * 2. Set service bridge when services become available
 * 3. Use getCurrentTheme() to get current theme
 * 4. Use setTheme() or toggleTheme() to change themes (if available)
 * 5. Use addThemeChangeListener() to listen for theme changes
 * 6. Always remove listeners in component cleanup
 */
class PluginThemeService {
  private pluginId: string;
  private moduleId: string;
  private serviceBridge?: ThemeServiceBridge;
  private isConnected: boolean = false;
  private listeners: Set<ThemeChangeListener> = new Set();
  private currentTheme: Theme = 'light';
  private operationCount: number = 0;
  
  constructor(pluginId: string, moduleId: string) {
    this.pluginId = pluginId;
    this.moduleId = moduleId;
    
    // Educational logging
    console.log(`[ThemeService] Created service instance for ${pluginId}/${moduleId}`);
  }
  
  /**
   * Set the service bridge (called by the plugin system)
   *
   * This method is called by BrainDrive when the Theme Service becomes available.
   * It's the critical connection point between your plugin and BrainDrive's theme system.
   *
   * @param bridge - The Theme Service Bridge implementation from BrainDrive
   */
  setServiceBridge(bridge: ThemeServiceBridge) {
    if (!bridge) {
      throw new ThemeServiceError('Service bridge cannot be null', 'INVALID_BRIDGE');
    }
    
    this.serviceBridge = bridge;
    this.isConnected = true;
    
    // Get initial theme
    try {
      this.currentTheme = bridge.getCurrentTheme();
    } catch (error) {
      console.warn(`[ThemeService] Failed to get initial theme:`, error);
      this.currentTheme = 'light'; // fallback
    }
    
    // Educational logging
    console.log(`[ThemeService] ✅ Service bridge connected for ${this.pluginId}/${this.moduleId}`);
    console.log(`[ThemeService] 📚 LEARNING: This connection allows your module to manage themes`);
    console.log(`[ThemeService] 📚 LEARNING: Current theme is: ${this.currentTheme}`);
  }
  
  /**
   * Check if the Theme Service is available and connected
   *
   * Always check this before attempting to use theme operations.
   * This is a common pattern in BrainDrive plugin development.
   *
   * @returns true if the service is available, false otherwise
   */
  isServiceAvailable(): boolean {
    const available = this.serviceBridge !== undefined && this.isConnected;
    
    if (!available) {
      console.warn(`[ThemeService] ⚠️ Service not available for ${this.pluginId}/${this.moduleId}`);
      console.log(`[ThemeService] 📚 LEARNING: Check service availability before using theme operations`);
    }
    
    return available;
  }
  
  /**
   * Get the current theme
   *
   * This is the primary method for getting the current theme in BrainDrive.
   * It demonstrates proper error handling and logging patterns.
   *
   * @returns The current theme ('light' or 'dark')
   * @throws ThemeServiceError if service is unavailable
   */
  getCurrentTheme(): Theme {
    // Step 1: Validate service availability
    if (!this.isServiceAvailable()) {
      throw new ThemeServiceError(
        'Theme Service not available. Ensure setServiceBridge() was called.',
        'SERVICE_UNAVAILABLE'
      );
    }
    
    try {
      // Step 2: Get theme from service bridge
      const theme = this.serviceBridge!.getCurrentTheme();
      
      // Step 3: Validate theme
      if (!ThemeValidator.validateTheme(theme)) {
        throw new ThemeServiceError('Invalid theme returned from service', 'INVALID_THEME');
      }
      
      // Step 4: Update cached theme
      this.currentTheme = theme;
      this.operationCount++;
      
      // Step 5: Educational logging
      console.log(`[ThemeService] 🎨 Current theme: ${theme} (operation #${this.operationCount})`);
      console.log(`[ThemeService] 📚 LEARNING: Theme retrieved from BrainDrive's Theme Service`);
      
      return theme;
      
    } catch (error) {
      console.error(`[ThemeService] ❌ Failed to get current theme:`, error);
      
      if (error instanceof ThemeServiceError) {
        throw error;
      }
      
      throw new ThemeServiceError(
        `Failed to get theme: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'GET_THEME_FAILED'
      );
    }
  }
  
  /**
   * Set the theme (if supported by the service)
   *
   * This method demonstrates how to change themes programmatically.
   * Note that not all Theme Service implementations support theme setting.
   *
   * @param theme - The theme to set ('light' or 'dark')
   * @returns Promise that resolves to true if successful, false otherwise
   */
  async setTheme(theme: Theme): Promise<boolean> {
    try {
      // Step 1: Validate service availability
      if (!this.isServiceAvailable()) {
        throw new ThemeServiceError(
          'Theme Service not available. Ensure setServiceBridge() was called.',
          'SERVICE_UNAVAILABLE'
        );
      }
      
      // Step 2: Validate theme
      if (!ThemeValidator.validateTheme(theme)) {
        throw new ThemeServiceError('Invalid theme provided', 'INVALID_THEME');
      }
      
      // Step 3: Check if setting is supported
      if (!this.serviceBridge!.setTheme) {
        throw new ThemeServiceError(
          'Theme setting not supported by this Theme Service implementation',
          'SET_NOT_SUPPORTED'
        );
      }
      
      // Step 4: Educational logging
      console.group(`[ThemeService] 🎨 Setting Theme`);
      console.log(`From: ${this.currentTheme}`);
      console.log(`To: ${theme}`);
      console.log(`Module: ${this.pluginId}/${this.moduleId}`);
      console.log(`📚 LEARNING: Theme will be changed through BrainDrive's Theme Service`);
      console.groupEnd();
      
      // Step 5: Set the theme through the service bridge
      this.serviceBridge!.setTheme(theme);
      this.operationCount++;
      
      // Note: We don't update currentTheme here because the theme change
      // should come through the listener mechanism
      
      return true;
      
    } catch (error) {
      console.error(`[ThemeService] ❌ Failed to set theme:`, error);
      return false;
    }
  }
  
  /**
   * Toggle between light and dark themes (if supported by the service)
   *
   * This method demonstrates how to toggle themes programmatically.
   * It's a convenience method that switches between light and dark.
   *
   * @throws ThemeServiceError if service is unavailable or doesn't support toggling
   */
  toggleTheme(): void {
    // Step 1: Validate service availability
    if (!this.isServiceAvailable()) {
      throw new ThemeServiceError(
        'Theme Service not available. Ensure setServiceBridge() was called.',
        'SERVICE_UNAVAILABLE'
      );
    }
    
    try {
      // Step 2: Use service's toggle if available
      if (this.serviceBridge!.toggleTheme) {
        console.log(`[ThemeService] 🔄 Toggling theme from ${this.currentTheme}`);
        console.log(`[ThemeService] 📚 LEARNING: Using Theme Service's built-in toggle`);
        
        this.serviceBridge!.toggleTheme();
        this.operationCount++;
        
      } else if (this.serviceBridge!.setTheme) {
        // Step 3: Manual toggle using setTheme
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        console.log(`[ThemeService] 🔄 Manual toggle: ${this.currentTheme} → ${newTheme}`);
        console.log(`[ThemeService] 📚 LEARNING: Using manual toggle via setTheme`);
        
        this.setTheme(newTheme);
        
      } else {
        throw new ThemeServiceError(
          'Theme toggling not supported by this Theme Service implementation',
          'TOGGLE_NOT_SUPPORTED'
        );
      }
      
    } catch (error) {
      console.error(`[ThemeService] ❌ Failed to toggle theme:`, error);
      
      if (error instanceof ThemeServiceError) {
        throw error;
      }
      
      throw new ThemeServiceError(
        `Failed to toggle theme: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TOGGLE_THEME_FAILED'
      );
    }
  }
  
  /**
   * Add a theme change listener
   *
   * This method sets up theme change listening for the current module.
   * It demonstrates proper listener patterns and error handling.
   *
   * @param listener - Function to call when theme changes
   * @throws ThemeServiceError if service is unavailable
   */
  addThemeChangeListener(listener: ThemeChangeListener): void {
    // Step 1: Validate service availability
    if (!this.isServiceAvailable()) {
      throw new ThemeServiceError(
        'Theme Service not available. Ensure setServiceBridge() was called.',
        'SERVICE_UNAVAILABLE'
      );
    }
    
    // Step 2: Validate listener
    if (!ThemeValidator.validateListener(listener)) {
      throw new ThemeServiceError('Invalid listener provided', 'INVALID_LISTENER');
    }
    
    try {
      // Step 3: Create enhanced listener with logging (only in development)
      const enhancedListener = (theme: Theme) => {
        // Update cached theme
        this.currentTheme = theme;
        
        // Educational logging (only in development to avoid production noise)
        if (typeof window !== 'undefined' && (window as any).__DEV__) {
          console.group(`[ThemeService] 🎨 Theme Changed`);
          console.log(`Module: ${this.moduleId}`);
          console.log(`New Theme: ${theme}`);
          console.log(`📚 LEARNING: This change was received through the Theme Service Bridge`);
          console.groupEnd();
        }
        
        // Call the original listener
        listener(theme);
      };
      
      // Step 4: Track listener for cleanup
      this.listeners.add(listener); // Track original listener, not enhanced
      
      // Step 5: Educational logging
      console.log(`[ThemeService] 🔔 Adding theme change listener for ${this.moduleId}`);
      console.log(`[ThemeService] 📚 LEARNING: Will receive notifications when theme changes`);
      
      // Step 6: Add listener through the service bridge with original listener
      // Note: Using original listener to avoid double-wrapping issues
      this.serviceBridge!.addThemeChangeListener(listener);
      
    } catch (error) {
      console.error(`[ThemeService] ❌ Failed to add theme change listener:`, error);
      throw new ThemeServiceError(
        `Failed to add listener: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ADD_LISTENER_FAILED'
      );
    }
  }
  
  /**
   * Remove a theme change listener
   *
   * Always call this method in your component's cleanup (componentWillUnmount)
   * to prevent memory leaks and unexpected behavior.
   *
   * @param listener - The listener function to remove
   */
  removeThemeChangeListener(listener: ThemeChangeListener): void {
    if (!this.isServiceAvailable()) {
      console.warn(`[ThemeService] Cannot remove listener: service not available`);
      return;
    }
    
    try {
      // Remove from tracking
      this.listeners.delete(listener);
      
      // Educational logging
      console.log(`[ThemeService] 🔕 Removing theme change listener for ${this.moduleId}`);
      console.log(`[ThemeService] 📚 LEARNING: Always remove listeners in component cleanup to prevent memory leaks`);
      
      // Remove listener through the service bridge
      this.serviceBridge!.removeThemeChangeListener(listener);
      
    } catch (error) {
      console.error(`[ThemeService] ❌ Failed to remove theme change listener:`, error);
    }
  }
  
  /**
   * Remove all theme change listeners (cleanup helper)
   *
   * Call this method when your component is being destroyed to ensure
   * all listeners are properly cleaned up.
   */
  removeAllListeners(): void {
    console.log(`[ThemeService] 🧹 Cleaning up all theme listeners for ${this.moduleId}`);
    
    this.listeners.forEach(listener => {
      try {
        this.serviceBridge?.removeThemeChangeListener(listener);
      } catch (error) {
        console.warn(`[ThemeService] Failed to remove listener:`, error);
      }
    });
    
    this.listeners.clear();
    console.log(`[ThemeService] 📚 LEARNING: All theme listeners cleaned up - no memory leaks!`);
  }
  
  /**
   * Get service statistics for debugging and learning
   *
   * This method provides insights into the service usage, helpful for
   * debugging and understanding theme operation patterns.
   */
  getServiceStats() {
    return {
      pluginId: this.pluginId,
      moduleId: this.moduleId,
      isConnected: this.isConnected,
      currentTheme: this.currentTheme,
      operationsPerformed: this.operationCount,
      activeListeners: this.listeners.size,
      serviceBridgeAvailable: !!this.serviceBridge,
      supportsSetTheme: !!(this.serviceBridge?.setTheme),
      supportsToggleTheme: !!(this.serviceBridge?.toggleTheme)
    };
  }
  
  /**
   * Get available themes
   *
   * Returns the list of available themes. For now, this is hardcoded to light/dark
   * but could be extended to support more themes in the future.
   *
   * @returns Array of available theme names
   */
  getAvailableThemes(): Theme[] {
    console.log(`[ThemeService] 📚 LEARNING: Available themes: light, dark`);
    return ['light', 'dark'];
  }
  
  /**
   * Convenience method for theme change listening (matches component expectations)
   *
   * This method provides a more convenient API for setting up theme change listeners
   * and returns a cleanup function.
   *
   * @param callback - Function to call when theme changes (receives newTheme, previousTheme)
   * @returns Cleanup function to remove the listener
   */
  onThemeChange(callback: (newTheme: Theme, previousTheme?: Theme) => void): () => void {
    if (!this.isServiceAvailable()) {
      throw new ThemeServiceError(
        'Theme Service not available. Ensure setServiceBridge() was called.',
        'SERVICE_UNAVAILABLE'
      );
    }
    
    let previousTheme = this.currentTheme;
    
    const listener: ThemeChangeListener = (newTheme: Theme) => {
      const oldTheme = previousTheme;
      previousTheme = newTheme;
      callback(newTheme, oldTheme);
    };
    
    this.addThemeChangeListener(listener);
    
    // Return cleanup function
    return () => {
      this.removeThemeChangeListener(listener);
    };
  }
  
  
  /**
   * Create a new instance for a different module
   *
   * This is useful when you need to manage themes from different module contexts
   * within the same plugin.
   *
   * @param moduleId - The ID of the new module
   * @returns A new PluginThemeService instance
   */
  forModule(moduleId: string): PluginThemeService {
    const service = new PluginThemeService(this.pluginId, moduleId);
    
    // Share the service bridge if available
    if (this.serviceBridge) {
      service.setServiceBridge(this.serviceBridge);
    }
    
    console.log(`[ThemeService] 📚 LEARNING: Created new service instance for module ${moduleId}`);
    return service;
  }
}

/**
 * Factory function to create PluginThemeService instances
 *
 * This is the recommended way to create Theme Service instances in your components.
 * Each component should create its own instance with a unique module ID.
 *
 * @param pluginId - The ID of your plugin (should match lifecycle manager)
 * @param moduleId - A unique ID for this module/component
 * @returns A new PluginThemeService instance
 *
 * @example
 * ```typescript
 * // In your component
 * const themeService = createThemeService('ServiceExample_Theme', 'theme-display');
 *
 * // In componentDidMount or useEffect
 * if (props.services?.theme) {
 *   themeService.setServiceBridge(props.services.theme);
 * }
 * ```
 */
export const createThemeService = (pluginId: string, moduleId: string): PluginThemeService => {
  console.log(`[ThemeService] 📚 LEARNING: Creating Theme Service for ${pluginId}/${moduleId}`);
  console.log(`[ThemeService] 📚 LEARNING: Remember to call setServiceBridge() when services become available`);
  
  return new PluginThemeService(pluginId, moduleId);
};

/**
 * Default Theme Service instance for the ServiceExample_Theme plugin
 *
 * This is a convenience export for simple use cases. For most components,
 * you should create your own instance using createThemeService().
 *
 * @example
 * ```typescript
 * import { defaultThemeService } from './services/themeService';
 * 
 * // Set up the service bridge
 * if (props.services?.theme) {
 *   defaultThemeService.setServiceBridge(props.services.theme);
 * }
 * ```
 */
export const defaultThemeService = createThemeService('ServiceExample_Theme', 'default');

/**
 * Educational function that logs Theme Service concepts
 *
 * This function provides educational information about the Theme Service Bridge.
 * Call it during development to learn about theme management patterns.
 */
export const logThemeServiceConcepts = () => {
  console.group('📚 BrainDrive Theme Service Bridge - Educational Overview');
  
  console.log('🎨 THEME MANAGEMENT:');
  console.log('  • Theme Service manages light/dark theme switching');
  console.log('  • Themes are applied globally across the BrainDrive interface');
  console.log('  • Plugins can read current theme and listen for changes');
  console.log('  • Some implementations allow plugins to change themes');
  
  console.log('🔧 SERVICE BRIDGE PATTERN:');
  console.log('  • BrainDrive provides Theme Service through props.services.theme');
  console.log('  • Always check service availability before use');
  console.log('  • Use setServiceBridge() to connect your wrapper to BrainDrive');
  console.log('  • Handle errors gracefully when service is unavailable');
  
  console.log('🎯 BEST PRACTICES:');
  console.log('  • Create one service instance per component/module');
  console.log('  • Always remove theme change listeners in cleanup');
  console.log('  • Validate themes before using them');
  console.log('  • Use educational logging during development');
  console.log('  • Handle both read-only and read-write theme services');
  
  console.log('🔄 THEME CHANGE FLOW:');
  console.log('  • User or plugin triggers theme change');
  console.log('  • BrainDrive updates global theme');
  console.log('  • Theme Service notifies all listeners');
  console.log('  • Components update their appearance');
  
  console.log('⚠️ COMMON PITFALLS:');
  console.log('  • Forgetting to remove listeners (memory leaks)');
  console.log('  • Not checking service availability');
  console.log('  • Assuming all services support theme setting');
  console.log('  • Not handling theme validation errors');
  
  console.groupEnd();
};

/**
 * Export all types and utilities for external use
 */
export type { ThemeServiceBridge };
export { ThemeValidator };