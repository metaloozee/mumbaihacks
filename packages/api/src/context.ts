import { auth } from "@mumbaihacks/auth";
import { db } from "@mumbaihacks/db";
import type { NextRequest } from "next/server";

export async function createContext(req: NextRequest) {
	const session = await auth.api.getSession({
		headers: req.headers,
	});
	return {
		session,
		db,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
