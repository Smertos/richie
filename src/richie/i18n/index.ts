import i18next, { TFunction } from 'i18next';
import FsBackend from 'i18next-fs-backend';

export function setupI18n(): Promise<TFunction> {
  return i18next
    .use(FsBackend)
    .init({
      backend: {
        addPath: './locales/{{lng}}/{{ns}}.missing.json',
        loadPath: './locales/{{lng}}/{{ns}}.json'
      },
      defaultNS: 'common',
      fallbackLng: 'en-US',
      ns: ['common']
    });
}
