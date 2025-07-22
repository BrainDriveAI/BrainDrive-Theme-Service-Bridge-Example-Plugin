import React from 'react';
import { Services } from '../types';
import '../styles/theme-example.css';

/**
 * ThemeDisplay Component
 * 
 * Compact demonstration of Theme Service Bridge information display.
 * Shows current theme with real-time updates and service status.
 */

interface ThemeDisplayProps {
  services?: Services;
}

interface ThemeDisplayState {
  currentTheme: string;
  status: string;
  isServiceConnected: boolean;
  error: string;
}

class ThemeDisplay extends React.Component<ThemeDisplayProps, ThemeDisplayState> {
  private themeChangeListener: ((theme: string) => void) | null = null;

  constructor(props: ThemeDisplayProps) {
    super(props);
    
    this.state = {
      currentTheme: 'light',
      status: 'Initializing Theme Service...',
      isServiceConnected: false,
      error: ''
    };
  }

  componentDidMount() {
    this.initializeThemeService();
  }

  componentDidUpdate(prevProps: ThemeDisplayProps) {
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
      console.warn('[ThemeDisplay] Error during cleanup:', error);
    }
  };

  initializeThemeService = () => {
    this.cleanup();
    
    try {
      // BEST PRACTICE: Always check if services are available before using them
      if (!this.props.services) {
        throw new Error('Services not provided to component');
      }
      
      if (!this.props.services.theme) {
        // This is normal during initialization - service may not be ready yet
        this.setState({
          status: '⏳ Waiting for Theme Service to become available...',
          isServiceConnected: false,
          error: ''
        });
        console.log('[ThemeDisplay] 📚 LEARNING: Theme Service not yet available - this is normal during startup');
        return;
      }
      
      // BEST PRACTICE: Validate service methods before calling them
      if (typeof this.props.services.theme.getCurrentTheme !== 'function') {
        throw new Error('Theme Service missing getCurrentTheme method');
      }
      
      if (typeof this.props.services.theme.addThemeChangeListener !== 'function') {
        throw new Error('Theme Service missing addThemeChangeListener method');
      }
      
      // Get current theme with error handling
      let currentTheme: string;
      try {
        currentTheme = this.props.services.theme.getCurrentTheme();
        console.log('[ThemeDisplay] 📚 LEARNING: Successfully retrieved current theme:', currentTheme);
      } catch (themeError) {
        console.error('[ThemeDisplay] ❌ Failed to get current theme:', themeError);
        throw new Error(`Failed to get current theme: ${themeError instanceof Error ? themeError.message : 'Unknown error'}`);
      }
      
      // Set up theme change listener with error handling
      this.themeChangeListener = (newTheme: string) => {
        try {
          console.log('[ThemeDisplay] 🎨 Theme changed to:', newTheme);
          console.log('[ThemeDisplay] 📚 LEARNING: Theme change received through listener');
          
          // BEST PRACTICE: Validate received data
          if (typeof newTheme !== 'string') {
            console.warn('[ThemeDisplay] ⚠️ Invalid theme received:', newTheme);
            return;
          }
          
          this.setState({
            currentTheme: newTheme,
            status: `✅ Theme updated to ${newTheme}`
          });
        } catch (listenerError) {
          console.error('[ThemeDisplay] ❌ Error in theme change listener:', listenerError);
          this.setState({
            error: `Theme listener error: ${listenerError instanceof Error ? listenerError.message : 'Unknown error'}`
          });
        }
      };
      
      // Add listener with error handling
      try {
        this.props.services.theme.addThemeChangeListener(this.themeChangeListener);
        console.log('[ThemeDisplay] 📚 LEARNING: Theme change listener successfully added');
      } catch (listenerError) {
        console.error('[ThemeDisplay] ❌ Failed to add theme listener:', listenerError);
        throw new Error(`Failed to add theme listener: ${listenerError instanceof Error ? listenerError.message : 'Unknown error'}`);
      }
      
      this.setState({
        currentTheme,
        status: '✅ Theme Service connected and ready',
        isServiceConnected: true,
        error: ''
      });
      
      console.log('[ThemeDisplay] ✅ Theme Service Bridge successfully initialized');
      console.log('[ThemeDisplay] 📚 LEARNING: All error handling checks passed');
      
    } catch (error) {
      console.error('[ThemeDisplay] ❌ Failed to initialize Theme Service:', error);
      console.log('[ThemeDisplay] 📚 LEARNING: This error handling prevents component crashes');
      
      // BEST PRACTICE: Provide detailed error information for debugging
      let errorMessage = 'Theme Service initialization failed';
      let errorDetails = '';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.stack || '';
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      this.setState({
        status: `❌ ${errorMessage}`,
        isServiceConnected: false,
        error: errorMessage
      });
      
      // BEST PRACTICE: Log detailed error for developers
      console.group('[ThemeDisplay] 🐛 Error Details');
      console.log('Error Message:', errorMessage);
      console.log('Error Details:', errorDetails);
      console.log('Component Props:', this.props);
      console.groupEnd();
    }
  };

  handleRefresh = () => {
    // BEST PRACTICE: Always validate state before performing operations
    if (!this.state.isServiceConnected) {
      const errorMsg = 'Cannot refresh - Theme Service not connected';
      this.setState({
        status: `❌ ${errorMsg}`,
        error: errorMsg
      });
      console.log('[ThemeDisplay] 📚 LEARNING: Always check connection state before service calls');
      return;
    }

    // BEST PRACTICE: Validate service availability before calling methods
    if (!this.props.services?.theme) {
      const errorMsg = 'Theme Service no longer available';
      this.setState({
        status: `❌ ${errorMsg}`,
        error: errorMsg
      });
      console.log('[ThemeDisplay] 📚 LEARNING: Services can become unavailable, always check');
      return;
    }

    try {
      console.log('[ThemeDisplay] 🔄 Refreshing theme information...');
      
      // BEST PRACTICE: Validate method exists before calling
      if (typeof this.props.services.theme.getCurrentTheme !== 'function') {
        throw new Error('getCurrentTheme method not available');
      }
      
      const currentTheme = this.props.services.theme.getCurrentTheme();
      
      // BEST PRACTICE: Validate returned data
      if (typeof currentTheme !== 'string') {
        throw new Error(`Invalid theme returned: ${typeof currentTheme}`);
      }
      
      this.setState({
        currentTheme,
        status: `✅ Theme refreshed - Current: ${currentTheme}`,
        error: ''
      });
      
      console.log('[ThemeDisplay] ✅ Theme refresh successful:', currentTheme);
      console.log('[ThemeDisplay] 📚 LEARNING: Always validate returned data from services');
      
    } catch (error) {
      console.error('[ThemeDisplay] ❌ Failed to refresh theme:', error);
      console.log('[ThemeDisplay] 📚 LEARNING: Proper error handling prevents UI crashes');
      
      // BEST PRACTICE: Provide user-friendly error messages
      let errorMessage = 'Failed to refresh theme';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      this.setState({
        status: `❌ ${errorMessage}`,
        error: errorMessage
      });
      
      // BEST PRACTICE: Log detailed error information for debugging
      console.group('[ThemeDisplay] 🐛 Refresh Error Details');
      console.log('Error:', error);
      console.log('Service Available:', !!this.props.services?.theme);
      console.log('Connection State:', this.state.isServiceConnected);
      console.groupEnd();
    }
  };

  getThemeIcon = (theme: string): string => {
    return theme === 'light' ? '☀️' : '🌙';
  };

  getStatusType = (status: string): string => {
    if (status.includes('❌')) return 'theme-status-error';
    if (status.includes('✅')) return 'theme-status-success';
    if (status.includes('⏳')) return 'theme-status-warning';
    return 'theme-status-info';
  };

  render() {
    const { currentTheme, status, isServiceConnected, error } = this.state;

    return (
      <div className={`${currentTheme === 'dark' ? 'dark-theme' : ''}`} style={{ padding: '16px', maxWidth: '400px' }}>
        <div className="theme-paper" style={{ padding: '16px' }}>
          {/* Header */}
          <div className="theme-flex theme-flex-between" style={{ marginBottom: '12px' }}>
            <h3 className="theme-subtitle" style={{ margin: 0, fontSize: '16px' }}>
              🎨 Theme Display Component
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

          {/* Status */}
          <div style={{ marginBottom: '12px' }}>
            <div className={`theme-status ${this.getStatusType(status)}`} style={{ fontSize: '11px', padding: '6px 8px' }}>
              <strong>Status:</strong> {status}
            </div>
          </div>
          
          {/* Current Theme Display */}
          {isServiceConnected && (
            <div className="theme-paper" style={{ 
              textAlign: 'center', 
              marginBottom: '12px',
              padding: '12px',
              border: `2px solid ${currentTheme === 'dark' ? 'var(--status-info-color)' : 'var(--status-success-color)'}`
            }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '24px', marginRight: '8px' }}>
                  {this.getThemeIcon(currentTheme)}
                </span>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: currentTheme === 'dark' ? 'var(--status-info-color)' : 'var(--status-success-color)'
                }}>
                  {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} Theme
                </span>
              </div>
              <div className="theme-text-muted" style={{ fontSize: '10px' }}>
                📚 Current theme from BrainDrive's Theme Service
              </div>
            </div>
          )}

          {/* Theme Properties - Compact */}
          <div className="theme-paper" style={{ marginBottom: '12px', padding: '12px' }}>
            <h4 className="theme-subtitle" style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              Theme Properties
            </h4>
            <div style={{ display: 'grid', gap: '4px', fontSize: '11px' }}>
              <div className="theme-flex theme-flex-between">
                <span className="theme-text">Current Theme:</span>
                <span className="theme-code" style={{ fontSize: '10px' }}>{currentTheme}</span>
              </div>
              <div className="theme-flex theme-flex-between">
                <span className="theme-text">Background:</span>
                <span className="theme-code" style={{ fontSize: '10px' }}>var(--bg-color)</span>
              </div>
              <div className="theme-flex theme-flex-between">
                <span className="theme-text">Text Color:</span>
                <span className="theme-code" style={{ fontSize: '10px' }}>var(--text-color)</span>
              </div>
              <div className="theme-flex theme-flex-between">
                <span className="theme-text">Border Color:</span>
                <span className="theme-code" style={{ fontSize: '10px' }}>var(--border-color)</span>
              </div>
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

          {/* Refresh Button */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={this.handleRefresh}
              disabled={!isServiceConnected}
              className={`theme-button ${isServiceConnected ? 'theme-button-primary' : 'theme-button-secondary'}`}
              style={{ fontSize: '12px', padding: '6px 12px' }}
              title="Refresh theme information from the service"
            >
              🔄 Refresh Theme Info
            </button>
          </div>

          {/* Educational Footer */}
          <div style={{
            marginTop: '12px',
            padding: '6px',
            backgroundColor: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)',
            borderRadius: '4px',
            fontSize: '9px',
            textAlign: 'center'
          }}>
            <span 
              title="This component demonstrates real-time theme monitoring using the Theme Service Bridge. It automatically detects theme changes and updates the display accordingly."
              style={{ cursor: 'help' }}
            >
              📚 Theme Service Bridge Demo - Hover for details
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default ThemeDisplay;