(function () {
  const GA_MEASUREMENT_ID = 'G-SXWPFSN3JK';
  const YANDEX_METRIKA_ID = 107224695;
  const STORAGE_KEY = 'portfolio.analytics.disabled';
  const DISABLE_VALUES = new Set(['0', 'false', 'off', 'disable', 'disabled']);
  const ENABLE_VALUES = new Set(['1', 'true', 'on', 'enable', 'enabled']);

  const readDisabledState = () => {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (error) {
      return false;
    }
  };

  const writeDisabledState = (isDisabled) => {
    try {
      if (isDisabled) {
        window.localStorage.setItem(STORAGE_KEY, 'true');
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      return;
    }
  };

  const setGaDisabledFlag = (isDisabled) => {
    window[`ga-disable-${GA_MEASUREMENT_ID}`] = isDisabled;
  };

  const cleanAnalyticsParam = () => {
    try {
      const url = new URL(window.location.href);
      if (!url.searchParams.has('analytics')) return;
      url.searchParams.delete('analytics');
      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState({}, document.title, nextUrl);
    } catch (error) {
      return;
    }
  };

  const syncDisabledStateFromQuery = () => {
    try {
      const url = new URL(window.location.href);
      const rawValue = url.searchParams.get('analytics');
      if (!rawValue) return;

      const normalizedValue = rawValue.trim().toLowerCase();
      if (DISABLE_VALUES.has(normalizedValue)) {
        writeDisabledState(true);
      } else if (ENABLE_VALUES.has(normalizedValue)) {
        writeDisabledState(false);
      }

      cleanAnalyticsParam();
    } catch (error) {
      return;
    }
  };

  const loadScript = (src) => {
    if ([...document.scripts].some((script) => script.src === src)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  };

  syncDisabledStateFromQuery();

  const isAnalyticsDisabled = readDisabledState();
  setGaDisabledFlag(isAnalyticsDisabled);

  window.portfolioAnalytics = {
    disable() {
      writeDisabledState(true);
      setGaDisabledFlag(true);
    },
    enable() {
      writeDisabledState(false);
      setGaDisabledFlag(false);
    },
    isDisabled() {
      return readDisabledState();
    }
  };

  if (isAnalyticsDisabled) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`);

  window.ym = window.ym || function ym() {
    (window.ym.a = window.ym.a || []).push(arguments);
  };
  window.ym.l = Date.now();

  window.ym(YANDEX_METRIKA_ID, 'init', {
    ssr: true,
    webvisor: true,
    clickmap: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: window.location.href,
    accurateTrackBounce: true,
    trackLinks: true
  });

  loadScript(`https://mc.yandex.ru/metrika/tag.js?id=${YANDEX_METRIKA_ID}`);
})();
