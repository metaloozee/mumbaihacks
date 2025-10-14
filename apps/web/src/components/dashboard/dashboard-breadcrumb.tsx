import Link from "next/link";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type DashboardBreadcrumbItem = {
	label: string;
	href?: string;
};

type DashboardBreadcrumbProps = {
	items: DashboardBreadcrumbItem[];
};

export function DashboardBreadcrumb({ items }: DashboardBreadcrumbProps) {
	return (
		<Breadcrumb>
			<BreadcrumbList>
				{items.map((item, index) => {
					const isLast = index === items.length - 1;

					return (
						<div className="flex items-center gap-1.5" key={item.label}>
							<BreadcrumbItem>
								{isLast || !item.href ? (
									<BreadcrumbPage>{item.label}</BreadcrumbPage>
								) : (
									<BreadcrumbLink asChild>
										<Link href={item.href}>{item.label}</Link>
									</BreadcrumbLink>
								)}
							</BreadcrumbItem>
							{!isLast && <BreadcrumbSeparator />}
						</div>
					);
				})}
			</BreadcrumbList>
		</Breadcrumb>
	);
}
