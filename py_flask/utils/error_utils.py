
import json
from datetime import datetime
from flask import jsonify, make_response
from werkzeug.exceptions import HTTPException

class CustomHTTPException(HTTPException):
    def __init__(self, response):
        self.response = response

def custom_abort(message="Unspecified Server Error", status_code=500):
    response = make_response(jsonify({'error': message}), status_code)
    raise CustomHTTPException(response)

def safe_jsonify(data, status_code=200):
    """
    Safely serialize data to JSON, handling non-serializable objects.
    """
    try:
        return jsonify(data), status_code
    except TypeError as e:
        if "not JSON serializable" in str(e):
            # Convert data to a JSON-serializable format
            serialized_data = make_json_serializable(data)
            return jsonify(serialized_data), status_code
        else:
            # Re-raise if it's a different type error
            raise e

def make_json_serializable(obj):
    """
    Recursively convert an object to be JSON serializable.
    """
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif hasattr(obj, 'to_dict'):
        return obj.to_dict()
    elif isinstance(obj, dict):
        return {key: make_json_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [make_json_serializable(item) for item in obj]
    elif isinstance(obj, tuple):
        return [make_json_serializable(item) for item in obj]
    elif isinstance(obj, set):
        return [make_json_serializable(item) for item in obj]
    else:
        # For basic types (str, int, float, bool, None) or unknown objects
        try:
            json.dumps(obj)  # Test if it's serializable
            return obj
        except TypeError:
            # If not serializable, convert to string representation
            return str(obj)