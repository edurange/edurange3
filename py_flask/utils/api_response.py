"""
Standardized API Response utilities for consistent JSON responses
"""
from flask import jsonify
from datetime import datetime
from .error_utils import make_json_serializable

class ApiResponse:
    """
    Standardized API response wrapper to ensure consistent JSON responses
    """
    
    @staticmethod
    def success(data=None, message="Operation successful", meta=None):
        """
        Create a successful API response
        
        Args:
            data: Response data (any serializable object)
            message: Success message
            meta: Additional metadata (pagination, etc.)
        
        Returns:
            Flask JSON response with 200 status
        """
        response_data = {
            "success": True,
            "message": message,
            "data": make_json_serializable(data) if data is not None else None,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if meta:
            response_data["meta"] = make_json_serializable(meta)
            
        return jsonify(response_data), 200
    
    @staticmethod
    def error(message="An error occurred", error_code=None, details=None, status_code=400):
        """
        Create an error API response
        
        Args:
            message: Error message
            error_code: Specific error code
            details: Additional error details
            status_code: HTTP status code
        
        Returns:
            Flask JSON response with specified status
        """
        response_data = {
            "success": False,
            "error": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if error_code:
            response_data["error_code"] = error_code
            
        if details:
            response_data["details"] = make_json_serializable(details)
            
        return jsonify(response_data), status_code
    
    @staticmethod
    def validation_error(field_errors, message="Validation failed"):
        """
        Create a validation error response
        
        Args:
            field_errors: Dictionary of field -> error messages
            message: General validation message
        
        Returns:
            Flask JSON response with 422 status
        """
        return ApiResponse.error(
            message=message,
            error_code="VALIDATION_ERROR",
            details={"field_errors": field_errors},
            status_code=422
        )
    
    @staticmethod
    def not_found(resource="Resource", message=None):
        """
        Create a not found error response
        
        Args:
            resource: Resource name that wasn't found
            message: Custom message
        
        Returns:
            Flask JSON response with 404 status
        """
        if not message:
            message = f"{resource} not found"
            
        return ApiResponse.error(
            message=message,
            error_code="NOT_FOUND",
            status_code=404
        )
    
    @staticmethod
    def unauthorized(message="Authentication required"):
        """
        Create an unauthorized error response
        
        Returns:
            Flask JSON response with 401 status
        """
        return ApiResponse.error(
            message=message,
            error_code="UNAUTHORIZED",
            status_code=401
        )
    
    @staticmethod
    def forbidden(message="Access forbidden"):
        """
        Create a forbidden error response
        
        Returns:
            Flask JSON response with 403 status
        """
        return ApiResponse.error(
            message=message,
            error_code="FORBIDDEN", 
            status_code=403
        )
    
    @staticmethod
    def server_error(message="Internal server error", details=None):
        """
        Create a server error response
        
        Args:
            message: Error message
            details: Additional error details
        
        Returns:
            Flask JSON response with 500 status
        """
        return ApiResponse.error(
            message=message,
            error_code="SERVER_ERROR",
            details=details,
            status_code=500
        )

# Convenience functions for backwards compatibility
def success_response(data=None, message="Success"):
    """Backwards compatible success response"""
    return ApiResponse.success(data=data, message=message)

def error_response(message="Error", status_code=400):
    """Backwards compatible error response"""
    return ApiResponse.error(message=message, status_code=status_code)
