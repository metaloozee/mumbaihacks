import { dischargeSummary } from "@mumbaihacks/db";
import { TRPCError } from "@trpc/server";
import { and, eq, type SQL } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const dischargeRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		const filters: SQL[] = [];

		if (userRole === "clinician") {
			filters.push(eq(dischargeSummary.clinicianId, userId));
		} else if (userRole === "patient") {
			filters.push(eq(dischargeSummary.patientId, userId));
		} else if (userRole === "admin") {
			// Admin can see all discharge summaries - no filter needed
		} else {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Invalid role",
			});
		}

		const summaries = await ctx.db
			.select()
			.from(dischargeSummary)
			.where(filters.length > 0 ? and(...filters) : undefined);

		return summaries;
	}),

	getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		const summary = await ctx.db.select().from(dischargeSummary).where(eq(dischargeSummary.id, input.id)).limit(1);

		if (summary.length === 0) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Discharge summary not found",
			});
		}

		const data = summary[0];

		if (data && userRole === "patient" && data.patientId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this discharge summary",
			});
		}

		if (data && userRole === "clinician" && data.clinicianId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this discharge summary",
			});
		}

		return data;
	}),

	create: protectedProcedure
		.input(
			z.object({
				patientId: z.string(),
				appointmentId: z.string().optional(),
				dischargeDate: z.string(),
				dischargeDiagnosis: z.string(),
				treatmentProvided: z.string(),
				followUpInstructions: z.string().optional(),
				medications: z.string().optional(),
				restrictions: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can create discharge summaries",
				});
			}

			const result = await ctx.db
				.insert(dischargeSummary)
				.values({
					patientId: input.patientId,
					clinicianId: userId,
					appointmentId: input.appointmentId,
					dischargeDate: input.dischargeDate,
					dischargeDiagnosis: input.dischargeDiagnosis,
					treatmentProvided: input.treatmentProvided,
					followUpInstructions: input.followUpInstructions,
					medications: input.medications,
					restrictions: input.restrictions,
				})
				.returning();

			return result[0];
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				dischargeDate: z.string().optional(),
				dischargeDiagnosis: z.string().optional(),
				treatmentProvided: z.string().optional(),
				followUpInstructions: z.string().optional(),
				medications: z.string().optional(),
				restrictions: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can update discharge summaries",
				});
			}

			const summary = await ctx.db
				.select()
				.from(dischargeSummary)
				.where(eq(dischargeSummary.id, input.id))
				.limit(1);

			if (summary.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Discharge summary not found",
				});
			}

			if (summary[0] && summary[0].clinicianId !== userId && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own discharge summaries",
				});
			}

			const result = await ctx.db
				.update(dischargeSummary)
				.set({
					...input,
					updatedAt: new Date(),
				})
				.where(eq(dischargeSummary.id, input.id))
				.returning();

			return result[0];
		}),
});
