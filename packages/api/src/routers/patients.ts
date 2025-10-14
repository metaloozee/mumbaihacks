import { clinicianPatient, user } from "@mumbaihacks/db";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const patientsRouter = router({
	// List patients (for clinicians) or clinicians (for patients)
	list: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		if (userRole === "clinician") {
			// Get all patients assigned to this clinician
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
			// Get all clinicians assigned to this patient
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
			// Admin can see all relationships
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

	// Get available patients (for clinicians to add)
	getAvailablePatients: protectedProcedure.query(async ({ ctx }) => {
		const userRole = ctx.session.user.role;

		if (userRole !== "clinician" && userRole !== "admin") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Only clinicians can view available patients",
			});
		}

		// Get all users with patient role
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

	// Skeleton for adding a patient to a clinician
	addPatient: protectedProcedure
		.input(
			z.object({
				patientId: z.string(),
			})
		)
		.mutation(({ ctx, input }) => {
			const userRole = ctx.session.user.role;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians and admins can add patients",
				});
			}

			// TODO: Implement patient assignment logic
			throw new TRPCError({
				code: "NOT_IMPLEMENTED",
				message: "Patient assignment not yet implemented",
			});
		}),

	// Skeleton for removing a patient from a clinician
	removePatient: protectedProcedure
		.input(
			z.object({
				relationshipId: z.string(),
			})
		)
		.mutation(({ ctx }) => {
			const userRole = ctx.session.user.role;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can remove patients",
				});
			}

			// TODO: Implement patient removal logic
			throw new TRPCError({
				code: "NOT_IMPLEMENTED",
				message: "Patient removal not yet implemented",
			});
		}),
});
