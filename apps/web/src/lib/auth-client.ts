import { inferAdditionalFields, lastLoginMethodClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	plugins: [
		lastLoginMethodClient(),
		inferAdditionalFields({
			user: {
				role: {
					type: "string",
					defaultValue: "patient",
					input: false,
				},
			},
		}),
	],
});
