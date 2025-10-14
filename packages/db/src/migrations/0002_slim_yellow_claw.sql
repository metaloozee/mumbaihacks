CREATE TYPE "public"."prescription_status" AS ENUM('active', 'expired', 'filled', 'cancelled');--> statement-breakpoint
ALTER TABLE "appointment" DROP CONSTRAINT "appointment_patient_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "appointment" DROP CONSTRAINT "appointment_clinician_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "clinician_patient" DROP CONSTRAINT "clinician_patient_clinician_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "clinician_patient" DROP CONSTRAINT "clinician_patient_patient_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "prescription" DROP CONSTRAINT "prescription_appointment_id_appointment_id_fk";
--> statement-breakpoint
ALTER TABLE "appointment" ALTER COLUMN "scheduled_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "clinician_patient" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "prescription" ADD COLUMN "prescriber_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prescription" ADD COLUMN "duration" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prescription" ADD COLUMN "refills" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "prescription" ADD COLUMN "expiry_date" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "prescription" ADD COLUMN "status" "prescription_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "prescription" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinician_patient" ADD CONSTRAINT "clinician_patient_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinician_patient" ADD CONSTRAINT "clinician_patient_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_prescriber_id_user_id_fk" FOREIGN KEY ("prescriber_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointment_patient_id_idx" ON "appointment" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "appointment_clinician_id_idx" ON "appointment" USING btree ("clinician_id");--> statement-breakpoint
CREATE INDEX "appointment_scheduled_at_idx" ON "appointment" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "prescription_appointment_id_idx" ON "prescription" USING btree ("appointment_id");--> statement-breakpoint
ALTER TABLE "clinician_patient" ADD CONSTRAINT "clinician_patient_clinician_id_patient_id_unique" UNIQUE("clinician_id","patient_id");