// Telegram WebApp SDK helpers (gracefully works in both Telegram Mini App and browser preview)

export function getTelegramWebApp() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp || null : null;
}

export function syncTelegramChrome(theme = 'light') {
  const bg = theme === 'dark' ? '#120e12' : '#f8f2f5';
  if (typeof document !== 'undefined') {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg);
  }
  const tg = getTelegramWebApp();
  if (!tg) return;
  try {
    tg.setHeaderColor?.(bg);
    tg.setBackgroundColor?.(bg);
    tg.setBottomBarColor?.(bg);
  } catch {
    // Ignore on older Telegram clients
  }
}

export function initTelegramWebApp() {
  const tg = getTelegramWebApp();
  if (!tg) return null;
  try {
    tg.ready();
    tg.expand();
    syncTelegramChrome(getTelegramColorScheme());
  } catch {
    // Ignore outside Telegram
  }
  return tg;
}

export function getTelegramUserId() {
  const tg = getTelegramWebApp();
  const id = tg?.initDataUnsafe?.user?.id;
  return id ? String(id) : '';
}

export function getTelegramInitData() {
  const tg = getTelegramWebApp();
  return tg?.initData || '';
}

export function getTelegramColorScheme() {
  const tg = getTelegramWebApp();
  if (tg?.colorScheme === 'dark' || tg?.colorScheme === 'light') {
    return tg.colorScheme;
  }
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export function getLaunchTarget() {
  const tg = getTelegramWebApp();
  const startParam = tg?.initDataUnsafe?.start_param || '';
  const params = new URLSearchParams(window.location.search);

  if (startParam.startsWith('visitor_')) {
    return { tab: 'visitors', visitorId: startParam.slice('visitor_'.length), settings: '' };
  }
  if (startParam.startsWith('settings_')) {
    return { tab: 'profile', visitorId: '', settings: startParam.slice('settings_'.length) };
  }
  if (startParam === 'visitors') return { tab: 'visitors', visitorId: '', settings: '' };
  if (startParam === 'probe') return { tab: 'probe', visitorId: '', settings: '' };
  if (startParam === 'sites') return { tab: 'sites', visitorId: '', settings: '' };

  const tab = params.get('tab') || 'profile';
  const visitorId = params.get('uid') || '';
  const settings = params.get('settings') || '';
  return { tab, visitorId, settings };
}

export function haptic(type = 'light') {
  const tg = getTelegramWebApp();
  try {
    if (type === 'success' || type === 'warning' || type === 'error') {
      tg?.HapticFeedback?.notificationOccurred?.(type);
    } else {
      tg?.HapticFeedback?.impactOccurred?.(type);
    }
  } catch {
    // No-op outside Telegram
  }
}

export function openExternalUrl(url) {
  if (!url) return;
  const tg = getTelegramWebApp();
  if (tg && /^https:\/\/t\.me\//i.test(url) && typeof tg.openTelegramLink === 'function') {
    tg.openTelegramLink(url);
    return;
  }
  if (tg && typeof tg.openLink === 'function') {
    tg.openLink(url);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function copyText(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(String(text));
    haptic('light');
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = String(text);
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  }
}
