import { auth } from "@mumbaihacks/auth";
import { Shield, UserCheck, UserCog, Users } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

	// TODO: Fetch real data using tRPC
	const stats = {
		totalUsers: 0,
		patients: 0,
		clinicians: 0,
		admins: 0,
	};

	const recentActivity: Array<{
		id: string;
		action: string;
		user: string;
		timestamp: string;
	}> = [];

	return (
		<div className="flex-1 space-y-8 p-8">
			<DashboardBreadcrumb items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Admin" }]} />

			<div>
				<h1 className="font-bold text-3xl tracking-tight">Admin Dashboard</h1>
				<p className="mt-2 text-muted-foreground">System overview and management</p>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<StatsCard
					description="All users in the system"
					icon={Users}
					title="Total Users"
					value={stats.totalUsers}
				/>
				<StatsCard description="Registered patients" icon={UserCheck} title="Patients" value={stats.patients} />
				<StatsCard
					description="Healthcare providers"
					icon={UserCog}
					title="Clinicians"
					value={stats.clinicians}
				/>
				<StatsCard description="System admins" icon={Shield} title="Administrators" value={stats.admins} />
			</div>

			{/* Recent Activity */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Activity</CardTitle>
				</CardHeader>
				<CardContent>
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
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<div className="grid gap-4 md:grid-cols-2">
				<Link href="/dashboard/admin/users">
					<Card className="cursor-pointer transition-colors hover:bg-muted/50">
						<CardHeader>
							<CardTitle className="flex items-center">
								<Users className="mr-2 h-5 w-5" />
								User Management
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">Manage users, roles, and permissions</p>
						</CardContent>
					</Card>
				</Link>

				<Card className="cursor-pointer opacity-50 transition-colors hover:bg-muted/50">
					<CardHeader>
						<CardTitle className="flex items-center">
							<Shield className="mr-2 h-5 w-5" />
							System Settings
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground text-sm">Configure system-wide settings</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
