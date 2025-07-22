import React from 'react';
import { Services } from '../types';
import '../styles/theme-example.css';

/**
 * ThemeController Component
 * 
 * Compact demonstration of Theme Service Bridge theme switching.
 * Provides interactive controls to change themes with real-time feedback.
 */

interface ThemeControllerProps {
  services?: Services;
}

interface ThemeControllerState {
  currentTheme: string;
  availableThemes: string[];
  isServiceConnected: boolean;
  isChangingTheme: boolean;
  lastChangeResult: string;
  error: string;
  changeCount: number;
}

class ThemeController extends React.Component<ThemeControllerProps, ThemeControllerState> {
  private themeChangeListener: ((theme: string) => void) | null = null;

  constructor(props: ThemeControllerProps) {
    super(props);
    
    this.state = {
      currentTheme: 'light',
      availableThemes: ['light', 'dark'],
      isServiceConnected: false,
      isChangingTheme: false,
      lastChangeResult: '',
      error: '',
      changeCount: 0
    };
  }

  componentDidMount() {
    this.initializeThemeService();
  }

  componentDidUpdate(prevProps: ThemeControllerProps) {
    if (prevProps.services?.theme !== this.props.services?.theme) {
      this.initializeThemeService();
    }
  }

  componentWillUnmount() {
    this.cleanup();
  }

  cleanup = () => {
    try {
      if (this.themeChangeListener && this.props.services?.theme) {
        this.props.services.theme.removeThemeChangeListener(this.themeChangeListener);
        this.themeChangeListener = null;
      }
    } catch (error) {
      console.warn('[ThemeController] Error during cleanup:', error);
    }
  };

  initializeThemeService = () => {
    this.cleanup();
    
    try {
      // BEST PRACTICE: Always validate props before using services
      if (!this.props.services) {
        throw new Error('Services not provided to component');
      }
      
      if (!this.props.services.theme) {
        // This is normal during initialization
        this.setState({
          isServiceConnected: false,
          lastChangeResult: '⏳ Waiting for Theme Service to become available...',
          error: ''
        });
        console.log('[ThemeController] 📚 LEARNING: Theme Service not yet available - normal during startup');
        return;
      }
      
      // BEST PRACTICE: Validate required service methods
      const requiredMethods = ['getCurrentTheme', 'addThemeChangeListener', 'removeThemeChangeListener'];
      for (const method of requiredMethods) {
        if (typeof (this.props.services.theme as any)[method] !== 'function') {
          throw new Error(`Theme Service missing required method: ${method}`);
        }
      }
      
      // Get current theme with validation
      let currentTheme: string;
      try {
        currentTheme = this.props.services.theme.getCurrentTheme();
        console.log('[ThemeController] 📚 LEARNING: Current theme retrieved:', currentTheme);
        
        // BEST PRACTICE: Validate returned theme value
        if (typeof currentTheme !== 'string' || !['light', 'dark'].includes(currentTheme)) {
          console.warn('[ThemeController] ⚠️ Unexpected theme value:', currentTheme);
          currentTheme = 'light'; // fallback to safe default
        }
      } catch (themeError) {
        console.error('[ThemeController] ❌ Failed to get current theme:', themeError);
        throw new Error(`Failed to get current theme: ${themeError instanceof Error ? themeError.message : 'Unknown error'}`);
      }
      
      // Set up theme change listener with comprehensive error handling
      this.themeChangeListener = (newTheme: string) => {
        try {
          console.log('[ThemeController] 🎨 Theme change received:', newTheme);
          console.log('[ThemeController] 📚 LEARNING: Theme change listener called successfully');
          
          // BEST PRACTICE: Validate listener data
          if (typeof newTheme !== 'string') {
            console.error('[ThemeController] ❌ Invalid theme received in listener:', typeof newTheme, newTheme);
            return;
          }
          
          if (!['light', 'dark'].includes(newTheme)) {
            console.warn('[ThemeController] ⚠️ Unexpected theme value in listener:', newTheme);
          }
          
          this.setState({
            currentTheme: newTheme,
            lastChangeResult: `✅ Theme changed to ${newTheme}`,
            error: '' // Clear any previous errors
          });
          
        } catch (listenerError) {
          console.error('[ThemeController] ❌ Error in theme change listener:', listenerError);
          this.setState({
            error: `Theme listener error: ${listenerError instanceof Error ? listenerError.message : 'Unknown error'}`,
            lastChangeResult: '❌ Error processing theme change'
          });
        }
      };
      
      // Add listener with error handling
      try {
        this.props.services.theme.addThemeChangeListener(this.themeChangeListener);
        console.log('[ThemeController] 📚 LEARNING: Theme change listener added successfully');
      } catch (listenerError) {
        console.error('[ThemeController] ❌ Failed to add theme listener:', listenerError);
        throw new Error(`Failed to add theme listener: ${listenerError instanceof Error ? listenerError.message : 'Unknown error'}`);
      }
      
      this.setState({
        currentTheme,
        availableThemes: ['light', 'dark'], // BEST PRACTICE: Could be made dynamic in future
        isServiceConnected: true,
        lastChangeResult: '✅ Theme Service connected and ready',
        error: ''
      });
      
      console.log('[ThemeController] ✅ Theme Service Bridge successfully initialized');
      console.log('[ThemeController] 📚 LEARNING: All validation and error handling checks passed');
      
    } catch (error) {
      console.error('[ThemeController] ❌ Failed to initialize Theme Service:', error);
      console.log('[ThemeController] 📚 LEARNING: Comprehensive error handling prevents component crashes');
      
      // BEST PRACTICE: Detailed error reporting for debugging
      let errorMessage = 'Theme Service initialization failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      this.setState({
        isServiceConnected: false,
        lastChangeResult: `❌ ${errorMessage}`,
        error: errorMessage
      });
      
      // BEST PRACTICE: Detailed error logging for developers
      console.group('[ThemeController] 🐛 Initialization Error Details');
      console.log('Error:', error);
      console.log('Services Available:', !!this.props.services);
      console.log('Theme Service Available:', !!this.props.services?.theme);
      console.log('Component State:', this.state);
      console.groupEnd();
    }
  };

  handleThemeToggle = async () => {
    if (!this.state.isServiceConnected || !this.props.services?.theme) {
      this.setState({ 
        lastChangeResult: '❌ Theme Service not connected',
        error: 'Service not available'
      });
      return;
    }

    const newTheme = this.state.currentTheme === 'light' ? 'dark' : 'light';
    await this.changeTheme(newTheme);
  };

  handleThemeSelect = async (theme: string) => {
    if (!this.state.isServiceConnected || !this.props.services?.theme) {
      this.setState({ 
        lastChangeResult: '❌ Theme Service not connected',
        error: 'Service not available'
      });
      return;
    }

    await this.changeTheme(theme);
  };

  changeTheme = async (newTheme: string) => {
    // BEST PRACTICE: Validate input parameters
    if (typeof newTheme !== 'string') {
      const errorMsg = `Invalid theme parameter: expected string, got ${typeof newTheme}`;
      console.error('[ThemeController] ❌', errorMsg);
      this.setState({
        lastChangeResult: `❌ ${errorMsg}`,
        error: errorMsg
      });
      return;
    }
    
    if (!['light', 'dark'].includes(newTheme)) {
      const errorMsg = `Unsupported theme: ${newTheme}. Supported themes: light, dark`;
      console.warn('[ThemeController] ⚠️', errorMsg);
      this.setState({
        lastChangeResult: `❌ ${errorMsg}`,
        error: errorMsg
      });
      return;
    }

    this.setState({
      isChangingTheme: true,
      lastChangeResult: `⏳ Changing theme to ${newTheme}...`,
      error: ''
    });

    try {
      console.log(`[ThemeController] 🎨 Attempting to change theme to: ${newTheme}`);
      
      // BEST PRACTICE: Validate service availability before operations
      if (!this.props.services?.theme) {
        throw new Error('Theme Service not available');
      }
      
      // BEST PRACTICE: Check if theme changing is supported
      if (!('setTheme' in this.props.services.theme)) {
        throw new Error('Theme changing not supported - setTheme method not available');
      }
      
      // BEST PRACTICE: Validate method type
      if (typeof (this.props.services.theme as any).setTheme !== 'function') {
        throw new Error('setTheme is not a function');
      }
      
      // BEST PRACTICE: Don't change to the same theme
      if (newTheme === this.state.currentTheme) {
        console.log('[ThemeController] 📚 LEARNING: Theme is already set to', newTheme);
        this.setState({
          isChangingTheme: false,
          lastChangeResult: `ℹ️ Theme is already ${newTheme}`,
          error: ''
        });
        return;
      }
      
      // Attempt theme change with timeout protection
      const changePromise = new Promise<void>((resolve, reject) => {
        try {
          (this.props.services!.theme as any).setTheme(newTheme);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
      
      // BEST PRACTICE: Add timeout to prevent hanging operations
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Theme change timeout after 5 seconds')), 5000);
      });
      
      await Promise.race([changePromise, timeoutPromise]);
      
      this.setState({
        isChangingTheme: false,
        lastChangeResult: `✅ Theme change requested: ${newTheme}`,
        changeCount: this.state.changeCount + 1,
        error: ''
      });
      
      console.log(`[ThemeController] ✅ Theme change request completed: ${newTheme}`);
      console.log('[ThemeController] 📚 LEARNING: Theme change will be confirmed via listener');
      
    } catch (error) {
      console.error('[ThemeController] ❌ Error changing theme:', error);
      console.log('[ThemeController] 📚 LEARNING: Proper error handling provides user feedback');
      
      // BEST PRACTICE: Provide specific error messages based on error type
      let errorMessage = 'Failed to change theme';
      let userFriendlyMessage = errorMessage;
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide user-friendly messages for common errors
        if (errorMessage.includes('not available')) {
          userFriendlyMessage = 'Theme service is not currently available';
        } else if (errorMessage.includes('not supported')) {
          userFriendlyMessage = 'Theme changing is not supported by this service';
        } else if (errorMessage.includes('timeout')) {
          userFriendlyMessage = 'Theme change request timed out';
        } else {
          userFriendlyMessage = errorMessage;
        }
      }
      
      this.setState({
        isChangingTheme: false,
        lastChangeResult: `❌ ${userFriendlyMessage}`,
        error: errorMessage
      });
      
      // BEST PRACTICE: Detailed error logging for debugging
      console.group('[ThemeController] 🐛 Theme Change Error Details');
      console.log('Requested Theme:', newTheme);
      console.log('Current Theme:', this.state.currentTheme);
      console.log('Error:', error);
      console.log('Service Available:', !!this.props.services?.theme);
      console.log('setTheme Available:', !!(this.props.services?.theme && 'setTheme' in this.props.services.theme));
      console.groupEnd();
    }
  };

  getThemeIcon = (theme: string): string => {
    return theme === 'light' ? '☀️' : '🌙';
  };

  getResultStatusType = (result: string): string => {
    if (result.includes('❌')) return 'theme-status-error';
    if (result.includes('✅')) return 'theme-status-success';
    if (result.includes('⏳')) return 'theme-status-warning';
    return 'theme-status-info';
  };

  render() {
    const { 
      currentTheme, 
      availableThemes, 
      isServiceConnected, 
      isChangingTheme, 
      lastChangeResult, 
      error,
      changeCount 
    } = this.state;

    return (
      <div className={`${currentTheme === 'dark' ? 'dark-theme' : ''}`} style={{ padding: '16px', maxWidth: '400px' }}>
        <div className="theme-paper" style={{ padding: '16px' }}>
          {/* Header */}
          <div className="theme-flex theme-flex-between" style={{ marginBottom: '12px' }}>
            <h3 className="theme-subtitle" style={{ margin: 0, fontSize: '16px' }}>
              🎛️ Theme Controller Component
            </h3>
            <div className="theme-flex theme-flex-center theme-flex-gap-sm">
              <div 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isServiceConnected ? 'var(--status-success-color)' : 'var(--status-error-color)'
                }}
              />
              <span className="theme-text-muted" style={{ fontSize: '10px' }}>
                {isServiceConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Current Theme Display */}
          <div className="theme-paper" style={{ 
            textAlign: 'center', 
            marginBottom: '12px',
            padding: '12px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ fontSize: '2rem', marginRight: '0.5rem' }}>
                {this.getThemeIcon(currentTheme)}
              </span>
            </div>
            <div style={{ 
              fontSize: '16px',
              fontWeight: 'bold',
              color: currentTheme === 'dark' ? 'var(--status-info-color)' : 'var(--status-success-color)',
              marginBottom: '4px'
            }}>
              Current: {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} Theme
            </div>
            <div className="theme-text-muted" style={{ fontSize: '10px' }}>
              Changes made: {changeCount}
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="theme-paper" style={{ marginBottom: '12px', padding: '12px' }}>
            <h4 className="theme-subtitle" style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              Quick Theme Toggle
            </h4>
            <div className="theme-flex theme-flex-center" style={{ marginBottom: '8px' }}>
              <div className="theme-toggle">
                <input
                  type="checkbox"
                  id="theme-toggle"
                  className="theme-toggle-input"
                  checked={currentTheme === 'dark'}
                  onChange={this.handleThemeToggle}
                  disabled={!isServiceConnected || isChangingTheme}
                />
                <label htmlFor="theme-toggle" className="theme-toggle-label">
                  <div className="theme-toggle-slider"></div>
                  <span className="theme-toggle-text" style={{ fontSize: '12px' }}>
                    {currentTheme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </label>
              </div>
            </div>
            <div className="theme-text-muted" style={{ textAlign: 'center', fontSize: '10px' }}>
              Toggle between light and dark themes
            </div>
          </div>

          {/* Theme Selection Buttons */}
          <div className="theme-paper" style={{ marginBottom: '12px', padding: '12px' }}>
            <h4 className="theme-subtitle" style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              Theme Selection
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {availableThemes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => this.handleThemeSelect(theme)}
                  disabled={!isServiceConnected || isChangingTheme || theme === currentTheme}
                  className={`theme-button ${
                    theme === currentTheme 
                      ? 'theme-button-success' 
                      : theme === 'dark' 
                        ? 'theme-button-secondary' 
                        : 'theme-button-primary'
                  }`}
                  style={{ 
                    minHeight: '50px',
                    flexDirection: 'column',
                    gap: '4px',
                    fontSize: '12px',
                    padding: '8px'
                  }}
                  title={`Switch to ${theme} theme`}
                >
                  <span style={{ fontSize: '1.2rem' }}>
                    {this.getThemeIcon(theme)}
                  </span>
                  <span>
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </span>
                  {theme === currentTheme && (
                    <span style={{ fontSize: '9px', opacity: 0.7 }}>
                      (Current)
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Status Display */}
          <div style={{ marginBottom: '12px' }}>
            <div className={`theme-status ${this.getResultStatusType(lastChangeResult)}`} style={{ fontSize: '11px', padding: '6px 8px' }}>
              {isChangingTheme && (
                <span style={{ marginRight: '4px' }}>⏳</span>
              )}
              {lastChangeResult}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div style={{
              marginBottom: '12px',
              padding: '8px',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              borderRadius: '4px',
              fontSize: '11px'
            }}>
              <strong style={{ color: 'var(--status-error-color)' }}>Error:</strong>
              <div style={{ color: 'var(--status-error-color)', marginTop: '4px' }}>{error}</div>
            </div>
          )}

          {/* Educational Footer */}
          <div style={{
            padding: '6px',
            backgroundColor: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)',
            borderRadius: '4px',
            fontSize: '9px',
            textAlign: 'center'
          }}>
            <span 
              title="This component demonstrates theme switching using the Theme Service Bridge. Use the toggle or buttons to change themes and see immediate visual feedback."
              style={{ cursor: 'help' }}
            >
              📚 Theme Control Demo - Hover for details
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default ThemeController;