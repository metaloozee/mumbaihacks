import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatsCardProps = {
	title: string;
	value: string | number;
	description?: string;
	icon?: ReactNode;
	trend?: {
		value: number;
		isPositive: boolean;
	};
};

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-sm">{title}</CardTitle>
				{icon ? <span className="text-muted-foreground">{icon}</span> : null}
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl">{value}</div>
				{description && <p className="mt-1 text-muted-foreground text-xs">{description}</p>}
				{trend && (
					<div className={`mt-1 text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
						{trend.isPositive ? "+" : "-"}
						{Math.abs(trend.value)}% from last month
					</div>
				)}
			</CardContent>
		</Card>
	);
}
