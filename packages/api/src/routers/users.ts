import { user } from "@mumbaihacks/db";
import { TRPCError } from "@trpc/server";
import { eq, type SQL } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

// Admin-only middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.session.user.role !== "admin") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Admin access required",
		});
	}
	return next();
});

export const usersRouter = router({
	// List all users with optional role filter (admin only)
	list: adminProcedure
		.input(
			z
				.object({
					role: z.enum(["patient", "clinician", "admin"]).optional(),
				})
				.optional()
		)
		.query(async ({ ctx, input }) => {
			const filters: SQL[] = [];

			if (input?.role) {
				filters.push(eq(user.role, input.role));
			}

			const users = await ctx.db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
					image: user.image,
					emailVerified: user.emailVerified,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt,
				})
				.from(user)
				.where(filters.length > 0 ? filters[0] : undefined);

			return users;
		}),

	// Get user by ID (admin only)
	getById: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
		const userData = await ctx.db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				image: user.image,
				emailVerified: user.emailVerified,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			})
			.from(user)
			.where(eq(user.id, input.id))
			.limit(1);

		if (userData.length === 0) {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: "User not found",
			});
		}

		return userData[0];
	}),

	// Get statistics about users
	getStats: adminProcedure.query(async ({ ctx }) => {
		const users = await ctx.db
			.select({
				role: user.role,
			})
			.from(user);

		const stats = {
			total: users.length,
			patients: users.filter((u) => u.role === "patient").length,
			clinicians: users.filter((u) => u.role === "clinician").length,
			admins: users.filter((u) => u.role === "admin").length,
		};

		return stats;
	}),

	// Skeleton for updating user role
	updateRole: adminProcedure
		.input(
			z.object({
				userId: z.string(),
				role: z.enum(["patient", "clinician", "admin"]),
			})
		)
		.mutation(() => {
			// TODO: Implement user role update logic
			throw new TRPCError({
				code: "NOT_IMPLEMENTED",
				message: "User role update not yet implemented",
			});
		}),

	// Skeleton for deleting user
	delete: adminProcedure.input(z.object({ userId: z.string() })).mutation(() => {
		// TODO: Implement user deletion logic
		throw new TRPCError({
			code: "NOT_IMPLEMENTED",
			message: "User deletion not yet implemented",
		});
	}),
});
