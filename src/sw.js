importScripts('/deps/gunzip.min.js', 'utils.js');
const hostable = [
  'publish.html',
  'username.html',
  'tvision.css',
  'wallet.js',
  'utils.js',
  'sw.js',
  'config.json',
  'deps/coinbase.min.js',
  'deps/gzip.min.js',
  'deps/web3.min.js',
  'deps/web3modal.min.js',
];

self.addEventListener('fetch', (event) => {
  event.respondWith(loader(event.request));
});

async function loader(request) {
  const config = await (await fetch('/config.json')).json();
  if(!request.url.startsWith(config.root)) return fetch(request);
  const url = request.url.slice(config.root.length);
  if(hostable.indexOf(url) !== -1) return fetch(request);
  let path = url.match(/^([^\/]+)\/([\s\S]+)?/);
  if(!path) {
    path = config.home;
  }
  const doc = await loadDocument(path[1], path[2], config);
  if(doc) {
    const separator = (path[2] || '').lastIndexOf('.');
    let extension;
    if(separator !== -1) {
      extension = path[2].slice(separator + 1);
    }
    let type;
    switch(extension) {
      case 'png': type = 'image/png'; break;
      case 'gif': type = 'image/gif'; break;
      case 'jpg': case 'jpeg': type = 'image/jpeg'; break;
      case 'svg': type = 'image/svg+xml'; break;
      case 'webp': type = 'image/webp'; break;
      case 'txt': type = 'text/plain'; break;
      case 'css': type = 'text/css'; break;
      case 'js': type = 'application/javascript'; break;
      case 'json': type = 'application/json'; break;
      case 'mp3': type = 'audio/mpeg'; break;
      case 'mp4': type = 'video/mp4'; break;
      case 'mpeg': type = 'video/mpeg'; break;
      case 'pdf': type = 'application/pdf'; break;
      case 'zip': type = 'application/zip'; break;
      default: type = 'text/html'; break;
    }
    return new Response(doc, {
      headers: { 'Content-Type': type }
    });
  } else {
    return new Response(`<p>Unable to load document</p>`, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

async function accountById(id, config) {
  const req = {
    "jsonrpc":"2.0","id":9,"method":"eth_call","params":[{
      "to": config.contracts.UniqueId.address,
      data: `0x4b529c80000000000000000000000000${id}`
    },"latest"]
  };
  const response = await fetch(config.rpc, {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {"Content-type": "application/json; charset=UTF-8"}
  })
  const json = await response.json();
  return '0x' + json.result.slice(-40);
}
async function loadDocument(address, name, config) {
  if(!address.match(/^0x[a-f0-9]{40}$/i)) {
    address = await accountById(await sha1(address), config);
  }
  const id = await sha1(name);
  const req = {
    "jsonrpc":"2.0","id":9,"method":"eth_call","params":[{
      "to": config.contracts.Documents.address,
      data: `0x6ac35f5b000000000000000000000000${address.slice(2)}000000000000000000000000${id}`
    },"latest"]
  };
  const response = await fetch(config.rpc, {
    method: 'POST',
    body: JSON.stringify(req),
    headers: {"Content-type": "application/json; charset=UTF-8"}
  })
  const json = await response.json();
  if(json.result) {
    const len = parseInt(json.result.slice(66, 66+64), 16);
    const zipped = json.result.slice(66+64, 66+64+(len*2));
    const data = Uint8Array.from(zipped.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
    const gunzip = new Zlib.Gunzip(data);
    return gunzip.decompress();
  }
}
