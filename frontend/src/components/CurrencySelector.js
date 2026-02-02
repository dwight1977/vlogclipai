import React from 'react';
import { useCurrency } from '../contexts/CurrencyContext';

const CurrencySelector = ({ style = {} }) => {
  const { currency, setCurrency, currencySymbols, currencyNames } = useCurrency();

  const currencies = ['GBP', 'USD', 'EUR'];

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 16px',
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
      borderRadius: '12px',
      border: '2px solid rgba(99, 102, 241, 0.3)',
      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
      ...style
    }}>
      <span style={{
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '600',
        marginRight: '8px'
      }}>
        💱 Currency:
      </span>
      
      <div style={{
        display: 'flex',
        gap: '4px'
      }}>
        {currencies.map((curr) => (
          <button
            key={curr}
            onClick={() => handleCurrencyChange(curr)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: currency === curr 
                ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseOver={(e) => {
              if (currency !== curr) {
                e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseOut={(e) => {
              if (currency !== curr) {
                e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
            title={currencyNames[curr]}
          >
            <span style={{ fontSize: '14px' }}>{currencySymbols[curr]}</span>
            <span>{curr}</span>
          </button>
        ))}
      </div>
      
      <div style={{
        fontSize: '11px',
        color: '#94a3b8',
        marginLeft: '8px',
        textAlign: 'center'
      }}>
        Live rates
      </div>
    </div>
  );
};

export default CurrencySelector;