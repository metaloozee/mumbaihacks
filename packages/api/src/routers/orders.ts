import { medicalOrder, orderResult } from "@mumbaihacks/db";
import { TRPCError } from "@trpc/server";
import { and, eq, type SQL } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

export const ordersRouter = router({
	list: protectedProcedure
		.input(
			z
				.object({
					status: z.enum(["pending", "in-progress", "completed", "cancelled"]).optional(),
					orderType: z.enum(["lab", "imaging"]).optional(),
				})
				.optional()
		)
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const userRole = ctx.session.user.role;

			const filters: SQL[] = [];

			if (userRole === "clinician") {
				filters.push(eq(medicalOrder.clinicianId, userId));
			} else if (userRole === "patient") {
				filters.push(eq(medicalOrder.patientId, userId));
			} else if (userRole === "admin") {
				// Admin can see all orders - no filter needed
			} else {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Invalid role",
				});
			}

			if (input?.status) {
				filters.push(eq(medicalOrder.status, input.status));
			}

			if (input?.orderType) {
				filters.push(eq(medicalOrder.orderType, input.orderType));
			}

			const orders = await ctx.db
				.select()
				.from(medicalOrder)
				.where(filters.length > 0 ? and(...filters) : undefined);

			return orders;
		}),

	getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		const order = await ctx.db.select().from(medicalOrder).where(eq(medicalOrder.id, input.id)).limit(1);

		if (order.length === 0) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Order not found",
			});
		}

		const data = order[0];

		if (data && userRole === "patient" && data.patientId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this order",
			});
		}

		if (data && userRole === "clinician" && data.clinicianId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this order",
			});
		}

		const results = await ctx.db.select().from(orderResult).where(eq(orderResult.orderId, input.id));

		return {
			...data,
			results,
		};
	}),

	create: protectedProcedure
		.input(
			z.object({
				patientId: z.string(),
				appointmentId: z.string().optional(),
				orderType: z.enum(["lab", "imaging"]),
				orderDetails: z.string(),
				priority: z.enum(["routine", "urgent", "stat"]).default("routine"),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can create orders",
				});
			}

			const result = await ctx.db
				.insert(medicalOrder)
				.values({
					patientId: input.patientId,
					clinicianId: userId,
					appointmentId: input.appointmentId,
					orderType: input.orderType,
					orderDetails: input.orderDetails,
					priority: input.priority,
				})
				.returning();

			return result[0];
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.enum(["pending", "in-progress", "completed", "cancelled"]).optional(),
				orderDetails: z.string().optional(),
				priority: z.enum(["routine", "urgent", "stat"]).optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;
			const userId = ctx.session.user.id;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can update orders",
				});
			}

			const order = await ctx.db.select().from(medicalOrder).where(eq(medicalOrder.id, input.id)).limit(1);

			if (order.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Order not found",
				});
			}

			if (order[0] && order[0].clinicianId !== userId && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own orders",
				});
			}

			const result = await ctx.db
				.update(medicalOrder)
				.set({
					...input,
					updatedAt: new Date(),
				})
				.where(eq(medicalOrder.id, input.id))
				.returning();

			return result[0];
		}),

	addResult: protectedProcedure
		.input(
			z.object({
				orderId: z.string(),
				resultData: z.string(),
				interpretationNotes: z.string().optional(),
				resultDate: z.string(),
				attachmentUrl: z.string().optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userRole = ctx.session.user.role;

			if (userRole !== "clinician" && userRole !== "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Only clinicians can add results",
				});
			}

			const order = await ctx.db.select().from(medicalOrder).where(eq(medicalOrder.id, input.orderId)).limit(1);

			if (order.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Order not found",
				});
			}

			const result = await ctx.db
				.insert(orderResult)
				.values({
					orderId: input.orderId,
					resultData: input.resultData,
					interpretationNotes: input.interpretationNotes,
					resultDate: input.resultDate,
					attachmentUrl: input.attachmentUrl,
				})
				.returning();

			await ctx.db
				.update(medicalOrder)
				.set({ status: "completed", updatedAt: new Date() })
				.where(eq(medicalOrder.id, input.orderId));

			return result[0];
		}),

	getResults: protectedProcedure.input(z.object({ orderId: z.string() })).query(async ({ ctx, input }) => {
		const userId = ctx.session.user.id;
		const userRole = ctx.session.user.role;

		const order = await ctx.db.select().from(medicalOrder).where(eq(medicalOrder.id, input.orderId)).limit(1);

		if (order.length === 0) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "Order not found",
			});
		}

		const orderData = order[0];

		if (orderData && userRole === "patient" && orderData.patientId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this order",
			});
		}

		if (orderData && userRole === "clinician" && orderData.clinicianId !== userId) {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: "You do not have access to this order",
			});
		}

		const results = await ctx.db.select().from(orderResult).where(eq(orderResult.orderId, input.orderId));

		return results;
	}),
});
