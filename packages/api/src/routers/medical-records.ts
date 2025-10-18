import { medicalRecord, user } from "@mumbaihacks/db";
import { TRPCError } from "@trpc/server";
import { and, eq, type SQL } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const medicalRecordsRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		const filters: SQL[] = [];

		if (userRole === "clinician") {
			filters.push(eq(medicalRecord.clinicianId, userId));
		} else if (userRole === "patient") {
			filters.push(eq(medicalRecord.patientId, userId));
		} else if (userRole === "admin") {
			// Admin can see all records - no filter needed
		} else {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Invalid role",
			});
		}

		const records = await ctx.db
			.select({
				id: medicalRecord.id,
				patientId: medicalRecord.patientId,
				clinicianId: medicalRecord.clinicianId,
				diagnosis: medicalRecord.diagnosis,
				notes: medicalRecord.notes,
				createdAt: medicalRecord.createdAt,
				updatedAt: medicalRecord.updatedAt,
				clinicianName: user.name,
				clinicianEmail: user.email,
			})
			.from(medicalRecord)
			.innerJoin(user, eq(medicalRecord.clinicianId, user.id))
			.where(filters.length > 0 ? and(...filters) : undefined);

		return records;
	}),

	getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		const recordData = await ctx.db
			.select({
				id: medicalRecord.id,
				patientId: medicalRecord.patientId,
				clinicianId: medicalRecord.clinicianId,
				diagnosis: medicalRecord.diagnosis,
				notes: medicalRecord.notes,
				createdAt: medicalRecord.createdAt,
				updatedAt: medicalRecord.updatedAt,
				clinicianName: user.name,
				clinicianEmail: user.email,
			})
			.from(medicalRecord)
			.innerJoin(user, eq(medicalRecord.clinicianId, user.id))
			.where(eq(medicalRecord.id, input.id))
			.limit(1);

		if (recordData.length === 0) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Medical record not found",
			});
		}

		const record = recordData[0];

		if (record && userRole === "patient" && record.patientId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this medical record",
			});
		}

		if (record && userRole === "clinician" && record.clinicianId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this medical record",
			});
		}

		return record;
	}),

	create: protectedProcedure
		.input(
			z.object({
				patientId: z.string(),
				diagnosis: z.string(),
				notes: z.string().optional(),
				pastMedicalHistory: z.string().optional(),
				allergies: z.string().optional(),
				currentMedications: z.string().optional(),
				medicationsHistory: z.string().optional(),
				vitals: z.string().optional(),
				symptoms: z.string().optional(),
				treatmentRequired: z.boolean().default(false),
				treatmentDetails: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians and admins can create medical records",
				});
			}

			const result = await ctx.db
				.insert(medicalRecord)
				.values({
					id: crypto.randomUUID(),
					patientId: input.patientId,
					clinicianId: userId,
					diagnosis: input.diagnosis,
					notes: input.notes,
					pastMedicalHistory: input.pastMedicalHistory,
					allergies: input.allergies,
					currentMedications: input.currentMedications,
					medicationsHistory: input.medicationsHistory,
					vitals: input.vitals,
					symptoms: input.symptoms,
					treatmentRequired: input.treatmentRequired,
					treatmentDetails: input.treatmentDetails,
				})
				.returning();

			return result[0];
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				diagnosis: z.string().optional(),
				notes: z.string().optional(),
				pastMedicalHistory: z.string().optional(),
				allergies: z.string().optional(),
				currentMedications: z.string().optional(),
				medicationsHistory: z.string().optional(),
				vitals: z.string().optional(),
				symptoms: z.string().optional(),
				treatmentRequired: z.boolean().optional(),
				treatmentDetails: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians and admins can update medical records",
				});
			}

			const record = await ctx.db.select().from(medicalRecord).where(eq(medicalRecord.id, input.id)).limit(1);

			if (record.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Medical record not found",
				});
			}

			if (record[0] && record[0].clinicianId !== userId && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own medical records",
				});
			}

			const result = await ctx.db
				.update(medicalRecord)
				.set({
					...input,
					updatedAt: new Date(),
				})
				.where(eq(medicalRecord.id, input.id))
				.returning();

			return result[0];
		}),
});
