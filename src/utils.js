
async function sha1(value) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-1",  new TextEncoder("utf-8").encode(value))))
    .map(byte => ('0' + byte.toString(16)).slice(-2))
    .join('');
}
