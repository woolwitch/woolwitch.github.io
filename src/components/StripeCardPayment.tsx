/**
 * Stripe Card Payment Component
 * 
 * Handles Stripe card payment processing using Stripe Elements
 * for secure card input and payment processing.
 */

import React, { useState, useEffect } from 'react';
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { getEnvironmentStripeConfig, isDevelopmentMode } from '../lib/stripeConfig';
import type { CartItem, OrderAddress } from '../types/database';

// Card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
      '::placeholder': {
        color: '#aab7c4',
      },
      iconColor: '#666ee8',
    },
    invalid: {
      color: '#9e2146',
      iconColor: '#9e2146',
    },
  },
  hidePostalCode: true,
};

interface StripePaymentData {
  paymentIntentId: string;
  paymentMethodId: string;
  last4: string;
  brand: string;
  clientSecret: string;
}

interface StripeCardFormProps {
  cartItems: CartItem[];
  customerInfo: {
    email: string;
    fullName: string;
    address: OrderAddress;
  };
  onSuccess: (paymentData: StripePaymentData) => Promise<void>;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

type StripeCardPaymentProps = StripeCardFormProps;

// Inner form component that uses Stripe hooks
const StripeCardForm: React.FC<StripeCardFormProps> = ({
  cartItems,
  customerInfo,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Calculate total amount
  const total = cartItems.reduce((sum, item) => {
    const itemTotal = item.product.price * item.quantity;
    const deliveryTotal = (item.product.delivery_charge || 0) * item.quantity;
    return sum + itemTotal + deliveryTotal;
  }, 0);

  // Create payment intent when component mounts
  useEffect(() => {
    createPaymentIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, customerInfo.email]);

  const createPaymentIntent = async () => {
    try {
      setError(null);
      
      // For development, we'll simulate the payment intent creation
      // In production, this should call your backend API
      if (isDevelopmentMode()) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setClientSecret('pi_test_1234567890_secret_abcdefghijk');
        return;
      }
      
      // Production payment intent creation
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to cents
          currency: 'gbp',
          customer_email: customerInfo.email,
          metadata: {
            customer_name: customerInfo.fullName,
            item_count: cartItems.length,
          },
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.client_secret);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize payment';
      setError(errorMessage);
      onError(errorMessage);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // For development, simulate successful payment
      if (isDevelopmentMode() && clientSecret) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockPaymentData: StripePaymentData = {
          paymentIntentId: 'pi_test_1234567890',
          paymentMethodId: 'pm_test_1234567890',
          last4: '4242',
          brand: 'visa',
          clientSecret: clientSecret,
        };
        
        await onSuccess(mockPaymentData);
        return;
      }

      // Production payment processing
      if (!clientSecret) {
        throw new Error('Payment not initialized. Please try again.');
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: customerInfo.fullName,
              email: customerInfo.email,
              address: {
                line1: customerInfo.address.address,
                line2: undefined,
                city: customerInfo.address.city,
                postal_code: customerInfo.address.postcode,
                country: 'GB',
              },
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message || 'Payment failed');
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        const paymentMethod = paymentIntent.payment_method;
        const card = paymentMethod && typeof paymentMethod === 'object' && 
                   'card' in paymentMethod ? paymentMethod.card : null;

        const paymentData: StripePaymentData = {
          paymentIntentId: paymentIntent.id,
          paymentMethodId: typeof paymentMethod === 'string' ? paymentMethod : paymentMethod?.id || '',
          last4: card?.last4 || 'XXXX',
          brand: card?.brand || 'unknown',
          clientSecret: clientSecret,
        };

        await onSuccess(paymentData);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="border border-gray-300 rounded-md p-3 bg-white">
          <CardElement options={cardElementOptions} />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing || disabled || !clientSecret}
        className={`
          w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white font-medium
          ${isProcessing || disabled || !clientSecret
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500'
          }
          transition duration-150 ease-in-out
        `}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Payment...
          </span>
        ) : (
          `Pay £${total.toFixed(2)}`
        )}
      </button>

      {isDevelopmentMode() && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Development Mode:</strong> Use test card 4242 4242 4242 4242 with any future date and any CVC.
          </p>
        </div>
      )}
    </form>
  );
};

// Main component that wraps the form with Stripe Elements
export const StripeCardPayment: React.FC<StripeCardPaymentProps> = (props) => {
  const [stripePromise] = useState(() => {
    const config = getEnvironmentStripeConfig();
    if (!config.isConfigured) {
      return null;
    }
    return loadStripe(config.publishableKey);
  });

  const [isStripeLoaded, setIsStripeLoaded] = useState(false);

  useEffect(() => {
    if (stripePromise) {
      stripePromise.then((stripe) => {
        setIsStripeLoaded(!!stripe);
      });
    }
  }, [stripePromise]);

  if (!stripePromise) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <p className="text-red-800">
          Stripe is not configured. Please check your environment variables.
        </p>
      </div>
    );
  }

  if (!isStripeLoaded) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600"></div>
        <p className="mt-2 text-gray-600">Loading payment form...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripeCardForm {...props} />
    </Elements>
  );
};

export default StripeCardPayment;