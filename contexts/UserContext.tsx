
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { User, Customer } from '../types';

const USER_STORAGE_KEY = 'trailTalkUser_v1';
const CUSTOMERS_STORAGE_KEY = 'trailTalkCustomers_v1';
const PAYMENT_SETTINGS_KEY = 'trailTalkPaymentSettings_v1';

type PaymentSettings = {
  stripeKey: string;
  paypalId: string;
};

interface UserContextType {
  user: User | null;
  customers: Customer[] | null;
  paymentSettings: PaymentSettings | null;
  login: (email: string) => void;
  logout: () => void;
  setPremium: () => void;
  updateCustomerDetails: (email: string, details: { name: string; mobile: string }) => void;
  setPaymentSettings: (settings: PaymentSettings) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const initialCustomers: Customer[] = [
  {
    id: 999,
    name: 'Sam Premium',
    email: 'sam@premium.com',
    mobile: '+1-555-555-0101',
    registrationDate: new Date('2024-05-20T10:00:00Z').toISOString(),
    paymentAmount: '$9.99',
    paymentDate: new Date('2024-05-20T10:05:00Z').toISOString(),
    transactionId: 'MOCK_TRANS_PREM123'
  }
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [paymentSettings, setPaymentSettingsState] = useState<PaymentSettings | null>(null);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedCustomers = window.localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      if (storedCustomers) {
        setCustomers(JSON.parse(storedCustomers));
      } else {
        // If no customers in storage, initialize with the mock user.
        setCustomers(initialCustomers);
        window.localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(initialCustomers));
      }

      const storedSettings = window.localStorage.getItem(PAYMENT_SETTINGS_KEY);
      if (storedSettings) setPaymentSettingsState(JSON.parse(storedSettings));
    } catch (e) {
      console.error('Failed to load data from storage', e);
    }
  }, []);

  const login = useCallback((email: string) => {
    try {
      let currentCustomers: Customer[] = customers ? [...customers] : [];
      let existingCustomer = currentCustomers.find(c => c.email.toLowerCase() === email.toLowerCase());
      
      let currentUser: User;

      if (existingCustomer) {
          currentUser = { email: existingCustomer.email, isPremium: !!existingCustomer.paymentDate };
      } else {
          const newCustomer: Customer = {
              id: Date.now(),
              name: '', // Name is empty on initial registration
              email: email.toLowerCase(),
              mobile: '', // Mobile is empty on initial registration
              registrationDate: new Date().toISOString(),
              paymentAmount: '',
              paymentDate: '',
              transactionId: '',
          };
          currentCustomers.push(newCustomer);
          setCustomers(currentCustomers);
          window.localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(currentCustomers));
          
          currentUser = { email: newCustomer.email, isPremium: false };
      }
      
      setUser(currentUser);
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
      
    } catch (e) {
      console.error("Failed to process login", e);
    }
  }, [customers]);

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const setPremium = useCallback(() => {
    if (!user || !customers) return;

    const updatedUser = { ...user, isPremium: true };
    setUser(updatedUser);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    
    try {
        let updatedCustomers = [...customers];
        const existingCustomerIndex = updatedCustomers.findIndex(c => c.email === user.email);
        const now = new Date();

        if (existingCustomerIndex > -1) {
            updatedCustomers[existingCustomerIndex].paymentAmount = '$9.99';
            updatedCustomers[existingCustomerIndex].paymentDate = now.toISOString();
            updatedCustomers[existingCustomerIndex].transactionId = `MOCK_TRANS_${Date.now()}`;
            setCustomers(updatedCustomers);
            window.localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updatedCustomers));
        }
    } catch (e) {
        console.error('Failed to update customer list for premium status', e);
    }
  }, [user, customers]);
  
  const updateCustomerDetails = useCallback((email: string, details: { name: string; mobile: string }) => {
      if (!customers) return;
       try {
        let updatedCustomers = [...customers];
        const customerIndex = updatedCustomers.findIndex(c => c.email === email);
        if (customerIndex > -1) {
            updatedCustomers[customerIndex] = {
                ...updatedCustomers[customerIndex],
                name: details.name,
                mobile: details.mobile,
            };
            setCustomers(updatedCustomers);
            window.localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updatedCustomers));
        }
    } catch(e) {
        console.error('Failed to update customer details', e);
    }

  }, [customers]);


  const setPaymentSettings = useCallback((settings: PaymentSettings) => {
    setPaymentSettingsState(settings);
    try {
      window.localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save payment settings', e);
    }
  }, []);


  return (
    <UserContext.Provider value={{ user, customers, login, logout, setPremium, updateCustomerDetails, paymentSettings, setPaymentSettings }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
