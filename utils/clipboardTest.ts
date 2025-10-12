/**
 * Clipboard functionality test utility
 * Tests all fallback methods and provides debugging information
 */

import { copyToClipboard, isClipboardAvailable } from './clipboard';

export interface ClipboardTestResult {
  method: string;
  success: boolean;
  error?: string;
  supported: boolean;
}

/**
 * Test all clipboard methods to diagnose issues
 * @param testText - Text to test copying
 * @returns Array of test results for each method
 */
export async function testClipboardMethods(testText: string = 'Test clipboard content'): Promise<ClipboardTestResult[]> {
  const results: ClipboardTestResult[] = [];
  
  // Test 1: Modern Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(testText);
      results.push({
        method: 'Modern Clipboard API',
        success: true,
        supported: true
      });
    } catch (error) {
      results.push({
        method: 'Modern Clipboard API',
        success: false,
        error: error.message,
        supported: true
      });
    }
  } else {
    results.push({
      method: 'Modern Clipboard API',
      success: false,
      error: 'Not available (insecure context or unsupported)',
      supported: false
    });
  }
  
  // Test 2: execCommand with textarea
  try {
    const textarea = document.createElement('textarea');
    textarea.value = testText;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    
    document.body.appendChild(textarea);
    
    try {
      textarea.focus();
      textarea.select();
      const success = document.execCommand('copy');
      
      results.push({
        method: 'execCommand (textarea)',
        success: success,
        error: success ? undefined : 'execCommand returned false',
        supported: typeof document.execCommand === 'function'
      });
    } finally {
      document.body.removeChild(textarea);
    }
  } catch (error) {
    results.push({
      method: 'execCommand (textarea)',
      success: false,
      error: error.message,
      supported: typeof document.execCommand === 'function'
    });
  }
  
  // Test 3: execCommand with input
  try {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = testText;
    input.style.position = 'fixed';
    input.style.top = '-9999px';
    input.style.left = '-9999px';
    input.style.opacity = '0';
    
    document.body.appendChild(input);
    
    try {
      input.focus();
      input.select();
      const success = document.execCommand('copy');
      
      results.push({
        method: 'execCommand (input)',
        success: success,
        error: success ? undefined : 'execCommand returned false',
        supported: typeof document.execCommand === 'function'
      });
    } finally {
      document.body.removeChild(input);
    }
  } catch (error) {
    results.push({
      method: 'execCommand (input)',
      success: false,
      error: error.message,
      supported: typeof document.execCommand === 'function'
    });
  }
  
  // Test 4: Selection range method
  try {
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      const span = document.createElement('span');
      span.textContent = testText;
      span.style.position = 'fixed';
      span.style.top = '-9999px';
      span.style.left = '-9999px';
      span.style.opacity = '0';
      
      document.body.appendChild(span);
      
      try {
        range.selectNodeContents(span);
        selection.removeAllRanges();
        selection.addRange(range);
        
        const success = document.execCommand('copy');
        
        results.push({
          method: 'Selection range',
          success: success,
          error: success ? undefined : 'execCommand with selection returned false',
          supported: !!window.getSelection
        });
      } finally {
        document.body.removeChild(span);
        selection.removeAllRanges();
      }
    } else {
      results.push({
        method: 'Selection range',
        success: false,
        error: 'window.getSelection not available',
        supported: false
      });
    }
  } catch (error) {
    results.push({
      method: 'Selection range',
      success: false,
      error: error.message,
      supported: !!window.getSelection
    });
  }
  
  // Test 5: Our main clipboard function
  try {
    const result = await copyToClipboard(testText);
    results.push({
      method: 'Our copyToClipboard function',
      success: result.success,
      error: result.error,
      supported: true
    });
  } catch (error) {
    results.push({
      method: 'Our copyToClipboard function',
      success: false,
      error: error.message,
      supported: true
    });
  }
  
  return results;
}

/**
 * Get browser and environment information for debugging
 */
export function getBrowserClipboardInfo() {
  return {
    userAgent: navigator.userAgent,
    isSecureContext: window.isSecureContext,
    hasClipboard: !!navigator.clipboard,
    hasExecCommand: typeof document.execCommand === 'function',
    hasSelection: !!window.getSelection,
    supportsQueryCommand: typeof document.queryCommandSupported === 'function',
    copyCommandSupported: document.queryCommandSupported ? document.queryCommandSupported('copy') : false,
    isClipboardAvailable: isClipboardAvailable(),
    protocol: window.location.protocol,
    origin: window.location.origin
  };
}

/**
 * Run comprehensive clipboard test and log results
 */
export async function runClipboardDiagnostics() {
  console.log('🔍 Running clipboard diagnostics...');
  
  const browserInfo = getBrowserClipboardInfo();
  console.log('📋 Browser Information:', browserInfo);
  
  const testResults = await testClipboardMethods();
  console.log('🧪 Test Results:');
  
  testResults.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const support = result.supported ? '✓' : '✗';
    console.log(`${index + 1}. ${status} ${result.method} (Supported: ${support})`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const successfulMethods = testResults.filter(r => r.success);
  console.log(`\n📊 Summary: ${successfulMethods.length}/${testResults.length} methods successful`);
  
  if (successfulMethods.length === 0) {
    console.log('⚠️ No clipboard methods working. This may be due to:');
    console.log('  - Browser security restrictions');
    console.log('  - Permissions policy blocking clipboard access');
    console.log('  - Running in an insecure context (HTTP instead of HTTPS)');
    console.log('  - Browser extension blocking clipboard access');
  } else {
    console.log('✅ At least one clipboard method is working');
  }
  
  return {
    browserInfo,
    testResults,
    successfulMethods: successfulMethods.length
  };
}