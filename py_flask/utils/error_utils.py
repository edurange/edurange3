
from flask import jsonify

# import inspect (for error handling to find what function called an error)

class ErrorHandler:
    def __init__(self, message, status_code=500):
        self.message = message
        self.status_code = status_code

    def get_response(self):
        response = jsonify({"error": self.message})
        response.status_code = self.status_code
        response.content_type = "application/json"
        return response

# status_code = getattr(error, 'status_code', 500)
# message = getattr()

class Err_Custom_FullInfo(ErrorHandler):
    def __init__(self, err_message, err_code):

        message = "Unknown Error"
        if err_code is not None: status_code = err_code
        if err_message is not None: message = err_message

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
