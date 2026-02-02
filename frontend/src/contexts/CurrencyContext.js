import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('GBP'); // Default to GBP
  
  // Exchange rates (base: GBP)
  const exchangeRates = {
    GBP: 1.0,
    USD: 1.27, // 1 GBP = 1.27 USD
    EUR: 1.20  // 1 GBP = 1.20 EUR
  };

  const currencySymbols = {
    GBP: '£',
    USD: '$',
    EUR: '€'
  };

  const currencyNames = {
    GBP: 'British Pound',
    USD: 'US Dollar', 
    EUR: 'Euro'
  };

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('vlogclip_currency');
    if (savedCurrency && exchangeRates[savedCurrency]) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Save currency to localStorage when changed
  useEffect(() => {
    localStorage.setItem('vlogclip_currency', currency);
  }, [currency]);

  const convertPrice = (gbpPrice) => {
    const convertedPrice = gbpPrice * exchangeRates[currency];
    return Math.round(convertedPrice * 100) / 100; // Round to 2 decimal places
  };

  const formatPrice = (gbpPrice) => {
    const convertedPrice = convertPrice(gbpPrice);
    const symbol = currencySymbols[currency];
    
    // Format with proper decimals
    if (convertedPrice % 1 === 0) {
      return `${symbol}${convertedPrice.toFixed(0)}`;
    } else {
      return `${symbol}${convertedPrice.toFixed(2)}`;
    }
  };

  const value = {
    currency,
    setCurrency,
    exchangeRates,
    currencySymbols,
    currencyNames,
    convertPrice,
    formatPrice
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};