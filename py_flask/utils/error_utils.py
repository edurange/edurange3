
from flask import jsonify

def handle_error(error):
    response = jsonify({"error": f"Error from flask public_route: {error}"})
    response.status_code = error.status_code
    response.content_type = "application/json"
    return response

def teapot(error):
    response = jsonify({"error": f"Tea spilled."})
    response.status_code = 418
    response.content_type = "application/json"
    return response
