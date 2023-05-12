import { type ReactNode } from "react";
import { IntlProvider as ReactIntlProvider } from "react-intl";

import enMessages from "./translations/en.json";
//import esMessages from "translations/es_ES.json";

//import useLogin from "Hooks/useLogin";

const DefaultLocale = "en-US";

const getMessages = (locale: string) => {
  const truncatedLocale = locale.toLowerCase().split(/[_-]+/)[0];

  const matchLang = (lng: string) => {
    switch (lng) {
//      case "ta-IN":
//      case "ta":
//        return taINMessages;
      case DefaultLocale:
      case "en":
      default:
        return enMessages;
    }
  };

  return matchLang(locale) ?? matchLang(truncatedLocale) ?? enMessages;
};

export const IntlProvider = ({ children }: { children: ReactNode }) => {
//  const { language } = useLogin().preferences;
//  const locale = language ?? getLocale();
  const locale = getLocale();

  return (
    <ReactIntlProvider locale={locale} messages={getMessages(locale)}>
      {children}
    </ReactIntlProvider>
  );
};

export const getLocale = () => {
  return (navigator.languages && navigator.languages[0]) ?? navigator.language ?? DefaultLocale;
};
