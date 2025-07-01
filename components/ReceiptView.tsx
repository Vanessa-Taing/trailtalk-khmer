
import React from 'react';
import { Customer } from '../types';

interface ReceiptViewProps {
  customer: Customer;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });
};

export const ReceiptView: React.FC<ReceiptViewProps> = ({ customer, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-[80] flex items-center justify-center p-4 animate-fade-in" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col transition-transform duration-300 transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8 overflow-y-auto">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Payment Receipt</h2>
                <p className="text-sm text-gray-500">Thank you for your purchase!</p>
                <p className="text-xs text-gray-400 mt-2">Billed by: TrailTalk</p>
            </div>
          
            <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600 font-medium">Billed to:</span>
                    <span className="text-gray-800 font-semibold">{customer.name || customer.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600 font-medium">Payment Date:</span>
                    <span className="text-gray-800 font-semibold">{formatDate(customer.paymentDate)}</span>
                </div>
                 <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600 font-medium">Transaction ID:</span>
                    <span className="text-gray-800 font-semibold font-mono text-sm">{customer.transactionId}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-gray-600 font-medium">Item:</span>
                    <span className="text-gray-800 font-semibold">TrailTalk Premium (Lifetime)</span>
                </div>
            </div>

            <div className="mt-8 bg-gray-100 rounded-lg p-4">
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-800">Total Paid</span>
                    <span className="text-2xl font-bold text-orange-600">{customer.paymentAmount}</span>
                </div>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={onClose}
                    className="w-full bg-orange-600 text-white font-bold py-3 px-6 rounded-full hover:bg-orange-700 transition-colors shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
                >
                    Close
                </button>
                <p className="text-xs text-gray-400 mt-4">A copy of this receipt has been sent to {customer.email}.</p>
            </div>
        </div>
      </div>
    </div>
  );
};
