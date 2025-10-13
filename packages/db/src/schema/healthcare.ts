import { index, integer, pgEnum, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const appointmentStatusEnum = pgEnum("appointment_status", ["pending", "confirmed", "completed", "cancelled"]);

export const prescriptionStatusEnum = pgEnum("prescription_status", ["active", "expired", "filled", "cancelled"]);

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
		.references(() => user.id, { onDelete: "cascade" }),
	clinicianId: text("clinician_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	diagnosis: text("diagnosis").notNull(),
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
