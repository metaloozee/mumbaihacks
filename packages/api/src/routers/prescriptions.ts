import { appointment, prescription } from "@mumbaihacks/db";
import { TRPCError } from "@trpc/server";
import { and, eq, type SQL } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const prescriptionsRouter = router({
	list: protectedProcedure
		.input(
			z
				.object({
					status: z.enum(["active", "expired", "filled", "cancelled"]).optional(),
				})
				.optional()
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const userRole = ctx.session.user.role;

			// For patients, we need to join with appointments to find their prescriptions
			if (userRole === "patient") {
				const prescriptions = await ctx.db
					.select({
						id: prescription.id,
						appointmentId: prescription.appointmentId,
						prescriberId: prescription.prescriberId,
						medication: prescription.medication,
						dosage: prescription.dosage,
						duration: prescription.duration,
						refills: prescription.refills,
						expiryDate: prescription.expiryDate,
						status: prescription.status,
						instructions: prescription.instructions,
						createdAt: prescription.createdAt,
						updatedAt: prescription.updatedAt,
					})
					.from(prescription)
					.innerJoin(appointment, eq(prescription.appointmentId, appointment.id))
					.where(
						and(
							eq(appointment.patientId, userId),
							input?.status ? eq(prescription.status, input.status) : undefined
						)
					);

				return prescriptions;
			}

			const filters: SQL[] = [];

			if (userRole === "clinician") {
				filters.push(eq(prescription.prescriberId, userId));
			} else if (userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invalid role",
				});
			}

			if (input?.status) {
				filters.push(eq(prescription.status, input.status));
			}

			const prescriptions = await ctx.db
				.select()
				.from(prescription)
				.where(filters.length > 0 ? and(...filters) : undefined);

			return prescriptions;
		}),

	getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		const prescriptionData = await ctx.db.select().from(prescription).where(eq(prescription.id, input.id)).limit(1);

		const presc = prescriptionData[0];

		if (!presc) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Prescription not found",
			});
		}

		if (userRole === "clinician" && presc.prescriberId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this prescription",
			});
		}

		if (userRole === "patient") {
			const apptData = await ctx.db
				.select()
				.from(appointment)
				.where(eq(appointment.id, presc.appointmentId))
				.limit(1);

			if (apptData.length === 0 || apptData[0]?.patientId !== userId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You do not have access to this prescription",
				});
			}
		}

		return presc;
	}),

	create: protectedProcedure
		.input(
			z.object({
				appointmentId: z.string(),
				medication: z.string(),
				dosage: z.string(),
				duration: z.string(),
				refills: z.number().int().min(0).default(0),
				expiryDate: z.string(),
				instructions: z.string().optional(),
			})
		)
		.mutation(({ ctx }) => {
			const userRole = ctx.session.user.role;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can create prescriptions",
				});
			}

			// TODO: Implement prescription creation logic
			throw new TRPCError({
				code: "NOT_IMPLEMENTED",
				message: "Prescription creation not yet implemented",
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.enum(["active", "expired", "filled", "cancelled"]).optional(),
				instructions: z.string().optional(),
			})
		)
		.mutation(({ ctx }) => {
			const userRole = ctx.session.user.role;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can update prescriptions",
				});
			}

			// TODO: Implement prescription update logic
			throw new TRPCError({
				code: "NOT_IMPLEMENTED",
				message: "Prescription update not yet implemented",
			});
		}),
});
