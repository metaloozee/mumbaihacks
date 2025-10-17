CREATE TYPE "public"."order_priority" AS ENUM('routine', 'urgent', 'stat');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'in-progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."order_type" AS ENUM('lab', 'imaging');--> statement-breakpoint
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patient_demographics_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "discharge_summary" ADD CONSTRAINT "discharge_summary_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discharge_summary" ADD CONSTRAINT "discharge_summary_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discharge_summary" ADD CONSTRAINT "discharge_summary_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initial_assessment" ADD CONSTRAINT "initial_assessment_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initial_assessment" ADD CONSTRAINT "initial_assessment_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "initial_assessment" ADD CONSTRAINT "initial_assessment_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_order" ADD CONSTRAINT "medical_order_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_order" ADD CONSTRAINT "medical_order_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_order" ADD CONSTRAINT "medical_order_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_result" ADD CONSTRAINT "order_result_order_id_medical_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."medical_order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_demographics" ADD CONSTRAINT "patient_demographics_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "discharge_summary_patient_id_idx" ON "discharge_summary" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "discharge_summary_clinician_id_idx" ON "discharge_summary" USING btree ("clinician_id");--> statement-breakpoint
CREATE INDEX "initial_assessment_patient_id_idx" ON "initial_assessment" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "initial_assessment_clinician_id_idx" ON "initial_assessment" USING btree ("clinician_id");--> statement-breakpoint
CREATE INDEX "initial_assessment_appointment_id_idx" ON "initial_assessment" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "medical_order_patient_id_idx" ON "medical_order" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "medical_order_clinician_id_idx" ON "medical_order" USING btree ("clinician_id");--> statement-breakpoint
CREATE INDEX "medical_order_status_idx" ON "medical_order" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_result_order_id_idx" ON "order_result" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "patient_demographics_user_id_idx" ON "patient_demographics" USING btree ("user_id");