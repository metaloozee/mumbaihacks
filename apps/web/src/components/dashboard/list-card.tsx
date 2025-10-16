import type { PropsWithChildren, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ListCardProps = PropsWithChildren<{
	title: string | ReactNode;
	actions?: ReactNode;
}>;

export function ListCard({ title, actions, children }: ListCardProps) {
	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle>{title}</CardTitle>
					{actions ? <div className="flex items-center gap-2">{actions}</div> : null}
				</div>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

export default ListCard;
