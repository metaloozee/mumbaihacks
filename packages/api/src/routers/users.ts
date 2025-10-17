import { appointment, clinicianPatient, medicalRecord, prescription, user } from "@mumbaihacks/db";
import { TRPCError } from "@trpc/server";
import { desc, eq, or, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { z } from "zod";
import { protectedProcedure, router } from "../index";

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

	updateRole: adminProcedure
		.input(
			z.object({
				userId: z.string(),
				role: z.enum(["patient", "clinician", "admin"]),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const targetUser = await ctx.db
				.select({ role: user.role })
				.from(user)
				.where(eq(user.id, input.userId))
				.limit(1);

			if (targetUser.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			if (targetUser[0]?.role === "admin") {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "Cannot change admin user roles",
				});
			}

			await ctx.db.update(user).set({ role: input.role, updatedAt: new Date() }).where(eq(user.id, input.userId));

			return { success: true };
		}),

	getDetails: adminProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
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

		const userInfo = userData[0] as NonNullable<(typeof userData)[0]>;

		const relationships: { clinicians?: unknown[]; patients?: unknown[] } = {};

		if (userInfo.role === "clinician") {
			const patients = await ctx.db
				.select({
					id: clinicianPatient.id,
					patientId: clinicianPatient.patientId,
					patientName: user.name,
					patientEmail: user.email,
					patientImage: user.image,
					createdAt: clinicianPatient.createdAt,
				})
				.from(clinicianPatient)
				.innerJoin(user, eq(user.id, clinicianPatient.patientId))
				.where(eq(clinicianPatient.clinicianId, input.id));

			relationships.patients = patients;
		} else if (userInfo.role === "patient") {
			const clinicians = await ctx.db
				.select({
					id: clinicianPatient.id,
					clinicianId: clinicianPatient.clinicianId,
					clinicianName: user.name,
					clinicianEmail: user.email,
					clinicianImage: user.image,
					createdAt: clinicianPatient.createdAt,
				})
				.from(clinicianPatient)
				.innerJoin(user, eq(user.id, clinicianPatient.clinicianId))
				.where(eq(clinicianPatient.patientId, input.id));

			relationships.clinicians = clinicians;
		}

		const patientUser = alias(user, "patient_user");
		const clinicianUser = alias(user, "clinician_user");

		const appointments = await ctx.db
			.select({
				id: appointment.id,
				patientId: appointment.patientId,
				clinicianId: appointment.clinicianId,
				patientName: patientUser.name,
				clinicianName: clinicianUser.name,
				scheduledAt: appointment.scheduledAt,
				status: appointment.status,
				notes: appointment.notes,
				createdAt: appointment.createdAt,
			})
			.from(appointment)
			.innerJoin(patientUser, eq(patientUser.id, appointment.patientId))
			.innerJoin(clinicianUser, eq(clinicianUser.id, appointment.clinicianId))
			.where(or(eq(appointment.patientId, input.id), eq(appointment.clinicianId, input.id)))
			.limit(10)
			.orderBy(desc(appointment.scheduledAt));

		const records = await ctx.db
			.select({
				id: medicalRecord.id,
				patientId: medicalRecord.patientId,
				clinicianId: medicalRecord.clinicianId,
				diagnosis: medicalRecord.diagnosis,
				notes: medicalRecord.notes,
				createdAt: medicalRecord.createdAt,
			})
			.from(medicalRecord)
			.where(or(eq(medicalRecord.patientId, input.id), eq(medicalRecord.clinicianId, input.id)))
			.limit(10)
			.orderBy(desc(medicalRecord.createdAt));

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
			})
			.from(prescription)
			.where(eq(prescription.prescriberId, input.id))
			.limit(10)
			.orderBy(desc(prescription.createdAt));

		return {
			user: userInfo,
			relationships,
			appointments,
			medicalRecords: records,
			prescriptions,
		};
	}),

	delete: adminProcedure.input(z.object({ userId: z.string() })).mutation(() => {
		// TODO: Implement user deletion logic
		throw new TRPCError({
			code: "NOT_IMPLEMENTED",
			message: "User deletion not yet implemented",
		});
	}),
});
