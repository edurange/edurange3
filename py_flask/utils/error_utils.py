
import json
from datetime import datetime
from flask import jsonify, make_response
from werkzeug.exceptions import HTTPException

class CustomHTTPException(HTTPException):
    def __init__(self, response):
        self.response = response

def custom_abort(message="Unspecified Server Error", status_code=500):
    # `jsonify` happily serializes str/dict/list — but NOT arbitrary exception
    # objects. Routes like `general_error_handler` reach this with the raw
    # caught exception (e.g. `custom_abort(error)`). Without this guard,
    # jsonify raises a second TypeError and Flask returns its default HTML 500
    # page, masking the original error. Coerce only exception instances to str
    # so legitimate dict/list payloads (some callers pass structured bodies)
    # still serialize normally. Marshmallow ValidationErrors are intercepted
    # earlier by `validation_error_handler` and never reach here.
    if isinstance(message, BaseException):
        message = str(message) or type(message).__name__
    response = make_response(jsonify({'error': message}), status_code)
    raise CustomHTTPException(response)

def validation_error_handler(err):
    """Turn a marshmallow/ValidationError into a JSON 422 response.

    `err.messages` is the marshmallow standard, e.g.
        {'username': ['Missing data for required field.'],
         'password': ['Shorter than minimum length 3.']}
    Most existing clients (Login.jsx, ErrorModal) read the `error` key as a
    flat string, so we flatten messages into one and also include the
    structured `details` for future clients.
    """
    messages = getattr(err, 'messages', None) or {}
    flat = []
    for field, msgs in messages.items():
        if isinstance(msgs, (list, tuple)):
            for m in msgs:
                flat.append(f'{field}: {m}' if field != '_schema' else str(m))
        elif isinstance(msgs, dict):
            flat.append(f'{field}: {json.dumps(msgs)}')
        else:
            flat.append(f'{field}: {msgs}')
    error_str = '; '.join(flat) if flat else 'Validation failed'
    return make_response(
        jsonify({'error': error_str, 'details': messages}),
        422,
    )

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