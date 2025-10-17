"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { DataTable } from "@/components/dashboard/data-table";
import { ListCard } from "@/components/dashboard/list-card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, type RouterOutput, trpc, trpcClient } from "@/utils/trpc";

type User = RouterOutput["users"]["list"][number];

const ROLE_UPDATE_DEBOUNCE_MS = 500;

export default function AdminUsersPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");

	const queryOptions = trpc.users.list.queryOptions();
	const { data: users, isPending } = useQuery(queryOptions);

	const updateRoleMutation = useMutation({
		mutationFn: ({ userId, role }: { userId: string; role: "patient" | "clinician" | "admin" }) =>
			trpcClient.users.updateRole.mutate({ userId, role }),
		onMutate: async ({ userId, role }: { userId: string; role: "patient" | "clinician" | "admin" }) => {
			await queryClient.cancelQueries({ queryKey: queryOptions.queryKey });

			const previousUsers = queryClient.getQueryData<User[]>(queryOptions.queryKey);

			if (previousUsers) {
				queryClient.setQueryData<User[]>(
					queryOptions.queryKey,
					previousUsers.map((user: User) => (user.id === userId ? { ...user, role } : user))
				);
			}

			return { previousUsers: previousUsers ?? [] };
		},
		onSuccess: () => {
			// toast.success("User role updated successfully");
		},
		onError: (
			error: Error,
			_variables: { userId: string; role: "patient" | "clinician" | "admin" },
			context: { previousUsers: User[] } | undefined
		) => {
			if (context?.previousUsers) {
				queryClient.setQueryData(queryOptions.queryKey, context.previousUsers);
			}
			toast.error(error.message ?? "Failed to update user role");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: queryOptions.queryKey });
		},
	});

	const debouncedUpdateRole = useDebouncedCallback((userId: string, role: "patient" | "clinician" | "admin") => {
		updateRoleMutation.mutate({ userId, role });
	}, ROLE_UPDATE_DEBOUNCE_MS);

	const filteredUsers = users
		?.filter(
			(u: User) =>
				u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				u.email.toLowerCase().includes(searchQuery.toLowerCase())
		)
		.filter((u: User) => roleFilter === "all" || u.role === roleFilter);

	const columns: ColumnDef<User>[] = [
		{
			id: "user",
			header: "User",
			cell: ({ row }) => (
				<div className="flex items-center gap-3">
					<Avatar className="rounded-md">
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
			cell: ({ row }) => {
				const user = row.original;
				const isAdmin = user.role === "admin";

				return (
					<Select
						disabled={isAdmin}
						onValueChange={(value) => {
							debouncedUpdateRole(user.id, value as "patient" | "clinician" | "admin");
						}}
						value={user.role}
					>
						<SelectTrigger className={isAdmin ? "cursor-not-allowed opacity-60" : ""}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="patient">Patient</SelectItem>
							<SelectItem value="clinician">Clinician</SelectItem>
							<SelectItem value="admin">Admin</SelectItem>
						</SelectContent>
					</Select>
				);
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
			cell: ({ row }) => (
				<Button
					onClick={() => router.push(`/dashboard/admin/users/${row.original.id}`)}
					size="sm"
					variant="outline"
				>
					<Eye className="h-4 w-4" />
					View Details
				</Button>
			),
		},
	];

	return (
		<DashboardPageShell
			header={
				<PageHeader
					breadcrumbItems={[
						{ label: "Dashboard", href: "/dashboard" },
						{ label: "Admin", href: "/dashboard/admin" },
						{ label: "User Management" },
					]}
					description="Manage all users in the system"
					icon={<Users className="h-8 w-8" />}
					title="User Management"
				/>
			}
		>
			<ListCard
				actions={
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
				}
				title="All Users"
			>
				{isPending ? (
					<div className="space-y-4">
						{Array.from({ length: 5 }, (_, i) => `skeleton-${i}`).map((key) => (
							<div
								className="flex items-center gap-4 border-border border-b py-4 last:border-b-0"
								key={key}
							>
								<Skeleton className="h-10 w-10 rounded-full" />
								<div className="flex-1 space-y-2">
									<Skeleton className="h-4 w-32" />
									<Skeleton className="h-3 w-48" />
								</div>
								<Skeleton className="h-6 w-20" />
								<Skeleton className="h-4 w-24" />
								<div className="flex gap-2">
									<Skeleton className="h-8 w-20" />
									<Skeleton className="h-8 w-24" />
								</div>
							</div>
						))}
					</div>
				) : (
					<DataTable columns={columns} data={filteredUsers ?? []} emptyMessage="No users found" />
				)}
			</ListCard>
		</DashboardPageShell>
	);
}
