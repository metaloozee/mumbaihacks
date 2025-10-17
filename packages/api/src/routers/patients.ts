import { clinicianPatient, patientDemographics, user } from "@mumbaihacks/db";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const patientsRouter = router({
	list: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		if (userRole === "clinician") {
			const relationships = await ctx.db
				.select({
					id: clinicianPatient.id,
					patientId: clinicianPatient.patientId,
					createdAt: clinicianPatient.createdAt,
					patient: {
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
					},
				})
				.from(clinicianPatient)
				.innerJoin(user, eq(clinicianPatient.patientId, user.id))
				.where(eq(clinicianPatient.clinicianId, userId));

			return relationships.map((rel) => ({
				id: rel.id,
				patientId: rel.patientId,
				createdAt: rel.createdAt,
				patient: rel.patient,
			}));
		}

		if (userRole === "patient") {
			const relationships = await ctx.db
				.select({
					id: clinicianPatient.id,
					clinicianId: clinicianPatient.clinicianId,
					createdAt: clinicianPatient.createdAt,
					clinician: {
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
					},
				})
				.from(clinicianPatient)
				.innerJoin(user, eq(clinicianPatient.clinicianId, user.id))
				.where(eq(clinicianPatient.patientId, userId));

			return relationships.map((rel) => ({
				id: rel.id,
				clinicianId: rel.clinicianId,
				createdAt: rel.createdAt,
				clinician: rel.clinician,
			}));
		}

		if (userRole === "admin") {
			const relationships = await ctx.db
				.select({
					id: clinicianPatient.id,
					clinicianId: clinicianPatient.clinicianId,
					patientId: clinicianPatient.patientId,
					createdAt: clinicianPatient.createdAt,
				})
				.from(clinicianPatient);

			return relationships;
		}

		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Invalid role",
		});
	}),

	getAvailablePatients: protectedProcedure.query(async ({ ctx }) => {
		const userRole = ctx.session.user.role;

		if (userRole !== "clinician" && userRole !== "admin") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Only clinicians can view available patients",
			});
		}

		const patients = await ctx.db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				createdAt: user.createdAt,
			})
			.from(user)
			.where(eq(user.role, "patient"));

		return patients;
	}),

	addPatient: protectedProcedure
		.input(
			z.object({
				patientId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians and admins can add patients",
				});
			}

			const patient = await ctx.db.select().from(user).where(eq(user.id, input.patientId)).limit(1);

			if (patient.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Patient not found",
				});
			}

			if (patient[0]?.role !== "patient") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "User is not a patient",
				});
			}

			const existing = await ctx.db
				.select()
				.from(clinicianPatient)
				.where(and(eq(clinicianPatient.clinicianId, userId), eq(clinicianPatient.patientId, input.patientId)))
				.limit(1);

			if (existing.length > 0) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Patient already assigned to this clinician",
				});
			}

			const result = await ctx.db
				.insert(clinicianPatient)
				.values({
					clinicianId: userId,
					patientId: input.patientId,
				})
				.returning();

			return result[0];
		}),

	removePatient: protectedProcedure
		.input(
			z.object({
				relationshipId: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can remove patients",
				});
			}

			const relationship = await ctx.db
				.select()
				.from(clinicianPatient)
				.where(eq(clinicianPatient.id, input.relationshipId))
				.limit(1);

			if (relationship.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Relationship not found",
				});
			}

			if (relationship[0]?.clinicianId !== userId && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only remove your own patients",
				});
			}

			await ctx.db.delete(clinicianPatient).where(eq(clinicianPatient.id, input.relationshipId));

			return { success: true };
		}),

	getDemographics: protectedProcedure
		.input(
			z
				.object({
					userId: z.string().optional(),
				})
				.optional()
		)
		.query(async ({ ctx, input }) => {
			const userId = input?.userId || ctx.session.user.id;
			const userRole = ctx.session.user.role;

			if (userId !== ctx.session.user.id && userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only access your own demographics",
				});
			}

			const demographics = await ctx.db
				.select()
				.from(patientDemographics)
				.where(eq(patientDemographics.userId, userId))
				.limit(1);

			return demographics[0] || null;
		}),

	createDemographics: protectedProcedure
		.input(
			z.object({
				dateOfBirth: z.string(),
				gender: z.string(),
				phone: z.string(),
				address: z.string(),
				emergencyContactName: z.string(),
				emergencyContactPhone: z.string(),
				bloodType: z.string().optional(),
				preferredLanguage: z.string().default("English"),
				occupation: z.string().optional(),
				maritalStatus: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const userRole = ctx.session.user.role;

			if (userRole !== "patient") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only patients can create demographics",
				});
			}

			const existing = await ctx.db
				.select()
				.from(patientDemographics)
				.where(eq(patientDemographics.userId, userId))
				.limit(1);

			if (existing.length > 0) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Demographics already exist for this user",
				});
			}

			const result = await ctx.db
				.insert(patientDemographics)
				.values({
					userId,
					dateOfBirth: input.dateOfBirth,
					gender: input.gender,
					phone: input.phone,
					address: input.address,
					emergencyContactName: input.emergencyContactName,
					emergencyContactPhone: input.emergencyContactPhone,
					bloodType: input.bloodType,
					preferredLanguage: input.preferredLanguage,
					occupation: input.occupation,
					maritalStatus: input.maritalStatus,
				})
				.returning();

			return result[0];
		}),

	updateDemographics: protectedProcedure
		.input(
			z.object({
				dateOfBirth: z.string().optional(),
				gender: z.string().optional(),
				phone: z.string().optional(),
				address: z.string().optional(),
				emergencyContactName: z.string().optional(),
				emergencyContactPhone: z.string().optional(),
				bloodType: z.string().optional(),
				preferredLanguage: z.string().optional(),
				occupation: z.string().optional(),
				maritalStatus: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const userRole = ctx.session.user.role;

			if (userRole !== "patient") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only patients can update their demographics",
				});
			}

			const existing = await ctx.db
				.select()
				.from(patientDemographics)
				.where(eq(patientDemographics.userId, userId))
				.limit(1);

			if (existing.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Demographics not found. Please create them first.",
				});
			}

			const result = await ctx.db
				.update(patientDemographics)
				.set({
					...input,
					updatedAt: new Date(),
				})
				.where(eq(patientDemographics.userId, userId))
				.returning();

			return result[0];
		}),
});
