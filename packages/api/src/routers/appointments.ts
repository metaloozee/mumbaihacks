import { appointment, user } from "@mumbaihacks/db";
import { TRPCError } from "@trpc/server";
import { and, eq, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

const patientUser = alias(user, "patient_user");
const clinicianUser = alias(user, "clinician_user");

export const appointmentsRouter = router({
	list: protectedProcedure
		.input(
			z
				.object({
					status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
				})
				.optional()
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const userRole = ctx.session.user.role;

			const filters: SQL[] = [];

			if (userRole === "clinician") {
				filters.push(eq(appointment.clinicianId, userId));
			} else if (userRole === "patient") {
				filters.push(eq(appointment.patientId, userId));
			} else if (userRole === "admin") {
				// Admin can see all appointments - no filter needed
			} else {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invalid role",
				});
			}

			if (input?.status) {
				filters.push(eq(appointment.status, input.status));
			}

			const appointments = await ctx.db
				.select({
					id: appointment.id,
					patientId: appointment.patientId,
					clinicianId: appointment.clinicianId,
					scheduledAt: appointment.scheduledAt,
					status: appointment.status,
					notes: appointment.notes,
					cancellationReason: appointment.cancellationReason,
					createdAt: appointment.createdAt,
					updatedAt: appointment.updatedAt,
					patientName: patientUser.name,
					clinicianName: clinicianUser.name,
				})
				.from(appointment)
				.innerJoin(patientUser, eq(appointment.patientId, patientUser.id))
				.innerJoin(clinicianUser, eq(appointment.clinicianId, clinicianUser.id))
				.where(filters.length > 0 ? and(...filters) : undefined);

			return appointments;
		}),

	getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		const appointmentData = await ctx.db
			.select({
				id: appointment.id,
				patientId: appointment.patientId,
				clinicianId: appointment.clinicianId,
				scheduledAt: appointment.scheduledAt,
				status: appointment.status,
				notes: appointment.notes,
				cancellationReason: appointment.cancellationReason,
				createdAt: appointment.createdAt,
				updatedAt: appointment.updatedAt,
				patientName: patientUser.name,
				patientEmail: patientUser.email,
				clinicianName: clinicianUser.name,
				clinicianEmail: clinicianUser.email,
			})
			.from(appointment)
			.innerJoin(patientUser, eq(appointment.patientId, patientUser.id))
			.innerJoin(clinicianUser, eq(appointment.clinicianId, clinicianUser.id))
			.where(eq(appointment.id, input.id))
			.limit(1);

		if (appointmentData.length === 0) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Appointment not found",
			});
		}

		const appt = appointmentData[0];

		if (appt && userRole === "patient" && appt.patientId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this appointment",
			});
		}

		if (appt && userRole === "clinician" && appt.clinicianId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this appointment",
			});
		}

		return appt;
	}),

	create: protectedProcedure
		.input(
			z.object({
				patientId: z.string(),
				clinicianId: z.string(),
				scheduledAt: z.string(),
				notes: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can create appointments",
				});
			}

			if (input.clinicianId !== userId && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only create appointments for yourself",
				});
			}

			const result = await ctx.db
				.insert(appointment)
				.values({
					patientId: input.patientId,
					clinicianId: input.clinicianId,
					scheduledAt: input.scheduledAt,
					notes: input.notes,
				})
				.returning();

			return result[0];
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
				notes: z.string().optional(),
				cancellationReason: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			const appt = await ctx.db.select().from(appointment).where(eq(appointment.id, input.id)).limit(1);

			if (appt.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Appointment not found",
				});
			}

			const appointmentData = appt[0];

			if (appointmentData && userRole === "patient" && appointmentData.patientId !== userId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own appointments",
				});
			}

			if (appointmentData && userRole === "clinician" && appointmentData.clinicianId !== userId) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own appointments",
				});
			}

			if (userRole === "patient" && input.status && input.status !== "cancelled") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Patients can only cancel appointments",
				});
			}

			if (input.status === "cancelled" && !input.cancellationReason) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Cancellation reason is required",
				});
			}

			const result = await ctx.db
				.update(appointment)
				.set({
					...input,
					updatedAt: new Date(),
				})
				.where(eq(appointment.id, input.id))
				.returning();

			return result[0];
		}),
});
