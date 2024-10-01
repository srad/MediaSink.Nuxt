import { messages } from './messages';

export default defineI18nConfig(() => ({
  legacy: false,
  locales: [ 'en', 'de' ],
  defaultLocale: 'en',
  messages,
}));