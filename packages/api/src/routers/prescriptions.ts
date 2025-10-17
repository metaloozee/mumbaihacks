import { appointment, prescription, user } from "@mumbaihacks/db";
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

		const prescriptionData = await ctx.db
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
				patientName: user.name,
				patientEmail: user.email,
			})
			.from(prescription)
			.innerJoin(appointment, eq(prescription.appointmentId, appointment.id))
			.innerJoin(user, eq(appointment.patientId, user.id))
			.where(eq(prescription.id, input.id))
			.limit(1);

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
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can create prescriptions",
				});
			}

			const appt = await ctx.db
				.select()
				.from(appointment)
				.where(eq(appointment.id, input.appointmentId))
				.limit(1);

			if (appt.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Appointment not found",
				});
			}

			if (appt[0] && appt[0].clinicianId !== userId && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only create prescriptions for your own appointments",
				});
			}

			const result = await ctx.db
				.insert(prescription)
				.values({
					appointmentId: input.appointmentId,
					prescriberId: userId,
					medication: input.medication,
					dosage: input.dosage,
					duration: input.duration,
					refills: input.refills,
					expiryDate: input.expiryDate,
					instructions: input.instructions,
				})
				.returning();

			return result[0];
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.enum(["active", "expired", "filled", "cancelled"]).optional(),
				instructions: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can update prescriptions",
				});
			}

			const presc = await ctx.db.select().from(prescription).where(eq(prescription.id, input.id)).limit(1);

			if (presc.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Prescription not found",
				});
			}

			if (presc[0] && presc[0].prescriberId !== userId && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own prescriptions",
				});
			}

			const result = await ctx.db
				.update(prescription)
				.set({
					...input,
					updatedAt: new Date(),
				})
				.where(eq(prescription.id, input.id))
				.returning();

			return result[0];
		}),

	requestRefill: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		if (userRole !== "patient") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "Only patients can request refills",
			});
		}

		const prescData = await ctx.db
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
				patientId: appointment.patientId,
			})
			.from(prescription)
			.innerJoin(appointment, eq(prescription.appointmentId, appointment.id))
			.where(eq(prescription.id, input.id))
			.limit(1);

		if (prescData.length === 0) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Prescription not found",
			});
		}

		const presc = prescData[0];

		if (presc && presc.patientId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You can only request refills for your own prescriptions",
			});
		}

		if (presc && presc.status !== "active" && presc.status !== "expired") {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: "Can only request refills for active or expired prescriptions",
			});
		}

		const result = await ctx.db
			.update(prescription)
			.set({
				refills: (presc?.refills ?? 0) + 1,
				updatedAt: new Date(),
			})
			.where(eq(prescription.id, input.id))
			.returning();

		return result[0];
	}),
});
