"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Search, Users } from "lucide-react";
import { useState } from "react";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { DataTable } from "@/components/dashboard/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/utils/trpc";

type User = {
	id: string;
	name: string;
	email: string;
	role: "patient" | "clinician" | "admin";
	image: string | null;
	emailVerified: boolean;
	createdAt: string;
	updatedAt: string;
};

export default function AdminUsersPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");

	const { data: users } = useQuery(trpc.users.list.queryOptions());

	const filteredUsers = users
		?.filter(
			(u) =>
				u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.email.toLowerCase().includes(searchQuery.toLowerCase())
		)
		.filter((u) => roleFilter === "all" || u.role === roleFilter);

	const columns: ColumnDef<User>[] = [
		{
			id: "user",
			header: "User",
			cell: ({ row }) => (
				<div className="flex items-center gap-3">
					<Avatar>
						<AvatarImage alt={row.original.name} src={row.original.image ?? undefined} />
						<AvatarFallback>
							{row.original.name
								.split(" ")
								.filter((n) => n.length > 0)
								.map((n) => n[0])
								.join("")
								.toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div>
						<div className="font-medium">{row.original.name}</div>
						<div className="flex items-center gap-2 text-muted-foreground text-sm">
							{row.original.email}
							{row.original.emailVerified && (
								<Badge className="text-xs" variant="outline">
									Verified
								</Badge>
							)}
						</div>
					</div>
				</div>
			),
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ getValue }) => {
				const role = getValue() as string;
				return <Badge>{role.charAt(0).toUpperCase() + role.slice(1)}</Badge>;
			},
		},
		{
			accessorKey: "createdAt",
			header: "Joined",
			cell: ({ getValue }) => {
				const date = new Date(getValue() as string);
				return date.toLocaleDateString("en-US", {
					year: "numeric",
					month: "short",
					day: "numeric",
				});
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: () => (
				<div className="flex gap-2">
					<Button disabled size="sm" variant="outline">
						Edit Role
					</Button>
					<Button disabled size="sm" variant="outline">
						View Details
					</Button>
				</div>
			),
		},
	];

	return (
		<div className="flex-1 space-y-6 p-8">
			<DashboardBreadcrumb
				items={[
					{ label: "Dashboard", href: "/dashboard" },
					{ label: "Admin", href: "/dashboard/admin" },
					{ label: "User Management" },
				]}
			/>

			<div>
				<h1 className="flex items-center font-bold text-3xl tracking-tight">
					<Users className="mr-3 h-8 w-8" />
					User Management
				</h1>
				<p className="mt-2 text-muted-foreground">Manage all users in the system</p>
			</div>

			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle>All Users</CardTitle>
						<div className="flex items-center gap-4">
							<div className="relative w-64">
								<Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
								<Input
									className="pl-8"
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search users..."
									value={searchQuery}
								/>
							</div>
							<Select onValueChange={setRoleFilter} value={roleFilter}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Filter by role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Roles</SelectItem>
									<SelectItem value="patient">Patients</SelectItem>
									<SelectItem value="clinician">Clinicians</SelectItem>
									<SelectItem value="admin">Admins</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<DataTable columns={columns} data={filteredUsers ?? []} emptyMessage="No users found" />
				</CardContent>
			</Card>
		</div>
	);
}
