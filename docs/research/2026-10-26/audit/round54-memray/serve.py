import pathlib,json,http.server,argparse
r=pathlib.Path(__file__).resolve().parent
cache=pathlib.Path(json.loads((r/'report-asset.json').read_text())['path']).parent
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=8874);a=p.parse_args()
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(cache),**kwargs)
http.server.ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
