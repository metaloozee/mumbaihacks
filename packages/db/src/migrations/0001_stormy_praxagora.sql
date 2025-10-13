CREATE TYPE "public"."user_role" AS ENUM('patient', 'clinician', 'admin');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "appointment" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"clinician_id" text NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"status" "appointment_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinician_patient" (
	"id" text PRIMARY KEY NOT NULL,
	"clinician_id" text NOT NULL,
	"patient_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_record" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"clinician_id" text NOT NULL,
	"diagnosis" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prescription" (
	"id" text PRIMARY KEY NOT NULL,
	"appointment_id" text NOT NULL,
	"medication" text NOT NULL,
	"dosage" text NOT NULL,
	"instructions" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "user_role" DEFAULT 'patient' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointment" ADD CONSTRAINT "appointment_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinician_patient" ADD CONSTRAINT "clinician_patient_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clinician_patient" ADD CONSTRAINT "clinician_patient_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_patient_id_user_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_record" ADD CONSTRAINT "medical_record_clinician_id_user_id_fk" FOREIGN KEY ("clinician_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescription" ADD CONSTRAINT "prescription_appointment_id_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointment"("id") ON DELETE cascade ON UPDATE no action;