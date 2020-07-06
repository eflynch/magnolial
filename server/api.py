from flask import Blueprint, request, jsonify

api = Blueprint("api", __name__)

@api.route("/", methods=['POST'])
def command(session_id):
    pay_load = request.get_json()
    return jsonify({

    })


@api.route("/pixels", methods=['GET'])
def state(session_id):
    return jsonify({
    })
