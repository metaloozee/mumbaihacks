CREATE TYPE "public"."user_role" AS ENUM('patient', 'clinician', 'admin');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."order_priority" AS ENUM('routine', 'urgent', 'stat');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'in-progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('lab', 'imaging');--> statement-breakpoint
CREATE TYPE "public"."prescription_status" AS ENUM('active', 'expired', 'filled', 'cancelled');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'patient' NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "appointment" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"clinician_id" text NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"status" "appointment_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"cancellation_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinician_patient" (
	"id" text PRIMARY KEY NOT NULL,
	"clinician_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clinician_patient_clinician_id_patient_id_unique" UNIQUE("clinician_id","patient_id")
);
--> statement-breakpoint
CREATE TABLE "discharge_summary" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"clinician_id" text NOT NULL,
	"appointment_id" text,
	"discharge_date" timestamp with time zone NOT NULL,
	"discharge_diagnosis" text NOT NULL,
	"treatment_provided" text NOT NULL,
	"follow_up_instructions" text,
	"medications" text,
	"restrictions" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "initial_assessment" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"clinician_id" text NOT NULL,
	"appointment_id" text,
	"chief_complaint" text NOT NULL,
	"vital_signs" jsonb,
	"assessment_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_order" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"clinician_id" text NOT NULL,
	"appointment_id" text,
	"order_type" "order_type" NOT NULL,
	"order_details" text NOT NULL,
	"priority" "order_priority" DEFAULT 'routine' NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_record" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"clinician_id" text NOT NULL,
	"past_medical_history" text,
	"allergies" text,
	"current_medications" text,
	"medications_history" text,
	"vitals" text,
	"symptoms" text,
	"diagnosis" text NOT NULL,
	"treatment_required" boolean DEFAULT false NOT NULL,
	"treatment_details" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_result" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"result_data" text NOT NULL,
	"interpretation_notes" text,
	"result_date" timestamp with time zone NOT NULL,
	"attachment_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_demographics" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"gender" text NOT NULL,
	"phone" text NOT NULL,
	"address" text NOT NULL,
	"emergency_contact_name" text NOT NULL,
	"emergency_contact_phone" text NOT NULL,
	"blood_type" text,
	"preferred_language" text DEFAULT 'English' NOT NULL,
	"occupation" text,
	"marital_status" text,
	"insurance_provider" text,
	"insurance_policy_number" text,
	"insurance_provider_website" text,
	"insurance_claim_form_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patient_demographics_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "prescription" (
	"id" text PRIMARY KEY NOT NULL,
	"appointment_id" text NOT NULL,
	"prescriber_id" text NOT NULL,
	"medication" text NOT NULL,
	"dosage" text NOT NULL,
	"duration" text NOT NULL,
	"refills" integer DEFAULT 0 NOT NULL,
	"expiry_date" timestamp with time zone NOT NULL,
	"status" "prescription_status" DEFAULT 'active' NOT NULL,
	"instructions" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinician_patient" ADD CONSTRAINT "clinician_patient_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinician_patient" ADD CONSTRAINT "clinician_patient_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discharge_summary" ADD CONSTRAINT "discharge_summary_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discharge_summary" ADD CONSTRAINT "discharge_summary_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discharge_summary" ADD CONSTRAINT "discharge_summary_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initial_assessment" ADD CONSTRAINT "initial_assessment_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initial_assessment" ADD CONSTRAINT "initial_assessment_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initial_assessment" ADD CONSTRAINT "initial_assessment_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_order" ADD CONSTRAINT "medical_order_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_order" ADD CONSTRAINT "medical_order_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_order" ADD CONSTRAINT "medical_order_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_result" ADD CONSTRAINT "order_result_order_id_medical_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."medical_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_demographics" ADD CONSTRAINT "patient_demographics_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_prescriber_id_user_id_fk" FOREIGN KEY ("prescriber_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "appointment_patient_id_idx" ON "appointment" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "appointment_clinician_id_idx" ON "appointment" USING btree ("clinician_id");--> statement-breakpoint
CREATE INDEX "appointment_scheduled_at_idx" ON "appointment" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "discharge_summary_patient_id_idx" ON "discharge_summary" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "discharge_summary_clinician_id_idx" ON "discharge_summary" USING btree ("clinician_id");--> statement-breakpoint
CREATE INDEX "initial_assessment_patient_id_idx" ON "initial_assessment" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "initial_assessment_clinician_id_idx" ON "initial_assessment" USING btree ("clinician_id");--> statement-breakpoint
CREATE INDEX "initial_assessment_appointment_id_idx" ON "initial_assessment" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "medical_order_patient_id_idx" ON "medical_order" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "medical_order_clinician_id_idx" ON "medical_order" USING btree ("clinician_id");--> statement-breakpoint
CREATE INDEX "medical_order_status_idx" ON "medical_order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_result_order_id_idx" ON "order_result" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "patient_demographics_user_id_idx" ON "patient_demographics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "prescription_appointment_id_idx" ON "prescription" USING btree ("appointment_id");