import { User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export default function UserMenu() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="size-9 rounded-full" />;
	}

	if (!session) {
		return (
			<Button asChild size="icon" variant="outline">
				<Link href="/login">
					<User className="size-5" />
					<span className="sr-only">Sign in</span>
				</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="rounded-full" size="icon" variant="outline">
					<Avatar>
						<AvatarImage alt={session.user.name ?? ""} src={session.user.image ?? ""} />
						<AvatarFallback>
							<User className="size-5" />
						</AvatarFallback>
					</Avatar>

					<span className="sr-only">Open user menu</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>
					<div className="flex min-w-[12rem] flex-col gap-0.5">
						<span className="font-medium text-sm">{session.user.name}</span>
						<span className="text-muted-foreground text-xs">{session.user.email}</span>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/dashboard">Dashboard</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="cursor-pointer text-red-500 focus:text-red-500"
					onClick={() => {
						authClient.signOut({
							fetchOptions: {
								onSuccess: () => {
									router.push("/");
								},
							},
						});
					}}
				>
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
