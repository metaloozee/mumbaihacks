import { patientDemographics } from "@mumbaihacks/db"
import type { Context } from "./context"
import { eq } from "drizzle-orm"

export const check_and_generate_claim_autofills = async (data:{
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
    diagnossisCodes: string | null;
    treatementCodes: string | null;
    treatementDates: string | null;
    treatementAmounts: string | null;
    clinicianId: string;
}, ctx: Context) => {

    const url = "http://localhost:5678/webhook/check_and_generate_claim_autofills"
    const patientdata = await ctx.db.select().from(patientDemographics).where(eq(patientDemographics.userId, data.patientId)).limit(1);
    if (patientdata.length === 0) {
        throw new Error("Patient demographics not found")
    }

    if (!patientdata[0]?.insuranceClaimFormUrl || patientdata[0]?.insuranceClaimFormUrl.length === 0) {
        return
    }

    const payload = {
        record: data,
        patient: patientdata
    }
    console.log("Sending payload to claim autofill service:", payload)
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })
    console.log("Response from claim autofill service:", response)
    return response
}