const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

export const initAnalytics = () => {
  if (!measurementId || typeof window === "undefined" || window.gtag) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);
};

export const trackPageView = (path) => {
  if (measurementId && typeof window !== "undefined" && window.gtag) {
    window.gtag("config", measurementId, { page_path: path });
  }
};

export const trackEvent = (eventName, params = {}) => {
  if (measurementId && typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

