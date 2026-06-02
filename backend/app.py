from flask import Flask, jsonify
from flask_cors import CORS
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from werkzeug.exceptions import HTTPException

from config import AppConfig
from utils.exceptions import APIError, InternalServerError
from utils.formatters import format_error_response

def create_app(config_class=AppConfig):
    app = Flask(__name__)
    app.config.from_object(config_class)

    if app.config.get('SENTRY_DSN'):
        sentry_sdk.init(
            dsn=app.config.get('SENTRY_DSN'),
            integrations=[FlaskIntegration()],
            traces_sample_rate=1.0,
            profiles_sample_rate=1.0,
        )

    # Strip whitespace from each allowed origin parsed from env
    allowed_origins = [o.strip() for o in app.config.get('ALLOWED_ORIGINS', ['*'])]
    CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({"status": "healthy", "version": "1.0.0"}), 200

    from routes.auth import auth_bp
    from routes.patients import patients_bp
    from routes.records import records_bp
    from routes.medications import medications_bp
    from routes.ai import ai_bp
    from routes.doctors import doctors_bp
    from routes.admin import admin_bp
    from routes.feedback import feedback_bp

    app.register_blueprint(auth_bp,        url_prefix='/api/v1/auth')
    app.register_blueprint(patients_bp,    url_prefix='/api/v1/patients')
    app.register_blueprint(records_bp,     url_prefix='/api/v1/records')
    app.register_blueprint(medications_bp, url_prefix='/api/v1/medications')
    app.register_blueprint(ai_bp,          url_prefix='/api/v1/ai')
    app.register_blueprint(doctors_bp,     url_prefix='/api/v1/doctors')
    app.register_blueprint(admin_bp,       url_prefix='/api/v1/admin')
    app.register_blueprint(feedback_bp,    url_prefix='/api/v1/feedback')

    @app.errorhandler(APIError)
    def handle_api_error(error):
        return format_error_response(error.code, error.message, error.status, error.details)

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        code = "RESOURCE_NOT_FOUND" if error.code == 404 else "INTERNAL_ERROR"
        return format_error_response(code, error.description, error.code)

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        internal_error = InternalServerError()
        return format_error_response(
            internal_error.code,
            internal_error.message,
            internal_error.status,
            {"exception": str(error)}
        )

    # Initialize Background Scheduler
    from apscheduler.schedulers.background import BackgroundScheduler
    from services.notification_service import NotificationService
    import logging

    # Configure basic logging if not already configured
    logging.basicConfig(level=logging.INFO)

    # Initialize scheduler
    scheduler = BackgroundScheduler(daemon=True)
    
    # Schedule medication reminders every minute
    scheduler.add_job(
        func=NotificationService.check_medication_reminders,
        trigger="interval",
        minutes=1,
        id="medication_reminders_job",
        name="Check medication reminders every minute",
        replace_existing=True,
    )
    
    # Schedule refill alerts every day at 10:00 AM UTC
    scheduler.add_job(
        func=NotificationService.check_refill_alerts,
        trigger="cron",
        hour=10,
        minute=0,
        id="refill_alerts_job",
        name="Check refill alerts daily",
        replace_existing=True,
    )

    # Start the scheduler when not running in testing or command-line mode
    import sys
    if "pytest" not in sys.modules and not app.config.get("TESTING"):
        try:
            scheduler.start()
        except Exception as e:
            app.logger.error(f"Failed to start scheduler: {e}")

    return app

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=10000)