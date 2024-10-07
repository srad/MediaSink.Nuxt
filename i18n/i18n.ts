import { messages } from './messages';
import { defineI18nConfig } from '#i18n';

export default defineI18nConfig(() => ({
  legacy: false,
  locales: [ 'en', 'de' ],
  defaultLocale: 'en',
  messages,
}));
