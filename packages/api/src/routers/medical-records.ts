import { medicalRecord } from "@mumbaihacks/db";
import { TRPCError } from "@trpc/server";
import { and, eq, type SQL } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const medicalRecordsRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		// Build filter based on role
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
			.select()
			.from(medicalRecord)
			.where(filters.length > 0 ? and(...filters) : undefined);

		return records;
	}),

	getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		const recordData = await ctx.db.select().from(medicalRecord).where(eq(medicalRecord.id, input.id)).limit(1);

		if (recordData.length === 0) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Medical record not found",
			});
		}

		const record = recordData[0];

		// Check access permissions
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

	// Skeleton for creating medical records (clinicians only)
	create: protectedProcedure
		.input(
			z.object({
				patientId: z.string(),
				diagnosis: z.string(),
				notes: z.string().optional(),
			})
		)
		.mutation(({ ctx }) => {
			const userRole = ctx.session.user.role;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians and admins can create medical records",
				});
			}

			// TODO: Implement medical record creation logic
			throw new TRPCError({
				code: "NOT_IMPLEMENTED",
				message: "Medical record creation not yet implemented",
			});
		}),

	// Skeleton for updating medical records
	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				diagnosis: z.string().optional(),
				notes: z.string().optional(),
			})
		)
		.mutation(({ ctx }) => {
			const userRole = ctx.session.user.role;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians and admins can update medical records",
				});
			}

			// TODO: Implement medical record update logic
			throw new TRPCError({
				code: "NOT_IMPLEMENTED",
				message: "Medical record update not yet implemented",
			});
		}),
});
