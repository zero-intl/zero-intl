import React from "react";
import { useIntl } from "./context";
import { TProps } from "./types";

export function T({ id, defaultMessage, values }: TProps) {
  const intl = useIntl();

  const formattedMessage = intl.formatMessage({
    id,
    defaultMessage,
    values
  });

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
