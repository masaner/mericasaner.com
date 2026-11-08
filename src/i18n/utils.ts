import { ui, defaultLang, type Lang, type UIKey } from './ui';

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang]?.[key] ?? ui[defaultLang][key] ?? key;
  };
}

/**
 * Calculates years of experience from a start date (e.g. "2021-07") to now.
 */
export function calculateYears(startYearMonth: string): number {
  const [yearStr, monthStr] = startYearMonth.split('-');
  const start = new Date(Number(yearStr), Number(monthStr) - 1);
  const now = new Date();
  const diffMonths =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return Math.max(1, Math.floor(diffMonths / 12));
}

/**
 * Formats a Year-Month string (e.g. "2025-12") to human localized format ("Dec 2025" / "Ara 2025")
 */
export function formatYearMonth(
  ym: string | null | undefined,
  lang: Lang,
  presentLabel: string,
): string {
  if (!ym) return presentLabel;
  const [year, month] = ym.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Helper to get clean path for alternate language
 */
export function getLocalizedPath(currentPath: string, targetLang: Lang): string {
  const isTr = currentPath.startsWith('/tr') || currentPath === '/tr';
  if (targetLang === 'tr') {
    if (isTr) return currentPath;
    return currentPath === '/' ? '/tr' : `/tr${currentPath}`;
  } else {
    // Target is EN
    if (!isTr) return currentPath;
    const stripped = currentPath.replace(/^\/tr/, '');
    return stripped === '' ? '/' : stripped;
  }
}
