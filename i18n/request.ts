import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  console.log(locale);
  const validLocale = locale ?? 'en';
  console.log(validLocale);
  console.log(locale);

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default
  };
});