import datetime
from typing import Dict, Any, List
from services.firebase_service import FirebaseService
from models.medication import Medication, AdherenceLog
from utils.exceptions import ResourceNotFoundError

class MedicationService:
    COLLECTION = "medications"

    @staticmethod
    def get_medications(patient_uid: str) -> List[Dict[str, Any]]:
        return FirebaseService.query_documents(MedicationService.COLLECTION, "patient_uid", "==", patient_uid)

    @staticmethod
    def get_medication(med_id: str, patient_uid: str) -> Dict[str, Any]:
        med = FirebaseService.get_document(MedicationService.COLLECTION, med_id)
        if med.get("patient_uid") != patient_uid:
            raise ResourceNotFoundError({"collection": MedicationService.COLLECTION, "doc_id": med_id})
        return med

    @staticmethod
    def create_medication(patient_uid: str, data: dict) -> dict:
        data["patient_uid"] = patient_uid
        data["created_at"] = datetime.datetime.now(datetime.timezone.utc)
        if "adherence_log" not in data:
            data["adherence_log"] = []
            
        medication_obj = Medication(**data)
        doc_id = FirebaseService.create_document(MedicationService.COLLECTION, medication_obj.model_dump(mode='json'))
        return MedicationService.get_medication(doc_id, patient_uid)

    @staticmethod
    def update_medication(med_id: str, patient_uid: str, data: dict) -> dict:
        med = MedicationService.get_medication(med_id, patient_uid)
        med.update(data)
        # Validate through Pydantic
        medication_obj = Medication(**med)
        FirebaseService.update_document(MedicationService.COLLECTION, med_id, medication_obj.model_dump(mode='json'))
        return MedicationService.get_medication(med_id, patient_uid)

    @staticmethod
    def delete_medication(med_id: str, patient_uid: str) -> None:
        MedicationService.get_medication(med_id, patient_uid)
        FirebaseService.delete_document(MedicationService.COLLECTION, med_id)

    @staticmethod
    def mark_dose(med_id: str, patient_uid: str, date_str: str, taken: bool) -> dict:
        med = MedicationService.get_medication(med_id, patient_uid)
        adherence_log = med.get("adherence_log", [])
        
        # Check if already marked for this date
        existing_log = next((log for log in adherence_log if log["date"] == date_str), None)
        if existing_log:
            existing_log["taken"] = taken
            existing_log["taken_at"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
        else:
            new_log = AdherenceLog(
                date=date_str, 
                taken=taken, 
                taken_at=datetime.datetime.now(datetime.timezone.utc)
            )
            adherence_log.append(new_log.model_dump(mode='json'))
            
        med["adherence_log"] = adherence_log
        medication_obj = Medication(**med)
        FirebaseService.update_document(MedicationService.COLLECTION, med_id, medication_obj.model_dump(mode='json'))
        return MedicationService.get_medication(med_id, patient_uid)
