// Global error handler for unhandled promise rejections and errors

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Prevent the default browser error handling
  event.preventDefault();
  
  // You can add additional error reporting here
  // For example, send to an error reporting service
});

// Handle general errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error || event.message);
  
  // You can add additional error reporting here
});

export {};