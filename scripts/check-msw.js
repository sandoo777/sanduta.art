try {
  const msw = require('msw');
  console.log('msw keys:', Object.keys(msw));
  console.log('rest type:', typeof msw.rest);
  try {
    const handlers = require('../src/test/msw-handlers.ts');
    console.log('handlers export type:', typeof handlers.handlers || typeof handlers.default);
  } catch (e) {
    console.error('require msw-handlers error:', e && e.message);
  }
} catch (e) {
  console.error('require msw error:', e && e.message);
}