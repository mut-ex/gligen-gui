import flask
import json
import urllib.request
import urllib.parse
import urllib.error

VERSION = "0.1"

global BOXES
global BASE_PROMPT
def create_app(comfy_port=8188,comfy_host="127.0.0.1"):
  app = flask.Flask(__name__, instance_relative_config=True)
  app.config['CORS_HEADERS'] = 'Content-Type'

  @app.route("/")
  @app.route("/port/<port_number>")
  @app.route("/port/<port_number>/host/<host_name>")
  def index(port_number=8188,host_name="127.0.0.1"):
      print(f"{host_name}:{port_number}")
      return flask.render_template('base.html', version_number=VERSION)


  @app.route("/object_info/<class_name>", methods=['GET'])
  def get_object_info(class_name=None):
      print("Get Object Info: ", class_name)
      req = urllib.request.Request(
          f"http://{comfy_host}:{comfy_port}/object_info/{class_name}")
      try:
          response = urllib.request.urlopen(req)
          return response
      except urllib.error.HTTPError as e:
          return e.read()


  @app.route("/<endpoint>", methods=['GET'])
  def get_endpoint(endpoint=None):
      args = flask.request.args
      if len(args) > 0:
          queries = urllib.parse.urlencode(dict(args))
          try:
              res = urllib.request.urlopen(f"http://{comfy_host}:{comfy_port}/{endpoint}?{queries}")
              return res
          except urllib.error.HTTPError as e:
              return e.read()

      req = urllib.request.Request(f"http://{comfy_host}:{comfy_port}/{endpoint}")
      try:
          response = urllib.request.urlopen(req)
          return response
      except urllib.error.HTTPError as e:
          return e.read()


  @app.route("/<endpoint>", methods=['POST'])
  def post_endpoint(endpoint=None):
      payload = flask.request.get_json()
      data = json.dumps(payload).encode('utf-8')
      req = urllib.request.Request(f"http://{comfy_host}:{comfy_port}/{endpoint}",
                                  data=data)
      try:
          response = urllib.request.urlopen(req)
          return response
      except urllib.error.HTTPError as e:
          return e.read()


  @app.route('/input_args', methods=['GET'])
  def get_inputs():
      global BOXES
      global BASE_PROMPT
      return {"boxes": BOXES, "positive_prompt": BASE_PROMPT}


  @app.route('/input_args', methods=['POST'])
  def post_inputs():
      global BOXES
      global BASE_PROMPT
      input_args = flask.request.get_json()
      BOXES = [box[1] for box in input_args["boxes"]]
      BASE_PROMPT = input_args['positive_prompt']
      return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
  if comfy_port != 8188 or comfy_host != "127.0.0.1":
      print(f"Go to: http://{comfy_host}:5000/port/{comfy_port}/host/{comfy_host}")
  else:
      print(f"Go to: http://{comfy_host}:5000/")
  return app
