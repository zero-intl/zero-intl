import React from "react";
import { useIntl, useTranslations } from "./context";
import { TProps } from "./types";

export function T({ id, defaultMessage, values }: TProps) {
  const intl = useIntl();
  const t = useTranslations();

  const formattedMessage = t(id, values, defaultMessage);

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
