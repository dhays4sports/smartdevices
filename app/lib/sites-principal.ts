/** Only consume these headers behind the Sites dispatcher, which owns authentication. */
export function sitesPrincipal(headers: Headers): string | null {
  const id = headers.get("oai-authenticated-user-id");
  return id && id.length <= 256 && !/[\s\x00-\x1f]/.test(id) ? `sites:${id}` : null;
}
