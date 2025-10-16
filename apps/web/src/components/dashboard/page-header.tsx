import type { ReactNode } from "react";
import { DashboardBreadcrumb, type DashboardBreadcrumbItem } from "./dashboard-breadcrumb";

type PageHeaderProps = {
	title: string | ReactNode;
	description?: string | ReactNode;
	icon?: ReactNode;
	actions?: ReactNode;
	breadcrumbItems?: DashboardBreadcrumbItem[];
};

export function PageHeader({ title, description, icon, actions, breadcrumbItems }: PageHeaderProps) {
	return (
		<div className="space-y-4">
			{breadcrumbItems && breadcrumbItems.length > 0 ? <DashboardBreadcrumb items={breadcrumbItems} /> : null}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="flex items-center font-bold text-3xl tracking-tight">
						{icon ? <span className="mr-3">{icon}</span> : null}
						{title}
					</h1>
					{description ? <p className="mt-2 text-muted-foreground">{description}</p> : null}
				</div>
				{actions ? <div className="flex items-center gap-2">{actions}</div> : null}
			</div>
		</div>
	);
}

export default PageHeader;
