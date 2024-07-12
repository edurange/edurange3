
from flask import jsonify
class ErrorHandler(Exception):
    def __init__(self, message, status_code=500):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

    def get_response(self):
        response = jsonify({"error": self.message})
        response.status_code = self.status_code
        return response

class Err_Custom_FullInfo(ErrorHandler):
    def __init__(self, error):
        message = "Unknown Error"
        status_code = 500

        if isinstance(error, dict):  # Assuming error might be passed as dict
            message = error.get('message', message)
            status_code = error.get('status_code', status_code)
        elif hasattr(error, 'message'):
            message = error.message
        if hasattr(error, 'args') and error.args:
            message = error.args[0]
        if hasattr(error, 'status_code'):
            status_code = error.status_code

        super().__init__(message, status_code)


class Err_Custom_MinInfo(ErrorHandler):
    def __init__(self, status_code=500):
        super().__init__("An error occurred.", status_code)

class CustomValidationError(Exception):
    def __init__(self, message, status_code=400):
        Exception.__init__(self)
        self.message = message
        self.status_code = status_code

# DEV_FIX , RAISE USED WRONG
def custom_abort(message, status_code=400):
    raise CustomValidationError(message, status_code)


class Err_Unexpected_FullInfo(ErrorHandler):
    def __init__(self, error):
        super().__init__(f"Unexpected Flask error: {error}", error.status_code)

class Err_Unexpected_MinInfo(ErrorHandler):
    def __init__(self):
        super().__init__("Unexpected server error.", 500)


class Err_Teapot(ErrorHandler):
    def __init__(self):
        super().__init__("Tea spilled.", 418)

class Err_InvalidCreds(ErrorHandler):
    def __init__(self):
        super().__init__("Invalid login credentials.", 403)
