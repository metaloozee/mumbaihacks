"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/date-utils";

type CancelAppointmentDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	appointment: {
		id: string;
		scheduledAt: string;
		clinicianName?: string;
		patientName?: string;
	} | null;
	onConfirm: (reason: string) => void;
	isLoading?: boolean;
	userRole?: "patient" | "clinician";
};

export function CancelAppointmentDialog({
	open,
	onOpenChange,
	appointment,
	onConfirm,
	isLoading = false,
	userRole = "patient",
}: CancelAppointmentDialogProps) {
	const [step, setStep] = useState<"reason" | "confirm">("reason");
	const [cancellationReason, setCancellationReason] = useState("");

	const handleClose = () => {
		setStep("reason");
		setCancellationReason("");
		onOpenChange(false);
	};

	const handleContinue = () => {
		if (cancellationReason.trim().length < 10) {
			return;
		}
		setStep("confirm");
	};

	const handleConfirm = () => {
		onConfirm(cancellationReason);
		handleClose();
	};

	if (!appointment) {
		return null;
	}

	return (
		<Dialog onOpenChange={handleClose} open={open}>
			<DialogContent>
				{step === "reason" ? (
					<>
						<DialogHeader>
							<DialogTitle>Cancel Appointment</DialogTitle>
							<DialogDescription>
								Please provide a reason for cancelling this appointment. This helps us improve our
								service.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<div className="space-y-2 rounded-md border bg-muted/50 p-4">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Date & Time:</span>
									<span className="font-medium">{formatDateTime(appointment.scheduledAt)}</span>
								</div>
								{userRole === "patient" && appointment.clinicianName && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Clinician:</span>
										<span className="font-medium">{appointment.clinicianName}</span>
									</div>
								)}
								{userRole === "clinician" && appointment.patientName && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Patient:</span>
										<span className="font-medium">{appointment.patientName}</span>
									</div>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="cancellation-reason">Cancellation Reason *</Label>
								<Textarea
									id="cancellation-reason"
									onChange={(e) => setCancellationReason(e.target.value)}
									placeholder="Please provide a detailed reason for cancellation (minimum 10 characters)..."
									rows={4}
									value={cancellationReason}
								/>
								<p className="text-muted-foreground text-xs">
									{cancellationReason.length}/10 characters minimum
								</p>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={handleClose} type="button" variant="outline">
								Back
							</Button>
							<Button
								disabled={cancellationReason.trim().length < 10}
								onClick={handleContinue}
								type="button"
							>
								Continue
							</Button>
						</DialogFooter>
					</>
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Confirm Cancellation</DialogTitle>
							<DialogDescription>
								Are you sure you want to cancel this appointment? This action cannot be undone.
							</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							<div className="space-y-2 rounded-md border bg-muted/50 p-4">
								<div className="flex justify-between text-sm">
									<span className="text-muted-foreground">Date & Time:</span>
									<span className="font-medium">{formatDateTime(appointment.scheduledAt)}</span>
								</div>
								{userRole === "patient" && appointment.clinicianName && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Clinician:</span>
										<span className="font-medium">{appointment.clinicianName}</span>
									</div>
								)}
								{userRole === "clinician" && appointment.patientName && (
									<div className="flex justify-between text-sm">
										<span className="text-muted-foreground">Patient:</span>
										<span className="font-medium">{appointment.patientName}</span>
									</div>
								)}
							</div>

							<div className="space-y-2">
								<Label>Your Reason:</Label>
								<div className="whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-sm">
									{cancellationReason}
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button onClick={() => setStep("reason")} type="button" variant="outline">
								Back
							</Button>
							<Button disabled={isLoading} onClick={handleConfirm} type="button" variant="destructive">
								{isLoading ? "Cancelling..." : "Confirm Cancellation"}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
