import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardPageShellProps = PropsWithChildren<{
	className?: string;
	header?: ReactNode;
}>;

export function DashboardPageShell({ children, className, header }: DashboardPageShellProps) {
	return (
		<div className={cn("flex-1 space-y-6 p-8", className)}>
			{header}
			{children}
		</div>
	);
}

export default DashboardPageShell;
