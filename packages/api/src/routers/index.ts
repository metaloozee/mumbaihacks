import { protectedProcedure, publicProcedure, router } from "../index";
import { appointmentsRouter } from "./appointments";
import { medicalRecordsRouter } from "./medical-records";
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
});
export type AppRouter = typeof appRouter;
