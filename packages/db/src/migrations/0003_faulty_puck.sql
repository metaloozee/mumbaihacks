ALTER TABLE "medical_record" DROP CONSTRAINT "medical_record_patient_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "medical_record" DROP CONSTRAINT "medical_record_clinician_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;