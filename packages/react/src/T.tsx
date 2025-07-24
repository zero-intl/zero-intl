import React from "react";
import { useIntl, useTranslations } from "./context";
import { TProps } from "./types";

export function T({ id, defaultMessage, values }: TProps) {
  const t = useTranslations();
  const intl = useIntl();

  // Use the new t function signature
  const formattedMessage = defaultMessage || values
    ? t(id, { defaultMessage, ...values })
    : t(id);

  if (intl.onRender) {
    const translationRecord = {
      translationKey: id,
      translation: formattedMessage,
      locale: intl.locale,
      values
    };
    return <>{intl.onRender(translationRecord)}</>;
  }

  return <>{formattedMessage}</>;
}
