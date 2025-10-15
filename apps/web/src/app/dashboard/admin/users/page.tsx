"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, Search, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb";
import { DataTable } from "@/components/dashboard/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient, trpc, trpcClient } from "@/utils/trpc";

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

const ROLE_UPDATE_DEBOUNCE_MS = 500;

export default function AdminUsersPage() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<string>("all");
	const [selectedUser, setSelectedUser] = useState<User | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);

	const queryOptions = trpc.users.list.queryOptions();
	const { data: users, isPending } = useQuery(queryOptions);

	const updateRoleMutation = useMutation({
		mutationFn: ({ userId, role }: { userId: string; role: "patient" | "clinician" | "admin" }) =>
			trpcClient.users.updateRole.mutate({ userId, role }),
		onMutate: async ({ userId, role }) => {
			await queryClient.cancelQueries({ queryKey: queryOptions.queryKey });

			const previousUsers = queryClient.getQueryData<User[]>(queryOptions.queryKey);

			if (previousUsers) {
				queryClient.setQueryData<User[]>(
					queryOptions.queryKey,
					previousUsers.map((user) => (user.id === userId ? { ...user, role } : user))
				);
			}

			return { previousUsers };
		},
		onSuccess: () => {
			// toast.success("User role updated successfully");
		},
		onError: (error: Error, _variables, context) => {
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
					onClick={() => {
						setSelectedUser(row.original);
						setDialogOpen(true);
					}}
					size="sm"
					variant="outline"
				>
					<Eye className="mr-2 h-4 w-4" />
					View Details
				</Button>
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
				</CardContent>
			</Card>

			<Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>User Details</DialogTitle>
						<DialogDescription>View basic information about this user</DialogDescription>
					</DialogHeader>

					{selectedUser && (
						<div className="space-y-4 py-4">
							<div className="flex items-center gap-4">
								<Avatar className="h-16 w-16">
									<AvatarImage
										alt={selectedUser.name}
										className="rounded-md"
										src={selectedUser.image ?? undefined}
									/>
									<AvatarFallback className="text-lg">
										{selectedUser.name
											.split(" ")
											.filter((n) => n.length > 0)
											.map((n) => n[0])
											.join("")
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<h3 className="font-semibold text-lg">{selectedUser.name}</h3>
									<p className="text-muted-foreground text-sm">{selectedUser.email}</p>
								</div>
							</div>

							<div className="space-y-3 rounded-lg border p-4">
								<div className="grid grid-cols-2 gap-2">
									<span className="text-muted-foreground text-sm">Role:</span>
									<Badge className="w-fit">
										{selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
									</Badge>
								</div>

								<div className="grid grid-cols-2 gap-2">
									<span className="text-muted-foreground text-sm">Email Status:</span>
									<Badge
										className="w-fit"
										variant={selectedUser.emailVerified ? "default" : "secondary"}
									>
										{selectedUser.emailVerified ? "Verified" : "Unverified"}
									</Badge>
								</div>

								<div className="grid grid-cols-2 gap-2">
									<span className="text-muted-foreground text-sm">Joined:</span>
									<span className="text-sm">
										{new Date(selectedUser.createdAt).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</span>
								</div>
							</div>
						</div>
					)}

					<DialogFooter>
						{selectedUser && (
							<Button
								onClick={() => {
									router.push(`/dashboard/admin/users/${selectedUser.id}` as never);
								}}
								variant="default"
							>
								View Full Details
							</Button>
						)}
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
