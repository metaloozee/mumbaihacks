import { appointment } from "@mumbaihacks/db";
import { TRPCError } from "@trpc/server";
import { and, eq, type SQL } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

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

			// Build filter based on role
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
				.select()
				.from(appointment)
				.where(filters.length > 0 ? and(...filters) : undefined);

			return appointments;
		}),

	getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		const appointmentData = await ctx.db.select().from(appointment).where(eq(appointment.id, input.id)).limit(1);

		if (appointmentData.length === 0) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Appointment not found",
			});
		}

		const appt = appointmentData[0];

		// Check access permissions
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
		.mutation(({ input: _input }) => {
			// TODO: Implement appointment creation logic
			throw new TRPCError({
				code: "NOT_IMPLEMENTED",
				message: "Appointment creation not yet implemented",
			});
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.enum(["pending", "confirmed", "completed", "cancelled"]).optional(),
				notes: z.string().optional(),
			})
		)
		.mutation(({ input: _input }) => {
			// TODO: Implement appointment update logic
			throw new TRPCError({
				code: "NOT_IMPLEMENTED",
				message: "Appointment update not yet implemented",
			});
		}),
});
