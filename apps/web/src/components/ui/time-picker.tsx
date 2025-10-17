"use client";

import * as React from "react";
import { WheelPicker, type WheelPickerOption, WheelPickerWrapper } from "@/components/wheel-picker";
import { cn } from "@/lib/utils";

type TimePickerValue = {
	hour: number; // 0-23
	minute: number; // 0-59
	second?: number; // 0-59
};

type TimePickerProps = {
	id?: string;
	className?: string;
	value?: TimePickerValue;
	onChange?: (value: TimePickerValue) => void;
	showSeconds?: boolean;
	twentyFourHour?: boolean;
	infinite?: boolean;
};

const DEFAULT_PAD_WIDTH = 2;
const HOURS_IN_DAY = 24;
const MINUTES_IN_HOUR = 60;
const SECONDS_IN_MINUTE = 60;
const NOON_HOUR = 12;
const MIDNIGHT_HOUR = 0;
const VISIBLE_COUNT = 20; // must be a multiple of 4 per component docs

const buildNumberOptions = (count: number, pad: number = DEFAULT_PAD_WIDTH): WheelPickerOption[] =>
	Array.from({ length: count }, (_, index) => {
		const value = String(index);
		return { value, label: value.padStart(pad, "0") };
	});

const HOURS_12: WheelPickerOption[] = Array.from({ length: NOON_HOUR }, (_, i) => {
	const hr = (i + 1).toString();
	return { value: hr, label: hr.padStart(DEFAULT_PAD_WIDTH, "0") };
});

const HOURS_24 = buildNumberOptions(HOURS_IN_DAY);
const MINUTES = buildNumberOptions(MINUTES_IN_HOUR);
const SECONDS = buildNumberOptions(SECONDS_IN_MINUTE);

export function TimePicker({
	id,
	className,
	value,
	onChange,
	showSeconds,
	twentyFourHour = true,
	infinite = true,
}: TimePickerProps) {
	const initial = React.useMemo((): TimePickerValue => {
		if (value) {
			return value;
		}
		const now = new Date();
		return {
			hour: now.getHours(),
			minute: now.getMinutes(),
			second: now.getSeconds(),
		};
	}, [value]);

	const initialHourState = twentyFourHour ? initial.hour : initial.hour % NOON_HOUR || NOON_HOUR;
	const [hour, setHour] = React.useState<number>(initialHourState);
	const [minute, setMinute] = React.useState<number>(initial.minute);
	const [second, setSecond] = React.useState<number>(initial.second ?? 0);
	const [ampm, setAmpm] = React.useState<string>(initial.hour >= NOON_HOUR ? "PM" : "AM");

	const to24Hour = React.useCallback((hour12: number, period: "AM" | "PM"): number => {
		const normalized = hour12 % NOON_HOUR === 0 ? NOON_HOUR : hour12 % NOON_HOUR; // 1..12
		if (period === "PM") {
			return normalized === NOON_HOUR ? NOON_HOUR : normalized + NOON_HOUR;
		}
		return normalized === NOON_HOUR ? MIDNIGHT_HOUR : normalized;
	}, []);

	const onChangeRef = React.useRef(onChange);
	React.useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	React.useEffect(() => {
		if (!onChangeRef.current) {
			return;
		}
		const resolvedHour = twentyFourHour ? hour : to24Hour(hour, ampm as "AM" | "PM");
		onChangeRef.current({ hour: resolvedHour, minute, second });
	}, [hour, minute, second, ampm, twentyFourHour, to24Hour]);

	const hourOptions = twentyFourHour ? HOURS_24 : HOURS_12;
	const minuteOptions = MINUTES;
	const secondOptions = SECONDS;

	const selectedHourValue = String(hour);

	return (
		<div className={cn("inline-flex", className)} id={id}>
			<WheelPickerWrapper>
				<WheelPicker
					infinite={infinite}
					onValueChange={(v) => setHour(Number(v))}
					options={hourOptions}
					value={selectedHourValue}
					visibleCount={VISIBLE_COUNT}
				/>
				<WheelPicker
					infinite={infinite}
					onValueChange={(v) => setMinute(Number(v))}
					options={minuteOptions}
					value={String(minute)}
					visibleCount={VISIBLE_COUNT}
				/>
				{showSeconds ? (
					<WheelPicker
						infinite={infinite}
						onValueChange={(v) => setSecond(Number(v))}
						options={secondOptions}
						value={String(second)}
						visibleCount={VISIBLE_COUNT}
					/>
				) : null}
				{twentyFourHour ? null : (
					<WheelPicker
						infinite={infinite}
						onValueChange={setAmpm}
						options={[
							{ value: "AM", label: "AM" },
							{ value: "PM", label: "PM" },
						]}
						value={ampm}
						visibleCount={VISIBLE_COUNT}
					/>
				)}
			</WheelPickerWrapper>
		</div>
	);
}

export type { TimePickerValue };
