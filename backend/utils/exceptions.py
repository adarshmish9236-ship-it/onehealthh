class APIError(Exception):
    def __init__(self, code: str, message: str, status: int, details: dict = None):
        super().__init__()
        self.code = code
        self.message = message
        self.status = status
        self.details = details or {}

class AuthTokenInvalidError(APIError):
    def __init__(self, details: dict = None):
        super().__init__('AUTH_TOKEN_INVALID', 'Firebase token expired or invalid', 401, details)

class AuthForbiddenError(APIError):
    def __init__(self, details: dict = None):
        super().__init__('AUTH_FORBIDDEN', 'User lacks required role', 403, details)

class ResourceNotFoundError(APIError):
    def __init__(self, details: dict = None):
        super().__init__('RESOURCE_NOT_FOUND', 'Document does not exist', 404, details)

class ConsentRequiredError(APIError):
    def __init__(self, details: dict = None):
        super().__init__('CONSENT_REQUIRED', 'Doctor lacks patient consent', 403, details)

class AITimeoutError(APIError):
    def __init__(self, details: dict = None):
        super().__init__('AI_TIMEOUT', 'Gemini API did not respond within 30s', 504, details)

class FileTooLargeError(APIError):
    def __init__(self, details: dict = None):
        super().__init__('FILE_TOO_LARGE', 'Upload exceeds 20 MB limit', 413, details)

class FileTypeInvalidError(APIError):
    def __init__(self, details: dict = None):
        super().__init__('FILE_TYPE_INVALID', 'Unsupported file MIME type', 415, details)

class RateLimitExceededError(APIError):
    def __init__(self, details: dict = None):
        super().__init__('RATE_LIMIT_EXCEEDED', 'Too many requests', 429, details)

class ValidationError(APIError):
    def __init__(self, details: dict = None):
        super().__init__('VALIDATION_ERROR', 'Request body fails Pydantic validation', 422, details)

class InternalServerError(APIError):
    def __init__(self, details: dict = None):
        super().__init__('INTERNAL_ERROR', 'Unhandled server exception', 500, details)
