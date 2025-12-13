/**
 * PayPal Integration Test Utility
 * 
 * Simple utility to test PayPal configuration and integration
 */

import { getPayPalConfig, isPayPalConfigured } from '../lib/paypalConfig';

/**
 * Test PayPal configuration
 */
export const testPayPalConfig = (): { success: boolean; message: string; config?: Record<string, unknown> } => {
  try {
    const config = getPayPalConfig();
    const isConfigured = isPayPalConfigured();
    
    if (!isConfigured) {
      return {
        success: false,
        message: 'PayPal is not properly configured. Check environment variables.'
      };
    }

    return {
      success: true,
      message: 'PayPal configuration is valid',
      config: {
        environment: config.environment,
        currency: config.currency,
        intent: config.intent,
        clientIdLength: config.clientId.length,
        clientIdPreview: config.clientId.substring(0, 8) + '...'
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown PayPal configuration error'
    };
  }
};

/**
 * Test PayPal SDK loading (simulated)
 */
export const testPayPalSDKLoading = async (): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    try {
      if (typeof window !== 'undefined' && window.loadPayPalSDK) {
        resolve({
          success: true,
          message: 'PayPal SDK loader is available'
        });
      } else {
        resolve({
          success: false,
          message: 'PayPal SDK loader not found'
        });
      }
    } catch (error) {
      resolve({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown PayPal SDK error'
      });
    }
  });
};

/**
 * Run all PayPal tests
 */
export const runPayPalTests = async () => {
  console.log('🔍 Running PayPal Integration Tests...\n');
  
  // Test 1: Configuration
  const configTest = testPayPalConfig();
  console.log('📋 Configuration Test:', configTest.success ? '✅' : '❌');
  console.log('   Message:', configTest.message);
  if (configTest.config) {
    console.log('   Config:', configTest.config);
  }
  console.log('');
  
  // Test 2: SDK Loading
  const sdkTest = await testPayPalSDKLoading();
  console.log('🔧 SDK Loading Test:', sdkTest.success ? '✅' : '❌');
  console.log('   Message:', sdkTest.message);
  console.log('');
  
  // Summary
  const allPassed = configTest.success && sdkTest.success;
  console.log('📊 Overall Result:', allPassed ? '✅ All tests passed' : '❌ Some tests failed');
  
  return {
    configTest,
    sdkTest,
    allPassed
  };
};

// For debugging - can be called from browser console
if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).testPayPal = runPayPalTests;
}