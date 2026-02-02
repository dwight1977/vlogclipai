import React from 'react';
import { useProcessing } from '../contexts/ProcessingContext';

const ProcessingIndicator = ({ onNavigateToProcessor }) => {
  const { processingState, cancelProcessing } = useProcessing();

  if (!processingState.isProcessing) {
    return null;
  }

  const getProcessorPage = () => {
    return processingState.type === 'batch' ? 'batch' : 'generator';
  };

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 9999,
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(139, 92, 246, 0.95) 100%)',
      borderRadius: '12px',
      padding: '16px',
      color: '#ffffff',
      boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(10px)',
      minWidth: '280px',
      animation: 'pulse 2s infinite'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#10b981',
            animation: 'pulse 1s infinite'
          }}></div>
          <span style={{ fontWeight: '600', fontSize: '14px' }}>
            {processingState.type === 'batch' ? 'Batch Processing' : 'Video Processing'}
          </span>
        </div>
        
        <button
          onClick={cancelProcessing}
          style={{
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9) 0%, rgba(220, 38, 38, 0.9) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '6px 10px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: '600',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Cancel processing"
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 10px rgba(239, 68, 68, 0.3)';
          }}
        >
          <span style={{ fontSize: '10px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>⚡</span>
        </button>
      </div>
      
      <div style={{ fontSize: '12px', marginBottom: '8px', opacity: 0.9 }}>
        {processingState.progress.message}
      </div>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '6px',
        height: '6px',
        marginBottom: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(90deg, #10b981, #34d399)',
          height: '100%',
          width: `${processingState.progress.progress}%`,
          transition: 'width 0.3s ease',
          borderRadius: '6px'
        }}></div>
      </div>
      
      <button
        onClick={() => onNavigateToProcessor && onNavigateToProcessor(getProcessorPage())}
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          color: '#ffffff',
          padding: '8px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          fontWeight: '600',
          width: '100%',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.3)';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        📱 View Processing
      </button>
    </div>
  );
};

export default ProcessingIndicator;