# Theme Service Bridge - Error Handling Best Practices

This document outlines the comprehensive error handling patterns implemented in the ServiceExample_Theme plugin components, demonstrating best practices for robust Theme Service Bridge integration.

## Core Error Handling Principles

### 1. **Always Validate Before Use**
```typescript
// ✅ BEST PRACTICE: Validate props and services
if (!this.props.services) {
  throw new Error('Services not provided to component');
}

if (!this.props.services.theme) {
  // Handle gracefully - service may not be ready yet
  this.setState({ status: '⏳ Waiting for Theme Service...' });
  return;
}
```

### 2. **Validate Service Methods**
```typescript
// ✅ BEST PRACTICE: Check method availability
const requiredMethods = ['getCurrentTheme', 'addThemeChangeListener'];
for (const method of requiredMethods) {
  if (typeof (this.props.services.theme as any)[method] !== 'function') {
    throw new Error(`Theme Service missing required method: ${method}`);
  }
}
```

### 3. **Validate Data Types and Values**
```typescript
// ✅ BEST PRACTICE: Validate returned data
const currentTheme = this.props.services.theme.getCurrentTheme();
if (typeof currentTheme !== 'string') {
  console.warn('Invalid theme type:', typeof currentTheme);
  currentTheme = 'light'; // Safe fallback
}

if (!['light', 'dark'].includes(currentTheme)) {
  console.warn('Unexpected theme value:', currentTheme);
}
```

### 4. **Comprehensive Listener Error Handling**
```typescript
// ✅ BEST PRACTICE: Error handling in callbacks
this.themeChangeListener = (newTheme: string) => {
  try {
    // Validate callback parameters
    if (typeof newTheme !== 'string') {
      console.error('Invalid theme type in listener:', typeof newTheme);
      return;
    }
    
    // Process theme change
    this.handleThemeChange(newTheme, this.previousTheme);
    
  } catch (listenerError) {
    console.error('Error in theme change listener:', listenerError);
    this.setState({
      error: `Listener error: ${listenerError.message}`,
      status: '❌ Error in theme change listener'
    });
  }
};
```

### 5. **Timeout Protection for Operations**
```typescript
// ✅ BEST PRACTICE: Prevent hanging operations
const changePromise = new Promise<void>((resolve, reject) => {
  try {
    (this.props.services!.theme as any).setTheme(newTheme);
    resolve();
  } catch (err) {
    reject(err);
  }
});

const timeoutPromise = new Promise<never>((_, reject) => {
  setTimeout(() => reject(new Error('Theme change timeout after 5 seconds')), 5000);
});

await Promise.race([changePromise, timeoutPromise]);
```

## Error Handling Patterns by Component

### ThemeDisplay Component
- **Service Validation**: Checks service availability and method existence
- **Data Validation**: Validates theme values and types
- **Listener Safety**: Error handling in theme change callbacks
- **Refresh Protection**: Validates state before refresh operations
- **User Feedback**: Clear error messages and status updates

### ThemeController Component
- **Input Validation**: Validates theme parameters before operations
- **Method Availability**: Checks if theme changing is supported
- **Duplicate Prevention**: Prevents changing to the same theme
- **Timeout Protection**: Prevents hanging theme change operations
- **User-Friendly Messages**: Converts technical errors to user-friendly messages

### ThemeListener Component
- **Sync Validation**: Ensures proper theme synchronization on start
- **Callback Safety**: Comprehensive error handling in event callbacks
- **State Protection**: Safe state updates with error recovery
- **Parameter Validation**: Validates all callback parameters
- **History Management**: Safe history updates with error handling

## Educational Logging Patterns

### 1. **Learning Messages**
```typescript
console.log('[Component] 📚 LEARNING: Always check connection state before operations');
console.log('[Component] 📚 LEARNING: Services can become unavailable, always validate');
```

### 2. **Error Context Groups**
```typescript
console.group('[Component] 🐛 Error Details');
console.log('Error:', error);
console.log('Service Available:', !!this.props.services?.theme);
console.log('Component State:', this.state);
console.groupEnd();
```

### 3. **Operation Tracking**
```typescript
console.log('[Component] 🎨 Theme change received:', newTheme);
console.log('[Component] ✅ Operation completed successfully');
console.log('[Component] ❌ Operation failed:', error);
```

## Error Recovery Strategies

### 1. **Graceful Degradation**
- Components continue to function even when some features fail
- Fallback values for invalid data
- Clear status messages about what's not working

### 2. **State Consistency**
- Always clear errors when operations succeed
- Maintain consistent state even during errors
- Prevent partial state updates that could cause crashes

### 3. **User Communication**
- Clear, actionable error messages
- Status indicators showing connection state
- Educational tooltips explaining what went wrong

## Testing Error Scenarios

The error handling covers these scenarios:
- Service not available during initialization
- Service becomes unavailable during operation
- Invalid data returned from service methods
- Network timeouts or hanging operations
- Invalid parameters passed to methods
- Listener callback failures
- State update failures

## Benefits of This Approach

1. **Prevents Crashes**: Comprehensive error handling prevents component crashes
2. **Better Debugging**: Detailed logging helps developers understand issues
3. **User Experience**: Clear feedback about what's happening and why
4. **Educational Value**: Shows developers proper error handling patterns
5. **Production Ready**: Robust enough for production use
6. **Maintainable**: Clear error patterns make code easier to maintain

This error handling approach makes the ServiceExample_Theme plugin a comprehensive educational resource for developers learning to integrate with the Theme Service Bridge.