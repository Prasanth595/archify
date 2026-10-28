import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { parse } from '../story/vendor/html-parser.mjs';
import { isSiblingHtmlHref } from '../renderers/shared/cli.mjs';

const walk = node => [node, ...(node.childNodes || []).flatMap(walk)];
const attr = (node, name) => node.attrs?.find(a => a.name === name)?.value;

export async function linkedPages(directory, mainName, editorUrl) {
  const allowed = new Set(), sockets = new Set();
  let port, resolveClosed;
  const closed = new Promise(resolve => { resolveClosed = resolve; });
  const register = html => {
    for (const node of walk(parse(String(html)))) {
      const links = [attr(node,'href'),attr(node,'data-parent-href')];
      const drilldowns = attr(node,'data-node-drilldowns');
      if (drilldowns) {
        try { links.push(...JSON.parse(drilldowns).map(d => d.href)); } catch (_) {}
      }
      for (const href of links) if (isSiblingHtmlHref(href)) allowed.add(href.split(/[?#]/)[0]);
    }
  };
  const server = http.createServer((req,res) => {
    const headers = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Cross-Origin-Resource-Policy':'same-origin'};
    if (req.headers.host !== `127.0.0.1:${port}` || !['GET','HEAD'].includes(req.method)) {res.writeHead(403,headers);res.end();return;}
    let url;
    try { url = new URL(req.url,`http://127.0.0.1:${port}`); }
    catch (_) {res.writeHead(400,headers);res.end();return;}
    const name = url.pathname.slice(1);
    if (name === mainName) {res.writeHead(302,{...headers,Location:editorUrl()+url.search});res.end();return;}
    if (!allowed.has(name)) {res.writeHead(404,headers);res.end();return;}
    try {
      const file = path.join(directory,name), real = fs.realpathSync.native(file);
      if (path.dirname(real) !== directory || !fs.lstatSync(file).isFile()) throw Error('Not a sibling page.');
      const content = fs.readFileSync(real);register(content);
      res.writeHead(200,{...headers,'Content-Type':'text/html; charset=utf-8','Content-Length':content.length});
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (_) {res.writeHead(404,headers);res.end();}
  });
  server.on('connection',socket=>{sockets.add(socket);socket.once('close',()=>sockets.delete(socket));});
  await new Promise((resolve,reject)=>{
    server.once('error',reject);server.listen(0,'127.0.0.1',()=>{server.off('error',reject);port=server.address().port;resolve();});
  });
  let stopping = false;
  return { register, closed,
    redirect(url) {return allowed.has(url.pathname.slice(1)) ? `http://127.0.0.1:${port}${url.pathname}${url.search}` : null;},
    stop() {if(stopping)return;stopping=true;server.close(resolveClosed);for(const socket of sockets)socket.destroy();},
  };
}
