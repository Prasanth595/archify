import pathlib,http.server,os
cache=pathlib.Path(os.environ.get('WAVEDROM_RESEARCH_CACHE',str(pathlib.Path.home()/'.cache/archify-research/wavedrom-375378e')))
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(cache),**kw)
http.server.ThreadingHTTPServer(('127.0.0.1',8875),Handler).serve_forever()
