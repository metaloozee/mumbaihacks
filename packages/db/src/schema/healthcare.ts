import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { PassThrough } from "stream";

export const appointmentStatusEnum = pgEnum("appointment_status", ["pending", "confirmed", "completed", "cancelled"]);

export const prescriptionStatusEnum = pgEnum("prescription_status", ["active", "expired", "filled", "cancelled"]);

export const orderTypeEnum = pgEnum("order_type", ["lab", "imaging"]);

export const orderPriorityEnum = pgEnum("order_priority", ["routine", "urgent", "stat"]);

export const orderStatusEnum = pgEnum("order_status", ["pending", "in-progress", "completed", "cancelled"]);

export const clinicianPatient = pgTable(
	"clinician_patient",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		clinicianId: text("clinician_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		patientId: text("patient_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		uniqueClinicianPatient: unique().on(table.clinicianId, table.patientId),
	})
);

export const appointment = pgTable(
	"appointment",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		patientId: text("patient_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		clinicianId: text("clinician_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		scheduledAt: timestamp("scheduled_at", { mode: "string", withTimezone: true }).notNull(),
		status: appointmentStatusEnum("status").notNull().default("pending"),
		notes: text("notes"),
		cancellationReason: text("cancellation_reason"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		patientIdIdx: index("appointment_patient_id_idx").on(table.patientId),
		clinicianIdIdx: index("appointment_clinician_id_idx").on(table.clinicianId),
		scheduledAtIdx: index("appointment_scheduled_at_idx").on(table.scheduledAt),
	})
);

export const medicalRecord = pgTable("medical_record", {
	id: text("id").primaryKey(),
	patientId: text("patient_id")
		.notNull()
		.references(() => user.id, { onDelete: "restrict" }),
	clinicianId: text("clinician_id")
		.notNull()
		.references(() => user.id, { onDelete: "restrict" }),
	pastMedicalHistory: text("past_medical_history"),
	allergies: text("allergies"),
	currentMedications: text("current_medications"),
	medicationsHistory: text("medications_history"),
	vitals: text("vitals"),
	symptoms: text("symptoms"),
	diagnosis: text("diagnosis").notNull(),
	treatmentRequired: boolean("treatment_required").notNull().default(false),
	treatmentDetails: text("treatment_details"),
	notes: text("notes"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const prescription = pgTable(
	"prescription",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		appointmentId: text("appointment_id")
			.notNull()
			.references(() => appointment.id, { onDelete: "restrict" }),
		prescriberId: text("prescriber_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		medication: text("medication").notNull(),
		dosage: text("dosage").notNull(),
		duration: text("duration").notNull(),
		refills: integer("refills").notNull().default(0),
		expiryDate: timestamp("expiry_date", { mode: "string", withTimezone: true }).notNull(),
		status: prescriptionStatusEnum("status").notNull().default("active"),
		instructions: text("instructions"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		appointmentIdIdx: index("prescription_appointment_id_idx").on(table.appointmentId),
	})
);

export const patientDemographics = pgTable(
	"patient_demographics",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		userId: text("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),
		dateOfBirth: timestamp("date_of_birth", { mode: "string" }).notNull(),
		gender: text("gender").notNull(),
		phone: text("phone").notNull(),
		address: text("address").notNull(),
		emergencyContactName: text("emergency_contact_name").notNull(),
		emergencyContactPhone: text("emergency_contact_phone").notNull(),
		bloodType: text("blood_type"),
		preferredLanguage: text("preferred_language").notNull().default("English"),
		occupation: text("occupation"),
		maritalStatus: text("marital_status"),
		insuranceProvider: text("insurance_provider"),
		insurancePolicyNumber: text("insurance_policy_number"),
		insuranceProviderWebsite: text("insurance_provider_website"),
		insuranceClaimFormUrl: text("insurance_claim_form_url"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		userIdIdx: index("patient_demographics_user_id_idx").on(table.userId),
	})
);

export const initialAssessment = pgTable(
	"initial_assessment",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		patientId: text("patient_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		clinicianId: text("clinician_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		appointmentId: text("appointment_id").references(() => appointment.id, { onDelete: "set null" }),
		chiefComplaint: text("chief_complaint").notNull(),
		vitalSigns: jsonb("vital_signs"),
		assessmentNotes: text("assessment_notes"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		patientIdIdx: index("initial_assessment_patient_id_idx").on(table.patientId),
		clinicianIdIdx: index("initial_assessment_clinician_id_idx").on(table.clinicianId),
		appointmentIdIdx: index("initial_assessment_appointment_id_idx").on(table.appointmentId),
	})
);

export const medicalOrder = pgTable(
	"medical_order",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		patientId: text("patient_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		clinicianId: text("clinician_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		appointmentId: text("appointment_id").references(() => appointment.id, { onDelete: "set null" }),
		orderType: orderTypeEnum("order_type").notNull(),
		orderDetails: text("order_details").notNull(),
		priority: orderPriorityEnum("priority").notNull().default("routine"),
		status: orderStatusEnum("status").notNull().default("pending"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		patientIdIdx: index("medical_order_patient_id_idx").on(table.patientId),
		clinicianIdIdx: index("medical_order_clinician_id_idx").on(table.clinicianId),
		statusIdx: index("medical_order_status_idx").on(table.status),
	})
);

export const orderResult = pgTable(
	"order_result",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		orderId: text("order_id")
			.notNull()
			.references(() => medicalOrder.id, { onDelete: "cascade" }),
		resultData: text("result_data").notNull(),
		interpretationNotes: text("interpretation_notes"),
		resultDate: timestamp("result_date", { mode: "string", withTimezone: true }).notNull(),
		attachmentUrl: text("attachment_url"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		orderIdIdx: index("order_result_order_id_idx").on(table.orderId),
	})
);

export const dischargeSummary = pgTable(
	"discharge_summary",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		patientId: text("patient_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		clinicianId: text("clinician_id")
			.notNull()
			.references(() => user.id, { onDelete: "restrict" }),
		appointmentId: text("appointment_id").references(() => appointment.id, { onDelete: "set null" }),
		dischargeDate: timestamp("discharge_date", { mode: "string", withTimezone: true }).notNull(),
		dischargeDiagnosis: text("discharge_diagnosis").notNull(),
		treatmentProvided: text("treatment_provided").notNull(),
		followUpInstructions: text("follow_up_instructions"),
		medications: text("medications"),
		restrictions: text("restrictions"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => ({
		patientIdIdx: index("discharge_summary_patient_id_idx").on(table.patientId),
		clinicianIdIdx: index("discharge_summary_clinician_id_idx").on(table.clinicianId),
	})
);
