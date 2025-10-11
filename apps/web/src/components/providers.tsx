"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { queryClient } from "@/utils/trpc";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" disableTransitionOnChange enableSystem>
			<QueryClientProvider client={queryClient}>
				<NuqsAdapter>
					{children}
					<ReactQueryDevtools />
				</NuqsAdapter>
			</QueryClientProvider>
			<Toaster richColors />
		</ThemeProvider>
	);
}
