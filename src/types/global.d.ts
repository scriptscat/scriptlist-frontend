import type { AbstractIntlMessages } from 'next-intl';

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends AbstractIntlMessages {
    common: {
      loading: string;
      error: string;
      success: string;
      cancel: string;
      confirm: string;
      save: string;
      delete: string;
      edit: string;
      search: string;
      back: string;
      next: string;
      previous: string;
    };
    nav: {
      home: string;
      scripts: string;
      login: string;
      logout: string;
      profile: string;
    };
    pages: {
      home: {
        title: string;
        description: string;
      };
      scripts: {
        title: string;
        noScripts: string;
        searchPlaceholder: string;
      };
    };
  }
}

export {};
