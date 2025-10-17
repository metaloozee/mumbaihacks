"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const date = resultDate ?? toDate(formData.resultDate) ?? undefined;
		const iso = date ? new Date(date).toISOString() : formData.resultDate;
		onSubmit?.({ ...formData, resultDate: iso });
	};

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<div className="space-y-2">
				<Label htmlFor="order">Order</Label>
				<Select
					onValueChange={(value) => setFormData({ ...formData, orderId: value })}
					value={formData.orderId}
				>
					<SelectTrigger id="order">
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
			</div>

			<div className="space-y-2">
				<Label htmlFor="resultData">Result Data</Label>
				<Input
					id="resultData"
					onChange={(e) => setFormData({ ...formData, resultData: e.target.value })}
					placeholder="Enter test results..."
					required
					value={formData.resultData}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="interpretationNotes">Interpretation Notes (Optional)</Label>
				<Input
					id="interpretationNotes"
					onChange={(e) => setFormData({ ...formData, interpretationNotes: e.target.value })}
					placeholder="Clinical interpretation of results..."
					value={formData.interpretationNotes}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
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

			<div className="flex justify-end space-x-2">
				{onCancel && (
					<Button onClick={onCancel} type="button" variant="outline">
						Cancel
					</Button>
				)}
				<Button type="submit">Add Results</Button>
			</div>
		</form>
	);
}
