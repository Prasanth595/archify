import pathlib,json,http.server,argparse
r=pathlib.Path(__file__).resolve().parent
assets={a['name']:pathlib.Path(a['path']) for a in json.loads((r/'runtime.json').read_text())['assets']}
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(r),**kwargs)
 def translate_path(self,path):
  name=path.split('?',1)[0].removeprefix('/vendor/')
  if path.startswith('/vendor/') and name in assets:return str(assets[name])
  return super().translate_path(path)
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8873);a=p.parse_args()
http.server.ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
