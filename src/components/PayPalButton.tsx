/**
 * PayPal Button Component
 * 
 * Renders PayPal payment button and handles PayPal SDK integration
 * for the Wool Witch checkout process.
 */

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { getPayPalConfig, isPayPalConfigured, PayPalErrors } from '../lib/paypalConfig';
import { calculateSubtotal, calculateDeliveryTotal } from '../lib/orderService';
import type { CartItem, OrderAddress, PayPalDetails } from '../types/database';
import type { 
  PayPalNamespace, 
  PayPalCaptureResult, 
  PayPalActions, 
  PayPalOrderData,
  PayPalApprovalData 
} from '../vite-env.d.ts';

interface PayPalButtonProps {
  // Order data
  cartItems: CartItem[];
  customerInfo: {
    email: string;
    fullName: string;
    address: OrderAddress;
  };
  
  // Callbacks
  onSuccess: (paymentData: PayPalPaymentData) => Promise<void>;
  onError: (error: string) => void;
  onCancel?: () => void;
  
  // UI options
  disabled?: boolean;
  className?: string;
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    height?: number;
  };
}

interface PayPalPaymentData {
  orderID: string;
  payerID: string;
  paymentID?: string;
  details: PayPalDetails;
  captureResult: PayPalCaptureResult;
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
  cartItems,
  customerInfo,
  onSuccess,
  onError,
  onCancel,
  disabled = false,
  className = '',
  style = {}
}) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const configRef = useRef<{
    cartItems: CartItem[];
    customerInfo: typeof customerInfo;
    config: ReturnType<typeof getPayPalConfig>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonRendered, setButtonRendered] = useState(false);

  // Calculate order totals (memoized for performance)
  const orderTotals = useMemo(() => {
    const subtotal = calculateSubtotal(cartItems);
    const deliveryTotal = calculateDeliveryTotal(cartItems);
    const total = subtotal + deliveryTotal;
    return { subtotal, deliveryTotal, total };
  }, [cartItems]);

  // Check if configuration has changed (more efficient than JSON.stringify)
  const hasConfigChanged = useMemo(() => {
    if (!configRef.current) return true;
    return (
      cartItems.length !== configRef.current.cartItems.length ||
      cartItems.some((item, index) => 
        item.product.id !== configRef.current!.cartItems[index]?.product.id ||
        item.quantity !== configRef.current!.cartItems[index]?.quantity
      ) ||
      customerInfo.email !== configRef.current.customerInfo.email ||
      customerInfo.fullName !== configRef.current.customerInfo.fullName ||
      customerInfo.address.address !== configRef.current.customerInfo.address.address ||
      customerInfo.address.city !== configRef.current.customerInfo.address.city ||
      customerInfo.address.postcode !== configRef.current.customerInfo.address.postcode
    );
  }, [cartItems, customerInfo]);

  // Load PayPal SDK functions (declared before useEffect to avoid hoisting issues)
  const loadPayPalSDK = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get PayPal client ID from configuration
      const config = getPayPalConfig();
      const clientId = config.clientId;

      console.log('Loading PayPal SDK with client ID:', clientId?.substring(0, 10) + '...');

      // Use the window.loadPayPalSDK function defined in index.html
      if (window.loadPayPalSDK) {
        await window.loadPayPalSDK(clientId);
        console.log('PayPal SDK loaded successfully');
        setIsSDKLoaded(true);
        // Don't call renderPayPalButton here to avoid circular dependency
      } else {
        throw new Error('PayPal SDK loader not available');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load PayPal SDK';
      console.error('PayPal SDK loading error:', err);
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  const renderPayPalButton = useCallback((paypal: PayPalNamespace) => {
    if (!paypalRef.current || disabled) {
      console.log('PayPal button render skipped:', { hasRef: !!paypalRef.current, disabled });
      return;
    }

    try {
      // Clear any existing PayPal button
      paypalRef.current.innerHTML = '';
      setButtonRendered(false);
      console.log('Rendering PayPal button...');

      const config = getPayPalConfig();
      
      // Store current config for comparison (avoid deep cloning for performance)
      configRef.current = {
        config,
        cartItems: [...cartItems],
        customerInfo: { ...customerInfo }
      };

      const buttonStyle = {
        layout: style.layout || 'vertical',
        color: style.color || 'gold',
        shape: style.shape || 'rect',
        height: style.height || 45,
        tagline: false,
        ...style
      };

      console.log('PayPal button style:', buttonStyle);
      console.log('Cart items for PayPal:', cartItems.length, 'items');
      console.log('Total amount:', orderTotals.total);

      const buttonsComponent = paypal.Buttons({
        style: buttonStyle,
      
        createOrder: async (_data: Record<string, unknown>, actions: PayPalActions) => {
          try {
            console.log('Creating PayPal order...');
            
            // Validate cart items before creating order
            if (!cartItems || cartItems.length === 0) {
              throw new Error('Cart is empty');
            }

            // Validate total amount
            if (orderTotals.total <= 0) {
              throw new Error('Invalid order total');
            }

            // Validate customer information
            if (!customerInfo.fullName.trim() || !customerInfo.email.trim()) {
              throw new Error('Customer information is incomplete');
            }

            // Create PayPal order
            const orderData: PayPalOrderData = {
              intent: 'CAPTURE',
              purchase_units: [{
                description: `Wool Witch Order - ${cartItems.length} item(s)`,
                amount: {
                  currency_code: config.currency,
                  value: orderTotals.total.toFixed(2),
                  breakdown: {
                    item_total: {
                      currency_code: config.currency,
                      value: orderTotals.subtotal.toFixed(2)
                    },
                    shipping: {
                      currency_code: config.currency,
                      value: orderTotals.deliveryTotal.toFixed(2)
                    }
                  }
                },
                items: cartItems.map(item => ({
                  name: item.product.name,
                  description: item.product.description?.substring(0, 127) || 'Handmade crochet item',
                  unit_amount: {
                    currency_code: config.currency,
                    value: item.product.price.toFixed(2)
                  },
                  quantity: item.quantity.toString(),
                  category: 'PHYSICAL_GOODS'
                })),
                shipping: {
                  address: {
                    name: { full_name: customerInfo.fullName },
                    address_line_1: customerInfo.address.address,
                    admin_area_2: customerInfo.address.city,
                    postal_code: customerInfo.address.postcode,
                    country_code: 'GB'
                  }
                }
              }],
              application_context: {
                brand_name: 'Wool Witch',
                landing_page: 'BILLING',
                shipping_preference: 'SET_PROVIDED_ADDRESS',
                user_action: 'PAY_NOW'
              }
            };

            const orderId = await actions.order.create(orderData);
            console.log('PayPal order created successfully:', orderId);
            return orderId;
          } catch (err) {
            console.error('Error creating PayPal order:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to create PayPal order';
            setError(errorMessage);
            onError(errorMessage);
            throw err;
          }
        },

        onApprove: async (data: PayPalApprovalData, actions: PayPalActions) => {
          try {
            console.log('PayPal payment approved:', data.orderID);
            
            if (!actions.order) {
              throw new Error('PayPal order actions not available');
            }

            const captureResult = await actions.order.capture();
            console.log('Payment captured:', captureResult);

            if (!captureResult.purchase_units?.[0]?.payments?.captures?.[0]) {
              throw new Error('Payment capture failed - no capture data returned');
            }

            const capture = captureResult.purchase_units[0].payments.captures[0];
            const payer = captureResult.payer;

            const paymentData: PayPalPaymentData = {
              orderID: data.orderID,
              payerID: data.payerID,
              paymentID: capture.id,
              details: {
                paypal_order_id: data.orderID,
                payer_id: data.payerID,
                payer_email: payer?.email_address,
                transaction_id: capture.id,
                capture_id: capture.id,
                gross_amount: parseFloat(capture.amount.value),
                fee_amount: capture.seller_receivable_breakdown?.paypal_fee?.value 
                  ? parseFloat(capture.seller_receivable_breakdown.paypal_fee.value)
                  : 0,
                net_amount: capture.seller_receivable_breakdown?.net_amount?.value
                  ? parseFloat(capture.seller_receivable_breakdown.net_amount.value)
                  : parseFloat(capture.amount.value)
              },
              captureResult
            };

            console.log('Calling onSuccess with payment data');
            await onSuccess(paymentData);
            return;
          } catch (err) {
            console.error('Error processing PayPal payment:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to process PayPal payment';
            setError(errorMessage);
            onError(errorMessage);
            throw err;
          }
        },

        onError: (err: Error) => {
          console.error('PayPal button error:', err);
          const errorMessage = PayPalErrors.getErrorMessage(err.message);
          setError(errorMessage);
          onError(errorMessage);
        },

        onCancel: (data: Record<string, unknown>) => {
          console.log('PayPal payment cancelled:', data.orderID);
          if (onCancel) {
            onCancel();
          }
        }
      });

      if (buttonsComponent.isEligible()) {
        buttonsComponent.render(paypalRef.current)
          .then(() => {
            console.log('PayPal button rendered successfully');
            setButtonRendered(true);
            setIsLoading(false);
          })
          .catch((err: Error) => {
            console.error('Failed to render PayPal button:', err);
            setError('Failed to display PayPal button');
          });
      } else {
        console.error('PayPal buttons not eligible');
        setError('PayPal payment not available');
      }
    } catch (err) {
      console.error('Error setting up PayPal button:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to set up PayPal button';
      setError(errorMessage);
      onError(errorMessage);
    }
  }, [cartItems, customerInfo, onSuccess, onError, onCancel, disabled, style, orderTotals]);

  // Load PayPal SDK on mount
  useEffect(() => {
    if (!isPayPalConfigured()) {
      setError('PayPal is not configured. Please contact support.');
      setIsLoading(false);
      return;
    }

    if (!isSDKLoaded && !error) {
      loadPayPalSDK();
    }
  }, [isSDKLoaded, error, loadPayPalSDK]);

  // Re-render button when dependencies change and SDK is loaded
  useEffect(() => {
    if (isSDKLoaded && window.paypal && !disabled && !error && (hasConfigChanged || !buttonRendered)) {
      console.log('Re-rendering PayPal button due to dependency change');
      renderPayPalButton(window.paypal);
    }
  }, [isSDKLoaded, disabled, error, hasConfigChanged, buttonRendered, renderPayPalButton]);


  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-red-800 font-medium">PayPal Unavailable</p>
            <p className="text-red-600 text-sm">{error}</p>
            <button 
              onClick={loadPayPalSDK}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-rose-600"></div>
          <span className="text-gray-600">Loading PayPal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div ref={paypalRef}></div>
      
      {/* PayPal info */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        Secure payment powered by PayPal
      </div>
    </div>
  );
};

export default PayPalButton;
export type { PayPalPaymentData };