'use client';

import { usePathname, useRouter } from 'next/navigation';

import { LOCALES, type Locale } from '@/lib/i18n/config';

/**
 * Sélecteur de langue.
 *
 * Remplace le segment de langue dans l'URL courante et pose un cookie
 * `locale` pour que le choix soit mémorisé (le proxy le relit ensuite).
 *
 * Un `<select>` natif plutôt qu'un menu maison : accessible et compact.
 */
export function LocaleSwitcher({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function switchTo(next: Locale) {
    if (next === current) return;
    // pathname commence par /<locale> ; on remplace ce premier segment.
    const rest = pathname.replace(/^\/[^/]+/, '') || '/';
    document.cookie = `locale=${next}; path=/; max-age=31536000; samesite=lax`;
    router.push(`/${next}${rest === '/' ? '' : rest}`);
  }

  return (
    <label className="relative flex items-center">
      <span className="sr-only">{label}</span>
      <select
        value={current}
        onChange={(event) => switchTo(event.target.value as Locale)}
        className="cursor-pointer appearance-none rounded-xs bg-transparent py-1.5 ps-2 pe-6 text-2xs tracking-(--tracking-label) text-ivory/70 uppercase transition-colors hover:text-gold focus-visible:outline-2"
      >
        {LOCALES.map((locale) => (
          <option key={locale} value={locale} className="bg-noir-2 text-ivory">
            {locale.toUpperCase()}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute end-1 h-3 w-3 text-ivory/50"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}
