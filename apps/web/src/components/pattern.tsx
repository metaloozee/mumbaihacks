import type { ReactNode } from "react";

export default function PatternBackground({ children }: { children?: ReactNode }) {
	return (
		<div className="relative w-full">
			{/* Pattern grid */}
			<div className="-z-10 pointer-events-none absolute inset-0 overflow-hidden opacity-40">
				<div
					aria-hidden
					className="absolute inset-0 opacity-50 dark:opacity-40"
					style={{
						backgroundImage:
							"linear-gradient(to right, #e7e5e4 1px, transparent 1px), linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)",
						backgroundSize: "20px 20px",
						backgroundPosition: "0 0, 0 0",
						maskImage:
							"repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)",
						WebkitMaskImage:
							"repeating-linear-gradient(to right, black 0px, black 3px, transparent 3px, transparent 8px), repeating-linear-gradient(to bottom, black 0px, black 3px, transparent 3px, transparent 8px), radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)",
						maskComposite: "intersect",
						WebkitMaskComposite: "source-in",
					}}
				/>

				{/* Soft vertical blend so pattern fades into sections */}
				<div
					aria-hidden
					className="absolute inset-0"
					style={{
						background:
							"linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--background)/0.85) 12%, hsl(var(--background)/0) 28%, hsl(var(--background)/0) 72%, hsl(var(--background)/0.85) 88%, hsl(var(--background)) 100%)",
					}}
				/>

				{/* Primary glow near hero to add depth but blend smoothly */}
				<div
					aria-hidden
					className="absolute"
					style={{
						top: "-12%",
						left: "50%",
						transform: "translateX(-50%)",
						width: "900px",
						height: "360px",
						borderRadius: "9999px",
						background: "radial-gradient(ellipse at center, hsl(var(--primary)/0.14), transparent 60%)",
						filter: "blur(48px)",
					}}
				/>
			</div>

			{children}
		</div>
	);
}
