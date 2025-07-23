import React from "react";
import { useIntl } from "./context";
import { TProps } from "./types";

export function T({ id, defaultMessage, values, children }: TProps) {
  const intl = useIntl();

  const formattedMessage = intl.formatMessage({
    id,
    defaultMessage,
    values
  });

  // If onRender is provided, use it to render the translation
  if (intl.onRender) {
    const translationRecord = {
      translationKey: id,
      translation: formattedMessage,
      locale: intl.locale,
      values
    };
    return <>{intl.onRender(translationRecord)}</>;
  }

  // If children render prop is provided, use it
  if (children && typeof children === 'function') {
    return <>{children(formattedMessage)}</>;
  }

  return <>{formattedMessage}</>;
}
