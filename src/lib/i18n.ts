import { LOCALES, type Locale, type Text } from './schema.ts';

export { LOCALES, type Locale };

/** Resolves a project text for a language; German falls back to English. */
export function tx(text: Text | undefined, locale: Locale): string {
  if (text === undefined) return '';
  if (typeof text === 'string') return text;
  return (locale === 'de' ? text.de : undefined) ?? text.en;
}

/** A site path in the given language: href('de', '/pincel/') → '/de/pincel/'. */
export function href(locale: Locale, path: string): string {
  return locale === 'en' ? path : `/${locale}${path}`;
}

/** The same page in the other language. */
export function switchLocale(pathname: string, to: Locale): string {
  const bare = pathname.replace(/^\/de(?=\/|$)/, '') || '/';
  return href(to, bare);
}

export function localeFromParam(param: string | undefined): Locale {
  return param === 'de' ? 'de' : 'en';
}

/** Static paths for the language segment: '' (English) and 'de'. */
export const localeParams = [{ locale: undefined }, { locale: 'de' }] as const;

const en = {
  siteName: 'amigo-labs',
  siteTagline: 'Fast, open-source tools — built in Rust, made to last.',
  siteIntro:
    'Small, focused applications and libraries. Native where it counts, free to use, and developed in the open.',
  projects: 'Projects',
  allReleases: 'Release notes',
  inDevelopment: 'In development',
  skip: 'Skip to content',
  language: 'Language',
  status: {
    released: 'Released',
    beta: 'Beta',
    'in-development': 'In development',
    planned: 'Planned',
  },
  featureStatus: { 'in-progress': 'In progress', planned: 'Planned' },
  platforms: {
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
    web: 'Web',
    android: 'Android',
    ios: 'iOS',
    docker: 'Docker',
    node: 'Node.js',
    browser: 'Browser',
  },
  version: 'Version',
  released: 'released',
  license: 'License',
  source: 'Source code',
  features: 'Features',
  compare: 'Comparison',
  benchmarks: 'Measured',
  download: 'Download',
  downloads: 'Downloads',
  install: 'Install',
  copy: 'Copy',
  copied: 'Copied',
  checksums: 'Checksums',
  checksumsHint: 'Verify a download against the SHA-256 sums of this release.',
  noRelease: 'There is no release yet. Follow the development on GitHub.',
  noDownloads: 'No downloads for this project.',
  latestRelease: 'Latest release',
  releaseNotes: 'Release notes',
  olderReleases: 'All release notes',
  viewOnGitHub: 'View on GitHub',
  packages: 'Packages',
  packagesIntro: 'Every package is a drop-in replacement for its npm counterpart.',
  asOf: 'As of',
  yes: 'Yes',
  no: 'No',
  partial: 'Partly',
  lowerIsBetter: 'lower is better',
  higherIsBetter: 'higher is better',
  method: 'Method',
  machine: 'Machine',
  forYourSystem: 'For your system',
  prerelease: 'Pre-release',
  updated: 'Data as of',
  privacy: 'Privacy',
  notFound: 'Page not found',
  notFoundText: 'This page does not exist (anymore).',
  backHome: 'Back to the overview',
  learnMore: 'Learn more',
  noReleasesYet: 'No releases yet.',
  installNotes: 'Installation notes',
  logoAlt: 'The amigo-labs logo: a pixel-art letter A filled with a castle, a dragon, the sea, a neon city, a forest and the desert',
  platformsLabel: 'Platforms',
  overview: 'Overview',
  more: 'More',
};

type Messages = typeof en;

const de: Messages = {
  siteName: 'amigo-labs',
  siteTagline: 'Schnelle Open-Source-Werkzeuge — in Rust gebaut, auf Dauer angelegt.',
  siteIntro:
    'Kleine, fokussierte Anwendungen und Bibliotheken. Nativ, wo es zählt, kostenlos nutzbar und offen entwickelt.',
  projects: 'Projekte',
  allReleases: 'Release Notes',
  inDevelopment: 'In Entwicklung',
  skip: 'Zum Inhalt springen',
  language: 'Sprache',
  status: {
    released: 'Veröffentlicht',
    beta: 'Beta',
    'in-development': 'In Entwicklung',
    planned: 'Geplant',
  },
  featureStatus: { 'in-progress': 'In Arbeit', planned: 'Geplant' },
  platforms: {
    windows: 'Windows',
    macos: 'macOS',
    linux: 'Linux',
    web: 'Web',
    android: 'Android',
    ios: 'iOS',
    docker: 'Docker',
    node: 'Node.js',
    browser: 'Browser',
  },
  version: 'Version',
  released: 'veröffentlicht',
  license: 'Lizenz',
  source: 'Quellcode',
  features: 'Funktionen',
  compare: 'Vergleich',
  benchmarks: 'Gemessen',
  download: 'Herunterladen',
  downloads: 'Downloads',
  install: 'Installieren',
  copy: 'Kopieren',
  copied: 'Kopiert',
  checksums: 'Prüfsummen',
  checksumsHint: 'Prüfe einen Download gegen die SHA-256-Summen dieses Releases.',
  noRelease: 'Es gibt noch kein Release. Die Entwicklung läuft auf GitHub.',
  noDownloads: 'Für dieses Projekt gibt es keine Downloads.',
  latestRelease: 'Neuestes Release',
  releaseNotes: 'Release Notes',
  olderReleases: 'Alle Release Notes',
  viewOnGitHub: 'Auf GitHub ansehen',
  packages: 'Pakete',
  packagesIntro: 'Jedes Paket ersetzt sein npm-Gegenstück ohne Codeänderung.',
  asOf: 'Stand',
  yes: 'Ja',
  no: 'Nein',
  partial: 'Teilweise',
  lowerIsBetter: 'weniger ist besser',
  higherIsBetter: 'mehr ist besser',
  method: 'Methode',
  machine: 'Rechner',
  forYourSystem: 'Für dein System',
  prerelease: 'Vorabversion',
  updated: 'Datenstand',
  privacy: 'Datenschutz',
  notFound: 'Seite nicht gefunden',
  notFoundText: 'Diese Seite gibt es nicht (mehr).',
  backHome: 'Zur Übersicht',
  learnMore: 'Mehr erfahren',
  noReleasesYet: 'Noch keine Releases.',
  installNotes: 'Hinweise zur Installation',
  logoAlt: 'Das amigo-labs-Logo: ein Pixel-Art-Buchstabe A mit Burg, Drache, Meer, Neonstadt, Wald und Wüste',
  platformsLabel: 'Plattformen',
  overview: 'Überblick',
  more: 'Mehr',
};

const messages: Record<Locale, Messages> = { en, de };

export function ui(locale: Locale): Messages {
  return messages[locale];
}

export function formatDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatSize(bytes: number, locale: Locale): string {
  const mb = bytes / (1024 * 1024);
  const n = mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10;
  return `${n.toLocaleString(locale === 'de' ? 'de-DE' : 'en-GB')} MB`;
}
