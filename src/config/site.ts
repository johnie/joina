export const SITE_URL = 'https://joina.johnie.se';

export const SITE_METADATA = {
  NAME: 'Joina',
  TITLE: 'Joina - Jobbansökningar',
  DESCRIPTION: 'Ansök om lediga tjänster',
} as const;

export const SEO = {
  DEFAULT_CHANGE_FREQ: 'weekly',
  DEFAULT_PRIORITY: '0.8',
  HOMEPAGE_PRIORITY: '1.0',
} as const;

export const R2_BUCKETS = {
  PRODUCTION: 'joina',
  PREVIEW: 'joina-bucket-preview',
} as const;

export const GITHUB = {
  OWNER: 'johnie',
  REPO: 'joina',
  URL: 'https://github.com/johnie/joina',
} as const;

export const EMAIL = {
  FROM: 'noreply@johnie.se',
  FROM_NAME: 'Joina',
  TO: 'jobb@johnie.se',
} as const;
