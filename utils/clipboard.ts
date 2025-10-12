/**
 * Robust clipboard utility with fallback support
 * Handles cases where Clipboard API is blocked or not available
 */

export interface ClipboardResult {
  success: boolean;
  error?: string;
}

/**
 * Copy text to clipboard with multiple fallback methods
 * @param text - Text to copy to clipboard
 * @returns Promise<ClipboardResult> - Result of the copy operation
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  // Method 1: Try modern Clipboard API first (works in secure contexts)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (err) {
      // Don't log clipboard API errors as they're expected when blocked
      // console.warn('Clipboard API failed, trying fallback method:', err);
      // Continue to fallback methods silently
    }
  }
  
  // Method 2: Enhanced fallback using document.execCommand with improved element creation
  try {
    // Create a temporary textarea element with better properties
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Enhanced styling to ensure it works in all browsers
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.style.width = '1px';
    textArea.style.height = '1px';
    textArea.style.opacity = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.pointerEvents = 'none';
    textArea.style.zIndex = '-1000';
    
    // Set attributes for maximum compatibility
    textArea.setAttribute('readonly', 'readonly');
    textArea.setAttribute('contenteditable', 'true');
    textArea.setAttribute('tabindex', '-1');
    textArea.setAttribute('aria-hidden', 'true');
    
    // Add to DOM temporarily
    document.body.appendChild(textArea);
    
    try {
      // Enhanced selection approach
      textArea.focus({ preventScroll: true });
      textArea.select();
      textArea.setSelectionRange(0, text.length);
      
      // Multiple attempts with different approaches
      let successful = false;
      
      // Attempt 1: Standard execCommand
      successful = document.execCommand('copy');
      
      // Attempt 2: Force selection if first attempt failed
      if (!successful) {
        textArea.select();
        textArea.setSelectionRange(0, 99999); // Large number to ensure full selection
        successful = document.execCommand('copy');
      }
      
      if (successful) {
        return { success: true };
      }
    } finally {
      // Always clean up the temporary element
      try {
        document.body.removeChild(textArea);
      } catch (cleanupErr) {
        // Ignore cleanup errors
      }
    }
  } catch (err) {
    // Don't log execCommand errors in console to avoid spam
    // console.warn('execCommand fallback failed:', err);
  }
  
  // Method 3: Enhanced selection range method for mobile browsers
  try {
    const selection = window.getSelection();
    if (selection && selection.rangeCount !== undefined) {
      const range = document.createRange();
      const span = document.createElement('span');
      span.textContent = text;
      
      // Enhanced styling for mobile compatibility
      span.style.position = 'fixed';
      span.style.top = '-9999px';
      span.style.left = '-9999px';
      span.style.width = '1px';
      span.style.height = '1px';
      span.style.opacity = '0';
      span.style.overflow = 'hidden';
      span.style.whiteSpace = 'pre';
      span.style.userSelect = 'text';
      span.style.pointerEvents = 'none';
      span.setAttribute('aria-hidden', 'true');
      
      document.body.appendChild(span);
      
      try {
        range.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Try multiple execCommand approaches
        let successful = document.execCommand('copy');
        
        // Alternative approach for some browsers
        if (!successful && document.queryCommandSupported('copy')) {
          successful = document.execCommand('copy');
        }
        
        if (successful) {
          return { success: true };
        }
      } finally {
        try {
          document.body.removeChild(span);
          selection.removeAllRanges();
        } catch (cleanupErr) {
          // Ignore cleanup errors
        }
      }
    }
  } catch (err) {
    // Silent failure for selection range method
  }
  
  // Method 4: Create input element method (alternative for some edge cases)
  try {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = text;
    
    // Style the input to be invisible
    input.style.position = 'fixed';
    input.style.top = '-9999px';
    input.style.left = '-9999px';
    input.style.opacity = '0';
    input.style.pointerEvents = 'none';
    input.setAttribute('readonly', 'readonly');
    input.setAttribute('tabindex', '-1');
    input.setAttribute('aria-hidden', 'true');
    
    document.body.appendChild(input);
    
    try {
      input.focus({ preventScroll: true });
      input.select();
      input.setSelectionRange(0, text.length);
      
      const successful = document.execCommand('copy');
      if (successful) {
        return { success: true };
      }
    } finally {
      try {
        document.body.removeChild(input);
      } catch (cleanupErr) {
        // Ignore cleanup errors
      }
    }
  } catch (err) {
    // Silent failure for input method
  }
  
  // All methods failed
  return { 
    success: false, 
    error: 'All clipboard methods failed. Your browser may not support clipboard operations or may require user interaction.' 
  };
}

/**
 * Check if clipboard operations are likely to work
 * @returns boolean - Whether clipboard is likely available
 */
export function isClipboardAvailable(): boolean {
  // Check for modern Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    return true;
  }
  
  // Check for execCommand support
  if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    return true;
  }
  
  // Fallback assumption - most browsers support some form of clipboard
  return typeof document.execCommand === 'function';
}

/**
 * Get a user-friendly error message for clipboard failures
 * @param error - The error from clipboard operation
 * @returns string - User-friendly error message
 */
export function getClipboardErrorMessage(error?: string): string {
  if (error?.includes('permissions')) {
    return 'Clipboard access was denied. Please allow clipboard permissions in your browser settings.';
  }
  
  if (error?.includes('secure')) {
    return 'Clipboard access requires a secure connection (HTTPS). Please try again on a secure site.';
  }
  
  if (!isClipboardAvailable()) {
    return 'Your browser does not support clipboard operations. Please manually select and copy the text.';
  }
  
  return 'Failed to copy to clipboard. Please try manually selecting and copying the text.';
}

/**
 * Copy text with user-friendly toast feedback
 * @param text - Text to copy
 * @param toast - Toast function for showing messages
 * @param successMessage - Success message to show
 * @param setCopied - Optional function to set copied state
 * @returns Promise<boolean> - Whether the operation was successful
 */
export async function copyWithFeedback(
  text: string,
  toast: { success: (msg: string) => void; error: (msg: string) => void },
  successMessage: string = 'Copied to clipboard!',
  setCopied?: (copied: boolean) => void
): Promise<boolean> {
  // Validate input
  if (!text || typeof text !== 'string') {
    toast.error('Nothing to copy');
    return false;
  }
  
  const result = await copyToClipboard(text);
  
  if (result.success) {
    toast.success(successMessage);
    if (setCopied) {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
    return true;
  } else {
    // For development: show more detailed error
    if (process.env.NODE_ENV === 'development') {
      console.debug('Clipboard operation failed (this is normal in some environments):', result.error);
    }
    
    // User-friendly error handling - no error toast, just inform user of alternative
    toast.error('Unable to copy automatically. Please manually select and copy the text.');
    return false;
  }
}

/**
 * Simple copy function that fails silently if clipboard is not available
 * @param text - Text to copy
 * @returns Promise<boolean> - Whether the operation was successful
 */
export async function copyToClipboardSilent(text: string): Promise<boolean> {
  if (!text || typeof text !== 'string') {
    return false;
  }
  
  const result = await copyToClipboard(text);
  return result.success;
}