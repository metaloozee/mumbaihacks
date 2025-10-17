import { initialAssessment } from "@mumbaihacks/db";
import { TRPCError } from "@trpc/server";
import { and, eq, type SQL } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const assessmentsRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		const filters: SQL[] = [];

		if (userRole === "clinician") {
			filters.push(eq(initialAssessment.clinicianId, userId));
		} else if (userRole === "patient") {
			filters.push(eq(initialAssessment.patientId, userId));
		} else if (userRole === "admin") {
			// Admin can see all assessments - no filter needed
		} else {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Invalid role",
			});
		}

		const assessments = await ctx.db
			.select()
			.from(initialAssessment)
			.where(filters.length > 0 ? and(...filters) : undefined);

		return assessments;
	}),

	getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		const assessment = await ctx.db
			.select()
			.from(initialAssessment)
			.where(eq(initialAssessment.id, input.id))
			.limit(1);

		if (assessment.length === 0) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Assessment not found",
			});
		}

		const data = assessment[0];

		if (data && userRole === "patient" && data.patientId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this assessment",
			});
		}

		if (data && userRole === "clinician" && data.clinicianId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this assessment",
			});
		}

		return data;
	}),

	create: protectedProcedure
		.input(
			z.object({
				patientId: z.string(),
				appointmentId: z.string().optional(),
				chiefComplaint: z.string(),
				vitalSigns: z
					.object({
						bloodPressure: z.string().optional(),
						heartRate: z.number().optional(),
						temperature: z.number().optional(),
						respiratoryRate: z.number().optional(),
						oxygenSaturation: z.number().optional(),
						weight: z.number().optional(),
						height: z.number().optional(),
					})
					.optional(),
				assessmentNotes: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can create assessments",
				});
			}

			const result = await ctx.db
				.insert(initialAssessment)
				.values({
					patientId: input.patientId,
					clinicianId: userId,
					appointmentId: input.appointmentId,
					chiefComplaint: input.chiefComplaint,
					vitalSigns: input.vitalSigns,
					assessmentNotes: input.assessmentNotes,
				})
				.returning();

			return result[0];
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				chiefComplaint: z.string().optional(),
				vitalSigns: z
					.object({
						bloodPressure: z.string().optional(),
						heartRate: z.number().optional(),
						temperature: z.number().optional(),
						respiratoryRate: z.number().optional(),
						oxygenSaturation: z.number().optional(),
						weight: z.number().optional(),
						height: z.number().optional(),
					})
					.optional(),
				assessmentNotes: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can update assessments",
				});
			}

			const assessment = await ctx.db
				.select()
				.from(initialAssessment)
				.where(eq(initialAssessment.id, input.id))
				.limit(1);

			if (assessment.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Assessment not found",
				});
			}

			if (assessment[0] && assessment[0].clinicianId !== userId && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own assessments",
				});
			}

			const result = await ctx.db
				.update(initialAssessment)
				.set({
					...input,
					updatedAt: new Date(),
				})
				.where(eq(initialAssessment.id, input.id))
				.returning();

			return result[0];
		}),
});
