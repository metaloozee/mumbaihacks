"use client";

import type * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type FormDialogProps = {
	trigger?: React.ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children: React.ReactNode;
	showCloseButton?: boolean;
	contentClassName?: string;
	maxWidthClassName?: string; // e.g., "sm:max-w-xl", "sm:max-w-2xl"
	a11yTitle?: string;
	a11yDescription?: string;
};

export function FormDialog({
	trigger,
	open,
	onOpenChange,
	children,
	showCloseButton = true,
	contentClassName,
	maxWidthClassName = "sm:max-w-2xl",
	a11yTitle = "Dialog",
	a11yDescription,
}: FormDialogProps) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			{trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
			<DialogContent
				className={cn("w-full border-0 bg-transparent p-0 shadow-none", maxWidthClassName, contentClassName)}
				showCloseButton={showCloseButton}
			>
				<div className="sr-only">
					<DialogTitle>{a11yTitle}</DialogTitle>
					{a11yDescription ? <DialogDescription>{a11yDescription}</DialogDescription> : null}
				</div>
				{children}
			</DialogContent>
		</Dialog>
	);
}

export default FormDialog;
