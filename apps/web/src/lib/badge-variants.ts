import type { BadgeProps } from "@/components/ui/badge";

export function getAppointmentStatusVariant(status: string): BadgeProps["variant"] {
	if (status === "confirmed") {
		return "default";
	}
	if (status === "pending") {
		return "secondary";
	}
	if (status === "completed") {
		return "outline";
	}
	return "destructive";
}

export function getPrescriptionStatusVariant(status: string): BadgeProps["variant"] {
	if (status === "active") {
		return "default";
	}
	if (status === "filled") {
		return "secondary";
	}
	if (status === "expired") {
		return "outline";
	}
	return "destructive";
}

export function getUserRoleVariant(role: string): BadgeProps["variant"] {
	if (role === "admin") {
		return "destructive";
	}
	if (role === "clinician") {
		return "default";
	}
	return "secondary";
}
