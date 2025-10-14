import { db } from "@mumbaihacks/db";
import * as schema from "@mumbaihacks/db/schema/auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { lastLoginMethod } from "better-auth/plugins";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	user: {
		additionalFields: {
			role: {
				type: "string",
				input: false,
				defaultValue: "patient",
			},
		},
	},
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	plugins: [lastLoginMethod()],
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
		},
	},
	account: {
		accountLinking: {
			enabled: true,
			trustedProviders: ["google", "email-password"],
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "none",
			secure: true,
			httpOnly: true,
		},
	},
});

export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
