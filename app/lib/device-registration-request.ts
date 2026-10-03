/** Registration accepts same-origin, bounded JSON; never dereferences user endpoints. */
export async function readDeviceRegistrationRequest(request: Request): Promise<unknown> {
  if (request.headers.get("origin") !== new URL(request.url).origin || request.headers.get("sec-fetch-site") === "cross-site") throw new Error("REGISTRATION_ORIGIN_REJECTED");
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new Error("CONTENT_TYPE");
  const maxBytes = 32_768;
  if (Number(request.headers.get("content-length")) > maxBytes) throw new Error("DEVICE_REGISTRATION_TOO_LARGE");
  if (!request.body) throw new Error("INVALID_DEVICE_REGISTRATION");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new Error("DEVICE_REGISTRATION_TOO_LARGE"); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}
