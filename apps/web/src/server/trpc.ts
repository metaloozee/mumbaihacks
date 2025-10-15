import "server-only";

import { createServerContext } from "@mumbaihacks/api/context";
import { createCaller } from "@mumbaihacks/api/routers/index";
import { headers } from "next/headers";

export async function createServerCaller() {
	const headersList = await headers();
	const ctx = await createServerContext(headersList);
	return createCaller(ctx);
}
