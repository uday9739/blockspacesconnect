/*
 * Helper library for modal dialogs
 */

import { ParsedUrlQuery } from "querystring";

/** Returns a copy of the given query object, with the "modal" key removed */
export const queryWithoutModal = (query: ParsedUrlQuery) => {
  if (!query) return query;

  const { modal, ...queryWithoutModal } = query;
  return queryWithoutModal;
}