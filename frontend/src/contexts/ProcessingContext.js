import React, { createContext, useContext, useState, useEffect } from 'react';

const ProcessingContext = createContext();

export const useProcessing = () => {
  const context = useContext(ProcessingContext);
  if (!context) {
    throw new Error('useProcessing must be used within a ProcessingProvider');
  }
  return context;
};

export const ProcessingProvider = ({ children }) => {
  const [processingState, setProcessingState] = useState({
    isProcessing: false,
    type: null, // 'single' or 'batch'
    progress: { status: 'idle', step: '', progress: 0, message: '' },
    data: null, // Processing data (videoUrl, batchUrls, etc.)
    abortController: null,
    results: [],
    errors: []
  });

  // Load processing state from sessionStorage on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('vlogclip_processing_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Don't restore abortController as it can't be serialized
        setProcessingState({
          ...parsed,
          abortController: null
        });
      } catch (error) {
        console.error('Failed to restore processing state:', error);
      }
    }
  }, []);

  // Save processing state to sessionStorage whenever it changes
  useEffect(() => {
    // Don't save abortController as it can't be serialized
    const stateToSave = {
      ...processingState,
      abortController: null
    };
    sessionStorage.setItem('vlogclip_processing_state', JSON.stringify(stateToSave));
  }, [processingState]);

  const startProcessing = (type, data, abortController) => {
    setProcessingState({
      isProcessing: true,
      type,
      progress: { status: 'processing', step: 'starting', progress: 0, message: 'Starting processing...' },
      data,
      abortController,
      results: [],
      errors: []
    });
  };

  const updateProgress = (progress) => {
    setProcessingState(prev => ({
      ...prev,
      progress
    }));
  };

  const updateResults = (results) => {
    setProcessingState(prev => ({
      ...prev,
      results
    }));
  };

  const updateErrors = (errors) => {
    setProcessingState(prev => ({
      ...prev,
      errors
    }));
  };

  const completeProcessing = (results = [], errors = []) => {
    setProcessingState(prev => ({
      ...prev,
      isProcessing: false,
      progress: { status: 'completed', step: 'done', progress: 100, message: 'Processing completed!' },
      results,
      errors,
      abortController: null
    }));
  };

  const cancelProcessing = () => {
    if (processingState.abortController) {
      processingState.abortController.abort();
    }
    
    setProcessingState(prev => ({
      ...prev,
      isProcessing: false,
      progress: { status: 'cancelled', step: 'cancelled', progress: 0, message: 'Processing cancelled by user' },
      abortController: null
    }));
  };

  const resetProcessing = () => {
    setProcessingState({
      isProcessing: false,
      type: null,
      progress: { status: 'idle', step: '', progress: 0, message: '' },
      data: null,
      abortController: null,
      results: [],
      errors: []
    });
    sessionStorage.removeItem('vlogclip_processing_state');
  };

  const setAbortController = (controller) => {
    setProcessingState(prev => ({
      ...prev,
      abortController: controller
    }));
  };

  const value = {
    processingState,
    startProcessing,
    updateProgress,
    updateResults,
    updateErrors,
    completeProcessing,
    cancelProcessing,
    resetProcessing,
    setAbortController
  };

  return (
    <ProcessingContext.Provider value={value}>
      {children}
    </ProcessingContext.Provider>
  );
};