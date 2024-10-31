
from quart import jsonify, make_response
from werkzeug.exceptions import HTTPException

class CustomHTTPException(HTTPException):
    def __init__(self, response):
        self.response = response

def custom_abort(message="Unspecified Server Error", status_code=500):
    response = make_response(jsonify({'error': message}), status_code)
    raise CustomHTTPException(response)