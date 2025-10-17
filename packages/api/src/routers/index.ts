import { protectedProcedure, publicProcedure, router, t } from "../index";
import { appointmentsRouter } from "./appointments";
import { assessmentsRouter } from "./assessments";
import { dischargeRouter } from "./discharge";
import { medicalRecordsRouter } from "./medical-records";
import { ordersRouter } from "./orders";
import { patientsRouter } from "./patients";
import { prescriptionsRouter } from "./prescriptions";
import { usersRouter } from "./users";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => "OK"),
	privateData: protectedProcedure.query(({ ctx }) => ({
		message: "This is private",
		user: ctx.session.user,
	})),
	appointments: appointmentsRouter,
	medicalRecords: medicalRecordsRouter,
	prescriptions: prescriptionsRouter,
	patients: patientsRouter,
	users: usersRouter,
	assessments: assessmentsRouter,
	orders: ordersRouter,
	discharge: dischargeRouter,
});

export const createCaller = t.createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
