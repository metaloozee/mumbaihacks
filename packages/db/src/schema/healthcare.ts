import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const appointmentStatusEnum = pgEnum("appointment_status", ["pending", "confirmed", "completed", "cancelled"]);

export const clinicianPatient = pgTable("clinician_patient", {
	id: text("id").primaryKey(),
	clinicianId: text("clinician_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	patientId: text("patient_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const appointment = pgTable("appointment", {
	id: text("id").primaryKey(),
	patientId: text("patient_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	clinicianId: text("clinician_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	scheduledAt: timestamp("scheduled_at").notNull(),
	status: appointmentStatusEnum("status").notNull().default("pending"),
	notes: text("notes"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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

export const prescription = pgTable("prescription", {
	id: text("id").primaryKey(),
	appointmentId: text("appointment_id")
		.notNull()
		.references(() => appointment.id, { onDelete: "cascade" }),
	medication: text("medication").notNull(),
	dosage: text("dosage").notNull(),
	instructions: text("instructions"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
});
