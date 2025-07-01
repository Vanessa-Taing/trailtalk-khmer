


import React, { useState } from 'react';

interface PaymentModalProps {
  gateway: 'stripe' | 'paypal';
  onClose: () => void;
  onSuccess: () => void;
  paymentSettings: { stripeKey: string; paypalId: string } | null;
}

const Spinner: React.FC = () => (
    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
);

const PayPalLogo: React.FC<{ className?: string, fill?: string }> = ({ className, fill = "currentColor" }) => (
    <svg className={className} role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <title>PayPal</title>
        <path d="M7.744 21.84h3.012l2.124-12.936H9.824L7.744 21.84zM21.236 8.52c0-1.212-.51-2.22-1.512-2.928-.984-.708-2.28-1.068-3.9-1.068H12.75l-.684 4.056.144.936.036.252c.072.504.432.9.9.9h.828c.504 0 .9-.36 1.008-.864l.036-.288.684-4.068h.432c1.224 0 2.112.432 2.664 1.296.54.852.54 1.944-.012 3.276-.252.612-.648 1.116-1.188 1.512-.54.396-1.116.636-1.728.72-.036 0-.084.012-.12.012l-3.36.024-1.248 7.644h3.024l.432-2.556c.036-.252.108-.48.216-.684.012-.012 0-.012.012-.024.06-.156.144-.288.252-.408.084-.096.168-.18.252-.252.324-.264.756-.408 1.296-.408h.06c1.632 0 2.916-.54 3.864-1.62.936-1.092 1.356-2.436 1.356-4.032zm-12.06 7.644h3.012L14.312 3.24H11.2l-2.028 12.924zM3.92 21.84h3.012l2.124-12.936H6.044L3.92 21.84zM.9 21.84h3.024l2.124-12.936H3.012L.9 21.84z" fill={fill} />
    </svg>
);


export const PaymentModal: React.FC<PaymentModalProps> = ({ gateway, onClose, onSuccess, paymentSettings }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };
  
  const renderStripeForm = () => (
    <>
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Pay with Card</h3>
        <p className="mt-1 text-sm text-gray-500">Secure payment powered by <span className="font-bold">Stripe</span>.</p>
        {paymentSettings?.stripeKey && <p className="text-xs text-gray-400 mt-1">Using key: {paymentSettings.stripeKey.substring(0, 8)}...</p>}
      </div>
      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">Card Number</label>
          <input type="text" id="card-number" placeholder="4242 4242 4242 4242" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700">Expiry</label>
            <input type="text" id="expiry-date" placeholder="MM / YY" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
          </div>
          <div>
            <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
            <input type="text" id="cvc" placeholder="123" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm" />
          </div>
        </div>
        <button type="submit" disabled={isLoading} className="w-full mt-6 flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
          {isLoading ? <Spinner /> : 'Pay $9.99 USD'}
        </button>
      </form>
    </>
  );

  const renderPayPalForm = () => (
    <>
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Pay with PayPal</h3>
        <p className="mt-1 text-sm text-gray-500">You will be redirected to complete your purchase securely.</p>
        {paymentSettings?.paypalId && <p className="text-xs text-gray-400 mt-1">Using Client ID: ...{paymentSettings.paypalId.slice(-6)}</p>}
      </div>
      <form onSubmit={handlePayment} className="mt-6">
        <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-3 py-2.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0070BA] hover:bg-[#005ea6] disabled:bg-gray-400">
          {isLoading ? <Spinner /> : (
            <>
              <PayPalLogo className="w-5 h-5" fill="white" />
              <span className="border-l border-white/50 pl-3">Pay $9.99 USD</span>
            </>
          )}
        </button>
      </form>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[80] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-gray-100 rounded-xl shadow-2xl w-full max-w-sm transition-transform duration-300 transform animate-scale-in flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {gateway === 'stripe' ? renderStripeForm() : renderPayPalForm()}
        </div>
      </div>
    </div>
  );
};