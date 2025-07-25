import IntlMessageFormat from "intl-messageformat";

export function formatRichTextMessage(
  message: string,
  locale: string,
  values: Record<string, any>): string {
  const formatter = new IntlMessageFormat(message, locale);
  return formatter.format(values) as string;
}
