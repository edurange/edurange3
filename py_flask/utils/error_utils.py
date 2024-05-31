
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
    def __init__(self, error):
        # Initialize default message and status_code
        message = "Unknown Error"
        status_code = 500

        # Extract message from error
        if hasattr(error, 'message'):
            message = error.message
        elif hasattr(error, 'args') and error.args:
            # Use the first argument of the error as the message
            message = error.args[0]

        # Extract status code from error
        if hasattr(error, 'status_code'):
            status_code = error.status_code

        # Call the superclass constructor with the extracted values
        super().__init__(message, status_code)



# class Err_Custom_FullInfo(ErrorHandler):
#     def __init__(self, error):
#         super().__init__(error)


# class Err_Custom_FullInfo(ErrorHandler):
#     def __init__(self, message="Unknown Error", status_code=500):
#         super().__init__(message, status_code)

class Err_Custom_MinInfo(ErrorHandler):
    def __init__(self, status_code=500):
        super().__init__("An error occurred.", status_code)

class CustomValidationError(Exception):
    def __init__(self, message, status_code=400):
        Exception.__init__(self)
        self.message = message
        self.status_code = status_code

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
