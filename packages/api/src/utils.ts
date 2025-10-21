import { patientDemographics } from "@mumbaihacks/db";
import { eq } from "drizzle-orm";
import type { Context } from "./context";

export const check_and_generate_claim_autofills = async (
	data: {
		id: string;
		createdAt: Date;
		updatedAt: Date;
		patientId: string;
		diagnosis: string;
		notes: string | null;
		pastMedicalHistory: string | null;
		allergies: string | null;
		currentMedications: string | null;
		medicationsHistory: string | null;
		vitals: string | null;
		symptoms: string | null;
		treatmentRequired: boolean;
		treatmentDetails: string | null;
		diagnosisCodes: string | null;
		treatmentCodes: string | null;
		treatmentDates: string | null;
		treatmentAmounts: string | null;
		clinicianId: string;
	},
	ctx: Context
) => {
	const url = "http://localhost:5678/webhook/check_and_generate_claim_autofills";
	const patientdata = await ctx.db
		.select()
		.from(patientDemographics)
		.where(eq(patientDemographics.userId, data.patientId))
		.limit(1);
	if (patientdata.length === 0) {
		throw new Error("Patient demographics not found");
	}

	if (!patientdata[0]?.insuranceClaimFormUrl || patientdata[0]?.insuranceClaimFormUrl.length === 0) {
		return;
	}

	const payload = {
		record: data,
		patient: patientdata,
	};
	// biome-ignore lint/suspicious/noConsole: Debug logging for webhook service
	console.log("Sending payload to claim autofill service:", payload);

	const TIMEOUT_MS = 30_000;
	const abortController = new AbortController();
	const timeoutId = setTimeout(() => abortController.abort(), TIMEOUT_MS);

	try {
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
			signal: abortController.signal,
		});

		clearTimeout(timeoutId);

		// Validate response
		if (!response.ok) {
			const errorText = await response.text().catch(() => "Unable to read error response");
			throw new Error(
				`Claim autofill service returned error: ${response.status} ${response.statusText}. ${errorText}`
			);
		}

		const responseData = await response.json().catch(() => null);
		// biome-ignore lint/suspicious/noConsole: Debug logging for webhook service
		console.log("Response from claim autofill service:", responseData);
		return responseData;
	} catch (error) {
		clearTimeout(timeoutId);

		if (error instanceof Error) {
			if (error.name === "AbortError") {
				throw new Error(`Claim autofill service request timed out after ${TIMEOUT_MS}ms`);
			}
			if (error.message.includes("fetch")) {
				throw new Error(`Network error while contacting claim autofill service: ${error.message}`);
			}
		}

		throw new Error(
			`Failed to generate claim autofills: ${error instanceof Error ? error.message : String(error)}`
		);
	}
};
