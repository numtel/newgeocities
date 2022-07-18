
async function sha1(value) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-1",  new TextEncoder("utf-8").encode(value))))
    .map(byte => ('0' + byte.toString(16)).slice(-2))
    .join('');
}
async function accountById(id) {
  const req = {
    "jsonrpc":"2.0","id":9,"method":"eth_call","params":[{
      "to":window.config.contracts.UniqueId.address,
      data: `0x4b529c80000000000000000000000000${id}`
    },"latest"]
  };
  const response = await fetch(window.config.rpc, {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {"Content-type": "application/json; charset=UTF-8"}
  })
  const json = await response.json();
  return '0x' + json.result.slice(-40);
}
async function loadDocument(address, name) {
  if(!address.match(/^0x[a-f0-9]{40}$/i)) {
    address = await accountById(await sha1(address));
  }
  const id = await sha1(name);
  const req = {
    "jsonrpc":"2.0","id":9,"method":"eth_call","params":[{
      "to":window.config.contracts.Documents.address,
      data: `0x6ac35f5b000000000000000000000000${address.slice(2)}000000000000000000000000${id}`
    },"latest"]
  };
  const response = await fetch(window.config.rpc, {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {"Content-type": "application/json; charset=UTF-8"}
  })
  const json = await response.json();
  const len = parseInt(json.result.slice(66, 66+64), 16);
  const zipped = json.result.slice(66+64, 66+64+(len*2));
  const data = Uint8Array.from(zipped.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  const gunzip = new Zlib.Gunzip(data);
  return new TextDecoder().decode(gunzip.decompress());
}

function htmlEscape(str) {
  return String(str).replace(/&/g, '&amp;') // first!
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/`/g, '&#96;');
}
