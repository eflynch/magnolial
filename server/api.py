from flask import Blueprint, request, jsonify

from model import MagnoliaModel

api = Blueprint("api", __name__)


@api.route("/", methods=['POST'])
def command():
    pay_load = request.get_json()
    magnolia_id = pay_load.get("magnolia_id")
    with MagnoliaModel(magnolia_id, create=True, read_only=True) as magnolias:
        return jsonify(magnolias[0])


@api.route("/magnolia/<magnolia_id>", methods=['GET'])
def state(magnolia_id):
    with MagnoliaModel(magnolia_id, create=False, read_only=True) as magnolias:
        return jsonify(magnolias[0])


@api.route("/magnolia/<magnolia_id>", methods=['PATCH'])
def state_patch(magnolia_id):
    trunk = request.get_json()["magnolia"]
    with MagnoliaModel(magnolia_id, create=False, read_only=False) as magnolias:
        magnolias[0] = trunk
    return jsonify({"message": "success"})
