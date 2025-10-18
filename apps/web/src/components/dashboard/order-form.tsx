"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type OrderFormData = {
	patientId: string;
	appointmentId?: string;
	orderType: "lab" | "imaging" | "";
	orderDetails: string;
	priority: "routine" | "urgent" | "stat";
};

type OrderFormProps = {
	onSubmit?: (data: OrderFormData) => void;
	onCancel?: () => void;
	patients?: Array<{ id: string; name: string }>;
	appointments?: Array<{ id: string; patientName: string; date: string }>;
};

export function OrderForm({ onSubmit, onCancel, patients = [], appointments = [] }: OrderFormProps) {
	const [formData, setFormData] = useState<OrderFormData>({
		patientId: "",
		appointmentId: undefined,
		orderType: "",
		orderDetails: "",
		priority: "routine",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.orderType) {
			return;
		}
		onSubmit?.(formData as Required<Pick<OrderFormData, "orderType">> & OrderFormData);
	};

	const getOrderDetailsPlaceholder = () => {
		if (formData.orderType === "lab") {
			return "e.g., Complete Blood Count (CBC), Basic Metabolic Panel";
		}
		if (formData.orderType === "imaging") {
			return "e.g., Chest X-Ray, MRI Brain";
		}
		return "Enter order details...";
	};

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>New Order</CardTitle>
					<CardDescription>Create a lab or imaging order with priority and details.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="patient">Patient</Label>
							<Select
								onValueChange={(value) => setFormData({ ...formData, patientId: value })}
								value={formData.patientId}
							>
								<SelectTrigger id="patient">
									<SelectValue placeholder="Select patient" />
								</SelectTrigger>
								<SelectContent>
									{patients.map((patient) => (
										<SelectItem key={patient.id} value={patient.id}>
											{patient.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="appointment">Appointment (Optional)</Label>
							<Select
								onValueChange={(value) => setFormData({ ...formData, appointmentId: value })}
								value={formData.appointmentId}
							>
								<SelectTrigger id="appointment">
									<SelectValue placeholder="Select appointment" />
								</SelectTrigger>
								<SelectContent>
									{appointments.map((appointment) => (
										<SelectItem key={appointment.id} value={appointment.id}>
											{appointment.patientName} - {appointment.date}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="orderType">Order Type</Label>
							<Select
								onValueChange={(value) =>
									setFormData({ ...formData, orderType: value as "lab" | "imaging" })
								}
								value={formData.orderType}
							>
								<SelectTrigger id="orderType">
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="lab">Laboratory</SelectItem>
									<SelectItem value="imaging">Imaging</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="priority">Priority</Label>
							<Select
								onValueChange={(value) =>
									setFormData({ ...formData, priority: value as "routine" | "urgent" | "stat" })
								}
								value={formData.priority}
							>
								<SelectTrigger id="priority">
									<SelectValue placeholder="Select priority" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="routine">Routine</SelectItem>
									<SelectItem value="urgent">Urgent</SelectItem>
									<SelectItem value="stat">STAT</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="orderDetails">Order Details</Label>
						<Textarea
							id="orderDetails"
							onChange={(e) => setFormData({ ...formData, orderDetails: e.target.value })}
							placeholder={getOrderDetailsPlaceholder()}
							required
							value={formData.orderDetails}
						/>
					</div>
				</CardContent>
				<CardFooter className="justify-end gap-2">
					{onCancel && (
						<Button onClick={onCancel} type="button" variant="outline">
							Cancel
						</Button>
					)}
					<Button disabled={!formData.orderType} type="submit">
						Create Order
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
