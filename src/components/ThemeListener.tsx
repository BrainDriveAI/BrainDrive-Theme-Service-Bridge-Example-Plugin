import React from 'react';
import { Services } from '../types';
import '../styles/theme-example.css';

/**
 * ThemeListener Component
 * 
 * Compact demonstration of Theme Service Bridge event listening.
 * Shows real-time theme change detection and event history.
 */

interface ThemeChangeEvent {
  timestamp: string;
  previousTheme: string;
  newTheme: string;
  source: string;
}

interface ThemeListenerProps {
  services?: Services;
}

interface ThemeListenerState {
  currentTheme: string;
  isServiceConnected: boolean;
  isListening: boolean;
  themeChangeHistory: ThemeChangeEvent[];
  totalChanges: number;
  lastChangeTime: string;
  error: string;
  listenerStatus: string;
}

class ThemeListener extends React.Component<ThemeListenerProps, ThemeListenerState> {
  private themeChangeListener: ((theme: string) => void) | null = null;
  private previousTheme: string = 'light';

  constructor(props: ThemeListenerProps) {
    super(props);
    
    this.state = {
      currentTheme: 'light',
      isServiceConnected: false,
      isListening: false,
      themeChangeHistory: [],
      totalChanges: 0,
      lastChangeTime: 'Never',
      error: '',
      listenerStatus: 'Initializing...'
    };
  }

  componentDidMount() {
    this.initializeThemeService();
  }

  componentDidUpdate(prevProps: ThemeListenerProps) {
    if (prevProps.services?.theme !== this.props.services?.theme) {
      this.initializeThemeService();
    }
  }

  componentWillUnmount() {
    this.stopListening();
  }

  initializeThemeService = () => {
    try {
      // BEST PRACTICE: Validate props and services before use
      if (!this.props.services) {
        throw new Error('Services not provided to component');
      }
      
      if (!this.props.services.theme) {
        // Normal during initialization - service may not be ready
        this.setState({
          isServiceConnected: false,
          listenerStatus: '⏳ Waiting for Theme Service to become available...',
          error: ''
        });
        console.log('[ThemeListener] 📚 LEARNING: Theme Service not yet available - normal during startup');
        return;
      }
      
      // BEST PRACTICE: Validate required service methods
      const requiredMethods = ['getCurrentTheme', 'addThemeChangeListener', 'removeThemeChangeListener'];
      for (const method of requiredMethods) {
        if (typeof (this.props.services.theme as any)[method] !== 'function') {
          throw new Error(`Theme Service missing required method: ${method}`);
        }
      }
      
      // Get current theme with validation and error handling
      let currentTheme: string;
      try {
        currentTheme = this.props.services.theme.getCurrentTheme();
        console.log('[ThemeListener] 📚 LEARNING: Initial theme retrieved:', currentTheme);
        
        // BEST PRACTICE: Validate theme value
        if (typeof currentTheme !== 'string') {
          console.warn('[ThemeListener] ⚠️ Invalid theme type:', typeof currentTheme);
          currentTheme = 'light'; // Safe fallback
        }
        
        if (!['light', 'dark'].includes(currentTheme)) {
          console.warn('[ThemeListener] ⚠️ Unexpected theme value:', currentTheme);
          // Keep the value but log the warning
        }
        
      } catch (themeError) {
        console.error('[ThemeListener] ❌ Failed to get current theme:', themeError);
        throw new Error(`Failed to get current theme: ${themeError instanceof Error ? themeError.message : 'Unknown error'}`);
      }
      
      this.previousTheme = currentTheme;
      
      this.setState({
        currentTheme,
        isServiceConnected: true,
        listenerStatus: '✅ Theme Service connected - Ready to listen',
        error: ''
      });
      
      console.log('[ThemeListener] ✅ Theme Service Bridge successfully initialized');
      console.log(`[ThemeListener] 🎨 Initial theme sync: ${currentTheme}`);
      console.log('[ThemeListener] 📚 LEARNING: All validation checks passed');
      
      // Auto-start listening with error handling
      try {
        this.startListening();
      } catch (startError) {
        console.error('[ThemeListener] ❌ Failed to auto-start listening:', startError);
        // Don't throw here - let user manually start if needed
        this.setState({
          listenerStatus: '⚠️ Connected but failed to auto-start listening',
          error: startError instanceof Error ? startError.message : 'Failed to start listening'
        });
      }
      
    } catch (error) {
      console.error('[ThemeListener] ❌ Failed to initialize Theme Service:', error);
      console.log('[ThemeListener] 📚 LEARNING: Comprehensive error handling prevents crashes');
      
      // BEST PRACTICE: Detailed error analysis and reporting
      let errorMessage = 'Theme Service initialization failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      this.setState({
        isServiceConnected: false,
        listenerStatus: `❌ ${errorMessage}`,
        error: errorMessage
      });
      
      // BEST PRACTICE: Detailed debugging information
      console.group('[ThemeListener] 🐛 Initialization Error Details');
      console.log('Error:', error);
      console.log('Services Available:', !!this.props.services);
      console.log('Theme Service Available:', !!this.props.services?.theme);
      console.log('Component State:', this.state);
      console.groupEnd();
    }
  };

  startListening = () => {
    // BEST PRACTICE: Comprehensive state validation before operations
    if (!this.state.isServiceConnected) {
      const errorMsg = 'Cannot start listening - Service not connected';
      this.setState({
        listenerStatus: `❌ ${errorMsg}`,
        error: errorMsg
      });
      console.log('[ThemeListener] 📚 LEARNING: Always check connection state before operations');
      return;
    }

    if (!this.props.services?.theme) {
      const errorMsg = 'Theme Service no longer available';
      this.setState({
        listenerStatus: `❌ ${errorMsg}`,
        error: errorMsg
      });
      console.log('[ThemeListener] 📚 LEARNING: Services can become unavailable, always validate');
      return;
    }

    if (this.state.isListening) {
      this.setState({ listenerStatus: '⚠️ Already listening for theme changes' });
      console.log('[ThemeListener] 📚 LEARNING: Prevent duplicate listeners');
      return;
    }

    try {
      console.log('[ThemeListener] 🎧 Starting theme listener...');
      
      // BEST PRACTICE: Validate service methods before use
      if (typeof this.props.services.theme.getCurrentTheme !== 'function') {
        throw new Error('getCurrentTheme method not available');
      }
      
      if (typeof this.props.services.theme.addThemeChangeListener !== 'function') {
        throw new Error('addThemeChangeListener method not available');
      }
      
      // IMPORTANT: Sync with current theme before starting listener
      let currentTheme: string;
      try {
        currentTheme = this.props.services.theme.getCurrentTheme();
        console.log('[ThemeListener] 📚 LEARNING: Syncing with current theme:', currentTheme);
        
        // BEST PRACTICE: Validate retrieved theme
        if (typeof currentTheme !== 'string') {
          throw new Error(`Invalid theme type: ${typeof currentTheme}`);
        }
        
      } catch (syncError) {
        console.error('[ThemeListener] ❌ Failed to sync with current theme:', syncError);
        throw new Error(`Theme sync failed: ${syncError instanceof Error ? syncError.message : 'Unknown error'}`);
      }
      
      this.previousTheme = currentTheme;
      
      // Set up theme change listener with comprehensive error handling
      this.themeChangeListener = (newTheme: string) => {
        try {
          console.log('[ThemeListener] 🎨 Theme change received:', newTheme);
          console.log('[ThemeListener] 📚 LEARNING: Listener callback executed successfully');
          
          // BEST PRACTICE: Validate listener parameters
          if (typeof newTheme !== 'string') {
            console.error('[ThemeListener] ❌ Invalid theme type in listener:', typeof newTheme);
            return;
          }
          
          this.handleThemeChange(newTheme, this.previousTheme);
          this.previousTheme = newTheme;
          
        } catch (listenerError) {
          console.error('[ThemeListener] ❌ Error in theme change listener:', listenerError);
          this.setState({
            error: `Listener error: ${listenerError instanceof Error ? listenerError.message : 'Unknown error'}`,
            listenerStatus: '❌ Error in theme change listener'
          });
        }
      };

      // Add listener with error handling
      try {
        this.props.services.theme.addThemeChangeListener(this.themeChangeListener);
        console.log('[ThemeListener] 📚 LEARNING: Theme change listener added successfully');
      } catch (addError) {
        console.error('[ThemeListener] ❌ Failed to add listener:', addError);
        throw new Error(`Failed to add listener: ${addError instanceof Error ? addError.message : 'Unknown error'}`);
      }
      
      // Update state to reflect successful start
      this.setState({
        currentTheme,
        isListening: true,
        listenerStatus: `🎧 Listening - Synced with ${currentTheme} theme`,
        error: ''
      });

      console.log(`[ThemeListener] ✅ Started listening - Synced with current theme: ${currentTheme}`);
      console.log('[ThemeListener] 📚 LEARNING: All validation and sync checks passed');
      
    } catch (error) {
      console.error('[ThemeListener] ❌ Failed to start listening:', error);
      console.log('[ThemeListener] 📚 LEARNING: Proper error handling provides clear feedback');
      
      // BEST PRACTICE: User-friendly error messages
      let errorMessage = 'Failed to start theme listener';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      this.setState({
        isListening: false,
        listenerStatus: `❌ ${errorMessage}`,
        error: errorMessage
      });
      
      // BEST PRACTICE: Detailed error logging for debugging
      console.group('[ThemeListener] 🐛 Start Listening Error Details');
      console.log('Error:', error);
      console.log('Service Available:', !!this.props.services?.theme);
      console.log('Connection State:', this.state.isServiceConnected);
      console.log('Already Listening:', this.state.isListening);
      console.groupEnd();
    }
  };

  stopListening = () => {
    if (!this.state.isListening) {
      this.setState({ listenerStatus: '⚠️ Not currently listening' });
      return;
    }

    try {
      if (this.themeChangeListener && this.props.services?.theme) {
        this.props.services.theme.removeThemeChangeListener(this.themeChangeListener);
        this.themeChangeListener = null;
      }

      this.setState({
        isListening: false,
        listenerStatus: '⏹️ Stopped listening for theme changes'
      });

      console.log('[ThemeListener] ✅ Stopped listening for theme changes');
    } catch (error) {
      console.error('[ThemeListener] ❌ Error stopping listener:', error);
      
      this.setState({
        listenerStatus: '❌ Error stopping listener',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  handleThemeChange = (newTheme: string, previousTheme: string) => {
    try {
      console.log(`[ThemeListener] 🎨 Processing theme change: ${previousTheme} → ${newTheme}`);
      
      // BEST PRACTICE: Validate input parameters
      if (typeof newTheme !== 'string') {
        throw new Error(`Invalid newTheme parameter: expected string, got ${typeof newTheme}`);
      }
      
      if (typeof previousTheme !== 'string') {
        throw new Error(`Invalid previousTheme parameter: expected string, got ${typeof previousTheme}`);
      }
      
      // BEST PRACTICE: Validate theme values
      const validThemes = ['light', 'dark'];
      if (!validThemes.includes(newTheme)) {
        console.warn('[ThemeListener] ⚠️ Unexpected new theme value:', newTheme);
      }
      
      if (!validThemes.includes(previousTheme)) {
        console.warn('[ThemeListener] ⚠️ Unexpected previous theme value:', previousTheme);
      }
      
      // BEST PRACTICE: Check for meaningful changes
      if (newTheme === previousTheme) {
        console.log('[ThemeListener] 📚 LEARNING: Theme change event with same theme - this can happen');
        // Still process it as it might be a refresh or re-initialization
      }
      
      const timestamp = new Date().toLocaleTimeString();
      
      const changeEvent: ThemeChangeEvent = {
        timestamp,
        previousTheme,
        newTheme,
        source: 'Theme Service Bridge'
      };

      // BEST PRACTICE: Safe state updates with error handling
      this.setState(prevState => {
        try {
          const newHistory = [changeEvent, ...prevState.themeChangeHistory.slice(0, 4)]; // Keep last 5
          
          return {
            currentTheme: newTheme,
            themeChangeHistory: newHistory,
            totalChanges: prevState.totalChanges + 1,
            lastChangeTime: timestamp,
            listenerStatus: `🎧 Theme changed: ${previousTheme} → ${newTheme} at ${timestamp}`,
            error: '' // Clear any previous errors
          };
        } catch (stateError) {
          console.error('[ThemeListener] ❌ Error updating state:', stateError);
          // Return minimal safe update
          return {
            ...prevState,
            currentTheme: newTheme,
            error: `State update error: ${stateError instanceof Error ? stateError.message : 'Unknown error'}`
          };
        }
      });

      console.log(`[ThemeListener] ✅ Theme change processed: ${previousTheme} → ${newTheme} at ${timestamp}`);
      console.log('[ThemeListener] 📚 LEARNING: Theme change event successfully handled with validation');
      
    } catch (error) {
      console.error('[ThemeListener] ❌ Error handling theme change:', error);
      console.log('[ThemeListener] 📚 LEARNING: Error handling in event callbacks prevents crashes');
      
      // BEST PRACTICE: Graceful error handling in callbacks
      const errorMessage = error instanceof Error ? error.message : 'Unknown error in theme change handler';
      
      this.setState(prevState => ({
        ...prevState,
        error: errorMessage,
        listenerStatus: '❌ Error processing theme change'
      }));
      
      // BEST PRACTICE: Detailed error logging
      console.group('[ThemeListener] 🐛 Theme Change Handler Error');
      console.log('New Theme:', newTheme);
      console.log('Previous Theme:', previousTheme);
      console.log('Error:', error);
      console.log('Component State:', this.state);
      console.groupEnd();
    }
  };

  clearHistory = () => {
    this.setState({
      themeChangeHistory: [],
      totalChanges: 0,
      lastChangeTime: 'Never'
    });
  };

  getThemeIcon = (theme: string): string => {
    return theme === 'light' ? '☀️' : '🌙';
  };

  getStatusType = (status: string): string => {
    if (status.includes('❌')) return 'theme-status-error';
    if (status.includes('✅') || status.includes('🎧')) return 'theme-status-success';
    if (status.includes('⏳') || status.includes('⚠️')) return 'theme-status-warning';
    if (status.includes('⏹️')) return 'theme-status-info';
    return 'theme-status-info';
  };

  render() {
    const { 
      currentTheme, 
      isServiceConnected, 
      isListening, 
      themeChangeHistory, 
      totalChanges, 
      lastChangeTime, 
      error,
      listenerStatus 
    } = this.state;

    return (
      <div className={`${currentTheme === 'dark' ? 'dark-theme' : ''}`} style={{ padding: '16px', maxWidth: '400px' }}>
        <div className="theme-paper" style={{ padding: '16px' }}>
          {/* Header */}
          <div className="theme-flex theme-flex-between" style={{ marginBottom: '12px' }}>
            <h3 className="theme-subtitle" style={{ margin: 0, fontSize: '16px' }}>
              🎧 Theme Listener Component
            </h3>
            <div className="theme-flex theme-flex-center theme-flex-gap-sm">
              <div 
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isListening ? 'var(--status-success-color)' : 'var(--status-warning-color)'
                }}
              />
              <span className="theme-text-muted" style={{ fontSize: '10px' }}>
                {isListening ? 'Listening' : 'Not Listening'}
              </span>
            </div>
          </div>

          {/* Current Status */}
          <div style={{ marginBottom: '12px' }}>
            <div className={`theme-status ${this.getStatusType(listenerStatus)}`} style={{ fontSize: '11px', padding: '6px 8px' }}>
              {listenerStatus}
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
              color: currentTheme === 'dark' ? 'var(--status-info-color)' : 'var(--status-success-color)'
            }}>
              Current: {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)} Theme
            </div>
          </div>

          {/* Statistics */}
          <div className="theme-paper" style={{ marginBottom: '12px', padding: '12px' }}>
            <h4 className="theme-subtitle" style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              Change Statistics
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--status-info-color)' }}>
                  {totalChanges}
                </div>
                <div className="theme-text-muted" style={{ fontSize: '10px' }}>Total</div>
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--status-success-color)' }}>
                  {themeChangeHistory.length}
                </div>
                <div className="theme-text-muted" style={{ fontSize: '10px' }}>Recent</div>
              </div>
              <div>
                <div className="theme-code" style={{ fontSize: '10px' }}>
                  {lastChangeTime}
                </div>
                <div className="theme-text-muted" style={{ fontSize: '10px' }}>Last Change</div>
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="theme-paper" style={{ marginBottom: '12px', padding: '12px' }}>
            <h4 className="theme-subtitle" style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              Listener Controls
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              <button
                onClick={this.startListening}
                disabled={!isServiceConnected || isListening}
                className="theme-button theme-button-success"
                style={{ fontSize: '10px', padding: '6px 4px' }}
                title="Start listening for theme changes"
              >
                🎧 Start
              </button>
              <button
                onClick={this.stopListening}
                disabled={!isListening}
                className="theme-button theme-button-secondary"
                style={{ fontSize: '10px', padding: '6px 4px' }}
                title="Stop listening for theme changes"
              >
                ⏹️ Stop
              </button>
              <button
                onClick={this.clearHistory}
                disabled={themeChangeHistory.length === 0}
                className="theme-button theme-button-danger"
                style={{ fontSize: '10px', padding: '6px 4px' }}
                title="Clear change history"
              >
                🗑️ Clear
              </button>
            </div>
          </div>

          {/* Theme Change History - Compact */}
          <div className="theme-paper" style={{ marginBottom: '12px', padding: '12px' }}>
            <h4 className="theme-subtitle" style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              Recent Changes ({themeChangeHistory.length})
            </h4>
            
            {themeChangeHistory.length > 0 ? (
              <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                {themeChangeHistory.map((change, index) => (
                  <div key={index} className="theme-paper" style={{ 
                    padding: '6px 8px', 
                    marginBottom: '4px',
                    fontSize: '11px'
                  }}>
                    <div className="theme-flex theme-flex-between">
                      <div className="theme-flex theme-flex-center theme-flex-gap-sm">
                        <span>{this.getThemeIcon(change.previousTheme)}</span>
                        <span>→</span>
                        <span>{this.getThemeIcon(change.newTheme)}</span>
                        <span className="theme-text">
                          {change.previousTheme} → {change.newTheme}
                        </span>
                      </div>
                      <span className="theme-code" style={{ fontSize: '9px' }}>{change.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="theme-text-muted" style={{ textAlign: 'center', fontSize: '11px', padding: '8px' }}>
                No theme changes recorded yet
              </div>
            )}
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
              title="This component demonstrates event listening using the Theme Service Bridge. It automatically detects theme changes and logs them with timestamps for educational purposes."
              style={{ cursor: 'help' }}
            >
              📚 Event Listening Demo - Hover for details
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default ThemeListener;