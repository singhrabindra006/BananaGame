/**
 * Lightweight event logger used throughout the app to
 * demonstrate awareness of the event-driven flow —
 * logs event name, timestamp, and payload to console.
 */
export const logEvent = (name, data = {}) => {
  console.log(`[EVENT] ${new Date().toLocaleTimeString()} - ${name}`, data);
};
