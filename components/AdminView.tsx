
import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { useUser } from '../contexts/UserContext';

interface AdminViewProps {
  onClose: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onClose }) => {
  const { customers, paymentSettings, setPaymentSettings } = useUser();

  const [stripeKey, setStripeKey] = useState('');
  const [paypalId, setPaypalId] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (paymentSettings) {
        setStripeKey(paymentSettings.stripeKey);
        setPaypalId(paymentSettings.paypalId);
    }
  }, [paymentSettings]);
  
  const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
      });
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSettings({ stripeKey, paypalId });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const hasPaidCustomers = customers?.some(c => c.paymentDate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transition-transform duration-300 transform animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <header className="flex justify-between items-center p-4 border-b border-gray-200 bg-white rounded-t-xl sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors" aria-label="Close admin panel">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </header>

        <div className="p-4 overflow-auto">
          {/* Payment Gateway Setup */}
          <div className="mb-8 p-4 bg-white rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Gateway Setup</h3>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label htmlFor="stripeKey" className="block text-sm font-medium text-gray-700">Stripe API Key (mock)</label>
                <input
                  type="text"
                  id="stripeKey"
                  value={stripeKey}
                  onChange={(e) => setStripeKey(e.target.value)}
                  placeholder="pk_test_..."
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
               <div>
                <label htmlFor="paypalId" className="block text-sm font-medium text-gray-700">PayPal Client ID (mock)</label>
                <input
                  type="text"
                  id="paypalId"
                  value={paypalId}
                  onChange={(e) => setPaypalId(e.target.value)}
                  placeholder="A..."
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div className="flex justify-end items-center gap-4">
                {settingsSaved && <span className="text-sm text-green-600 animate-fade-in">Settings saved!</span>}
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Save Settings
                </button>
              </div>
            </form>
          </div>


          {/* Customer List */}
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer List</h3>
          <div className="w-full overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Date</th>
                  {hasPaidCustomers && <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>}
                  {hasPaidCustomers && <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers && customers.length > 0 ? (
                  customers.map(customer => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{customer.name || 'N/A'}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.email}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{customer.mobile || 'N/A'}</td>
                      <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{formatDate(customer.registrationDate)}</td>
                      {hasPaidCustomers && (
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                          {customer.paymentAmount ? 
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {customer.paymentAmount}
                            </span>
                            : 
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              No Payment
                            </span>
                           }
                        </td>
                      )}
                      {hasPaidCustomers && (
                        <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{formatDate(customer.paymentDate)}</td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={hasPaidCustomers ? 6 : 4} className="py-8 px-4 text-center text-gray-500">No customer data found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
