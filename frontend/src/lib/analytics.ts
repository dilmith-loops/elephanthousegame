export const GA_MEASUREMENT_ID = 'G-E5F9K3PN4W';

// Helper to log custom Google Analytics events
export const trackGAEvent = (
  action: string,
  params?: Record<string, string | number | boolean | undefined>
) => {
  if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', action, params);
  }
};
