"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DatePickerProps = {
	id?: string;
	value?: Date;
	onChange?: (date: Date | undefined) => void;
	placeholder?: string;
	className?: string;
	buttonClassName?: string;
};

export function DatePicker({
	id,
	value,
	onChange,
	placeholder = "Pick a date",
	className,
	buttonClassName,
}: DatePickerProps) {
	const [open, setOpen] = React.useState(false);
	const [date, setDate] = React.useState<Date | undefined>(value);

	React.useEffect(() => {
		setDate(value);
	}, [value]);

	const handleSelect = (next: Date | undefined) => {
		setDate(next);
		onChange?.(next);
		setOpen(false);
	};

	return (
		<div className={cn("flex flex-col gap-2", className)}>
			<Popover onOpenChange={setOpen} open={open}>
				<PopoverTrigger asChild>
					<Button
						aria-label="Date picker"
						className={cn(
							"w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
							"h-9",
							buttonClassName
						)}
						data-empty={!date}
						id={id}
						type="button"
						variant="outline"
					>
						<CalendarIcon />
						{date ? (
							<span>
								{date.toLocaleDateString("en-US", {
									day: "2-digit",
									month: "long",
									year: "numeric",
								})}
							</span>
						) : (
							<span>{placeholder}</span>
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<Calendar captionLayout="dropdown" mode="single" onSelect={handleSelect} selected={date} />
				</PopoverContent>
			</Popover>
		</div>
	);
}
