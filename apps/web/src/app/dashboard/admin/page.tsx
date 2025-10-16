import { auth } from "@mumbaihacks/auth";
import { Shield, UserCheck, UserCog, Users } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card } from "@/components/ui/card";
import { createServerCaller } from "@/server/trpc";

export default async function AdminDashboardPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/login");
	}

	if (session.user.role !== "admin") {
		redirect("/dashboard");
	}

	const caller = await createServerCaller();
	const stats = await caller.users.getStats();

	const recentActivity: Array<{
		id: string;
		action: string;
		user: string;
		timestamp: string;
	}> = [];

	return (
		<DashboardPageShell
			header={
				<PageHeader
					breadcrumbItems={[{ label: "Dashboard", href: "/dashboard" }, { label: "Admin" }]}
					description="System overview and management"
					icon={<Users className="h-8 w-8" />}
					title="Admin Dashboard"
				/>
			}
		>
			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<StatsCard
					description="All users in the system"
					icon={<Users className="h-4 w-4" />}
					title="Total Users"
					value={stats?.total ?? 0}
				/>
				<StatsCard
					description="Registered patients"
					icon={<UserCheck className="h-4 w-4" />}
					title="Patients"
					value={stats?.patients ?? 0}
				/>
				<StatsCard
					description="Healthcare providers"
					icon={<UserCog className="h-4 w-4" />}
					title="Clinicians"
					value={stats?.clinicians ?? 0}
				/>
				<StatsCard
					description="System admins"
					icon={<Shield className="h-4 w-4" />}
					title="Administrators"
					value={stats?.admins ?? 0}
				/>
			</div>

			{/* Recent Activity */}
			<ListCard title="Recent Activity">
				{recentActivity.length === 0 ? (
					<div className="py-6 text-center text-muted-foreground">No recent activity</div>
				) : (
					<div className="space-y-4">
						{recentActivity.map((activity) => (
							<div
								className="flex items-center justify-between border-b pb-3 last:border-0"
								key={activity.id}
							>
								<div>
									<p className="font-medium">{activity.action}</p>
									<p className="text-muted-foreground text-sm">{activity.user}</p>
								</div>
								<p className="text-muted-foreground text-xs">
									{new Date(activity.timestamp).toLocaleString()}
								</p>
							</div>
						))}
					</div>
				)}
			</ListCard>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-2">
				<Link href="/dashboard/admin/users">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<div className="p-6">
							<div className="flex items-center font-medium">
								<Users className="mr-2 h-5 w-5" />
								User Management
							</div>
							<p className="mt-2 text-muted-foreground text-sm">Manage users, roles, and permissions</p>
						</div>
					</Card>
				</Link>

				<Card className="cursor-pointer opacity-50 transition-colors hover:bg-muted/50">
					<div className="p-6">
						<div className="flex items-center font-medium">
							<Shield className="mr-2 h-5 w-5" />
							System Settings
						</div>
						<p className="mt-2 text-muted-foreground text-sm">Configure system-wide settings</p>
					</div>
				</Card>
			</div>
		</DashboardPageShell>
	);
}
