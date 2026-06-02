import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from firebase_admin import messaging
from services.firebase_service import db, FirebaseService

logger = logging.getLogger(__name__)

class NotificationService:
    @staticmethod
    def send_push_notification(user_id: str, title: str, body: str, data: Dict[str, str] = None) -> None:
        """Sends an FCM push notification to a user's registered device tokens."""
        try:
            user_doc = FirebaseService.get_document('users', user_id)
            tokens = user_doc.get('fcm_tokens', [])
            
            if not tokens:
                logger.info(f"No FCM tokens found for user {user_id}. Skipping notification.")
                return

            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data or {},
                tokens=tokens
            )
            
            response = messaging.send_multicast(message)
            logger.info(f"Successfully sent {response.success_count} messages to user {user_id}. Failed: {response.failure_count}")
            
            # Optional: handle token cleanup for failed deliveries (e.g. unregistered tokens)
            
        except Exception as e:
            logger.error(f"Failed to send push notification to user {user_id}: {str(e)}")

    @staticmethod
    def check_medication_reminders() -> None:
        """Background job: Scans for medications due within ±7 minutes of the current time and sends reminders."""
        now = datetime.now(timezone.utc)
        current_time_str = now.strftime('%H:%M')
        # We need a small window around the current time. 
        # A simpler approach for the cron job running every minute: 
        # Find all active medications where timing array contains the current HH:MM string.
        # This requires the timing in DB to exactly match the minute, or we can query active medications and check locally.
        
        try:
            logger.info("Running medication reminder job...")
            # Fetch all active medications
            # Note: For production scale, querying all active meds is inefficient. 
            # We would ideally index by time, or run a query that filters by timing.
            # But Firestore doesn't easily support querying arrays of times for range queries.
            # We'll fetch all active and filter locally for this phase, assuming manageable scale.
            
            meds_ref = db.collection('medications').where('status', '==', 'active').stream()
            
            count = 0
            for doc in meds_ref:
                med_data = doc.to_dict()
                timings = med_data.get('timing', [])
                
                for t in timings:
                    # Parse time from string (e.g., "08:00")
                    try:
                        med_time = datetime.strptime(t, '%H:%M').time()
                        # Create a datetime object for today with the med_time for comparison
                        med_dt = datetime.combine(now.date(), med_time).replace(tzinfo=timezone.utc)
                        
                        # Check if current time is within ±7 minutes of the medication time
                        time_diff = abs((now - med_dt).total_seconds())
                        if time_diff <= 7 * 60:
                            # Time matches the window! Send notification
                            user_id = med_data.get('patient_uid')
                            med_name = med_data.get('name')
                            dosage = med_data.get('dosage')
                            
                            NotificationService.send_push_notification(
                                user_id=user_id,
                                title="Medication Reminder",
                                body=f"It's time to take your {med_name} ({dosage}).",
                                data={'type': 'medication_reminder', 'medication_id': doc.id}
                            )
                            count += 1
                            break # Don't send multiple reminders for the same med if multiple times match (unlikely but safe)
                    except ValueError:
                        logger.warning(f"Invalid time format '{t}' in medication {doc.id}")
            
            logger.info(f"Sent {count} medication reminders.")
            
        except Exception as e:
            logger.error(f"Error in check_medication_reminders: {str(e)}")

    @staticmethod
    def check_refill_alerts() -> None:
        """Background job: Scans for medications ending in < 7 days and sends refill alerts."""
        now = datetime.now(timezone.utc)
        threshold_date = now + timedelta(days=7)
        
        try:
            logger.info("Running refill alert job...")
            # Query active medications where end_date is before the threshold date and after now
            # Firestore requires an index for compound queries or range queries on multiple fields.
            # We will query active medications and filter locally.
            meds_ref = db.collection('medications').where('status', '==', 'active').stream()
            
            count = 0
            for doc in meds_ref:
                med_data = doc.to_dict()
                end_date_val = med_data.get('end_date')
                
                if end_date_val:
                    # Handle different formats Firestore might return (Datetime or string)
                    if isinstance(end_date_val, datetime):
                        end_dt = end_date_val
                    else:
                        # Attempt to parse ISO string
                        try:
                            # Replace Z with +00:00 for fromisoformat compatibility in python < 3.11, though we are on 3.11+
                            if isinstance(end_date_val, str) and end_date_val.endswith('Z'):
                                end_date_val = end_date_val[:-1] + '+00:00'
                            end_dt = datetime.fromisoformat(end_date_val)
                        except ValueError:
                            logger.warning(f"Invalid end_date format in medication {doc.id}")
                            continue

                    # Ensure timezone awareness
                    if end_dt.tzinfo is None:
                        end_dt = end_dt.replace(tzinfo=timezone.utc)

                    # Check if end date is within the next 7 days
                    if now < end_dt <= threshold_date:
                        user_id = med_data.get('patient_uid')
                        med_name = med_data.get('name')
                        days_left = (end_dt - now).days
                        
                        NotificationService.send_push_notification(
                            user_id=user_id,
                            title="Prescription Refill Alert",
                            body=f"Your prescription for {med_name} is running out in {days_left} days. Please request a refill.",
                            data={'type': 'refill_alert', 'medication_id': doc.id}
                        )
                        count += 1
                        
            logger.info(f"Sent {count} refill alerts.")
            
        except Exception as e:
            logger.error(f"Error in check_refill_alerts: {str(e)}")
