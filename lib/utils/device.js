/**
 * Gets the unique device ID for the current browser.
 * Generates and saves one to localStorage if it doesn't exist.
 */
export const getDeviceId = () => {
  // 1. Safety check for Next.js Server-Side Rendering (SSR)
  if (typeof window === 'undefined') {
    return 'server-side-request';
  }

  // 2. Check if we already have an ID saved for this browser
  const storageKey = 'gaprio_device_id';
  let deviceId = localStorage.getItem(storageKey);

  // 3. If not, generate a new one and save it
  if (!deviceId) {
    // Use the browser's crypto API for a secure UUID if available, else fallback to random string
    deviceId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `device-${Math.random().toString(36).substring(2, 15)}`;
      
    localStorage.setItem(storageKey, deviceId);
  }

  return deviceId;
};