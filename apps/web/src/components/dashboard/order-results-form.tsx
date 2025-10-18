"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toDate } from "@/lib/date-utils";

type OrderResultsFormData = {
	orderId: string;
	resultData: string;
	interpretationNotes?: string;
	resultDate: string;
	attachmentUrl?: string;
};

type OrderResultsFormProps = {
	onSubmit?: (data: OrderResultsFormData) => void;
	onCancel?: () => void;
	orders?: Array<{ id: string; orderType: string; orderDetails: string; patientName: string }>;
};

export function OrderResultsForm({ onSubmit, onCancel, orders = [] }: OrderResultsFormProps) {
	const [formData, setFormData] = useState<OrderResultsFormData>({
		orderId: "",
		resultData: "",
		interpretationNotes: "",
		resultDate: new Date().toISOString().split("T")[0] || "",
		attachmentUrl: "",
	});
	const [resultDate, setResultDate] = useState<Date | undefined>(undefined);
	const [orderError, setOrderError] = useState<string>("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.orderId) {
			setOrderError("Please select an order");
			return;
		}

		const date = resultDate ?? toDate(formData.resultDate) ?? undefined;
		const iso = date ? new Date(date).toISOString() : formData.resultDate;
		onSubmit?.({ ...formData, resultDate: iso });
	};

	const handleOrderChange = (value: string) => {
		setFormData({ ...formData, orderId: value });
		if (orderError) {
			setOrderError("");
		}
	};

	const isFormValid = formData.orderId && formData.resultData;

	return (
		<form onSubmit={handleSubmit}>
			<Card>
				<CardHeader>
					<CardTitle>Add Order Results</CardTitle>
					<CardDescription>Record test results and optional interpretation notes.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="order">Order</Label>
						<Select onValueChange={handleOrderChange} required value={formData.orderId}>
							<SelectTrigger className={orderError ? "border-destructive" : ""} id="order">
								<SelectValue placeholder="Select order" />
							</SelectTrigger>
							<SelectContent>
								{orders.map((order) => (
									<SelectItem key={order.id} value={order.id}>
										{order.patientName} - {order.orderType}: {order.orderDetails}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{orderError && <p className="text-destructive text-sm">{orderError}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="resultData">Result Data</Label>
						<Textarea
							id="resultData"
							onChange={(e) => setFormData({ ...formData, resultData: e.target.value })}
							placeholder="Enter test results..."
							required
							value={formData.resultData}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="interpretationNotes">Interpretation Notes (Optional)</Label>
						<Textarea
							id="interpretationNotes"
							onChange={(e) => setFormData({ ...formData, interpretationNotes: e.target.value })}
							placeholder="Clinical interpretation of results..."
							value={formData.interpretationNotes}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<Label htmlFor="resultDate">Result Date</Label>
							<DatePicker id="resultDate" onChange={setResultDate} value={resultDate} />
						</div>

						<div className="space-y-2">
							<Label htmlFor="attachmentUrl">Attachment URL (Optional)</Label>
							<Input
								id="attachmentUrl"
								onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
								placeholder="https://..."
								type="url"
								value={formData.attachmentUrl}
							/>
						</div>
					</div>
				</CardContent>
				<CardFooter className="justify-end gap-2">
					{onCancel && (
						<Button onClick={onCancel} type="button" variant="outline">
							Cancel
						</Button>
					)}
					<Button disabled={!isFormValid} type="submit">
						Add Results
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
