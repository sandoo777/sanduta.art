/**
 * Web Vitals Tracking Script
 * Automatically sends Core Web Vitals to monitoring system
 */

import { onCLS, onFID, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

function sendToMonitoring(metric: Metric) {
  // Send to monitoring API
  fetch('/api/metrics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: metric.name.toLowerCase(),
      value: metric.value,
      context: {
        id: metric.id,
        navigationType: metric.navigationType,
        rating: metric.rating,
      },
      timestamp: new Date().toISOString(),
    }),
  }).catch((error) => {
    console.error('Failed to send metric:', error);
  });
}

// Track all Core Web Vitals
export function initWebVitals() {
  onCLS(sendToMonitoring);
  onFID(sendToMonitoring);
  onLCP(sendToMonitoring);
  onTTFB(sendToMonitoring);
  
  // INP (Interaction to Next Paint) - newer metric
  if (typeof onINP === 'function') {
    onINP(sendToMonitoring);
  }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  // Wait for page to load
  if (document.readyState === 'complete') {
    initWebVitals();
  } else {
    window.addEventListener('load', initWebVitals);
  }
}
