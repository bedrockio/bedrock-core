export function parseUserAgent(ua) {
  // Device detection
  const isMobile = /Mobi|Android/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  const device = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  // OS detection
  let os = 'Unknown';
  if (/Windows NT/.test(ua)) os = 'Windows';
  else if (/Mac OS X/.test(ua)) os = 'Mac OS';
  else if (/Android/.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/.test(ua)) os = 'Ios';
  else if (/Linux/.test(ua)) os = 'Linux';

  // Browser detection
  let browser = 'Unknown';

  if (/Edg\//.test(ua)) {
    browser = 'Edge';
  } else if (/OPR\//.test(ua)) {
    browser = 'Opera';
  } else if (/SamsungBrowser/.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/Vivaldi/.test(ua)) {
    browser = 'Vivaldi';
  } else if (/DuckDuckGo/.test(ua)) {
    browser = 'DuckDuckGo';
  } else if (/YaBrowser/.test(ua)) {
    browser = 'Yandex';
  } else if (/UCBrowser/.test(ua)) {
    browser = 'UC Browser';
  } else if (/Brave\//.test(ua)) {
    browser = 'Brave';
  } else if (/Chromium/.test(ua)) {
    browser = 'Chromium';
  } else if (
    /Chrome\/(?!.*Edg|.*OPR|.*Brave|.*Vivaldi|.*YaBrowser|.*UCBrowser)/.test(ua)
  ) {
    browser = 'Chrome';
  } else if (/Firefox\//.test(ua)) {
    browser = 'Firefox';
  } else if (/Safari\//.test(ua) && !/Chrome|Chromium|OPR|Edg/.test(ua)) {
    browser = 'Safari';
  }

  return { device, os, browser };
}
