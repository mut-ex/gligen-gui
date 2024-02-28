import flask
import json
import urllib.request
import urllib.parse
import urllib.error

VERSION = "1.0"

global BOXES
global BASE_PROMPT

# def fetch_update():
#     url = "https://raw.githubusercontent.com/mut-ex/gligen-gui/main/README.md"
#     req = urllib.request.Request(url)
#     try:
#         response = urllib.request.urlopen(req)
#         return response
#     except urllib.error.HTTPError as e:
#         return e.read()

def create_app(comfy_port=8188):
    app = flask.Flask(__name__, instance_relative_config=True)
    app.config['CORS_HEADERS'] = 'Content-Type'

    # print(fetch_update().read())
    @app.route("/")
    @app.route("/port/<port_number>")
    def index(port_number=8188):
        print(port_number)
        return flask.render_template('base.html', version_number=VERSION)

    @app.route("/object_info/<class_name>", methods=['GET'])
    def get_object_info(class_name=None):
        print("Get Object Info: ", class_name)
        req = urllib.request.Request(
            f"http://127.0.0.1:{comfy_port}/object_info/{class_name}")
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
                res = urllib.request.urlopen(
                    f"http://127.0.0.1:{comfy_port}/{endpoint}?{queries}")
                return res
            except urllib.error.HTTPError as e:
                return e.read()

        req = urllib.request.Request(
            f"http://127.0.0.1:{comfy_port}/{endpoint}")
        try:
            response = urllib.request.urlopen(req)
            return response
        except urllib.error.HTTPError as e:
            return e.read()

    @app.route("/<endpoint>", methods=['POST'])
    def post_endpoint(endpoint=None):
        payload = flask.request.get_json()
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            f"http://127.0.0.1:{comfy_port}/{endpoint}", data=data)
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

    print(f"Go to: http://127.0.0.1:5000/port/{comfy_port}")

    return app
