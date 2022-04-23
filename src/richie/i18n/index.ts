import { init, TFunction, use } from 'i18next';
import FsBackend from 'i18next-fs-backend';

export function setupI18n(): Promise<TFunction> {
    use(FsBackend);

    return init({
      backend: {
        addPath: './locales/{{lng}}/{{ns}}.missing.json',
        loadPath: './locales/{{lng}}/{{ns}}.json'
      },
      defaultNS: 'common',
      fallbackLng: 'en-US',
      ns: ['common']
    });
}
