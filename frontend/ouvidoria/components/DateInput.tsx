"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import DatePicker from "react-datepicker";
import type { DatePickerProps } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DEFAULT_INPUT_CLASSES =
	"w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200";

const joinClasses = (...values: Array<string | undefined>) => values.filter(Boolean).join(" ");

const parseToDate = (value?: string | Date | null) => {
	if (!value) {
		return null;
	}
	if (value instanceof Date) {
		return value;
	}
	const [year, month, day] = value.split("-").map(Number);
	if (!year || !month || !day) {
		return null;
	}
	const date = new Date(year, month - 1, day);
	return Number.isNaN(date.getTime()) ? null : date;
};

const formatToISO = (date: Date | null) => {
	if (!date) {
		return "";
	}
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

type NativeInputProps = InputHTMLAttributes<HTMLInputElement>;

type DateInputProps = {
	id?: string;
	name?: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	inputClassName?: string;
	required?: boolean;
	disabled?: boolean;
	autoComplete?: string;
	minDate?: Date | string;
	maxDate?: Date | string;
	dateFormat?: string;
	isClearable?: boolean;
	pickerProps?: Partial<Omit<DatePickerProps, "selected" | "onChange" | "customInput" | "selectsRange" | "selectsMultiple" | "placeholderText">>;
};

const StyledInput = forwardRef<HTMLInputElement, NativeInputProps>(({ className, ...props }, ref) => (
	<input ref={ref} className={joinClasses(DEFAULT_INPUT_CLASSES, className)} {...props} />
));

StyledInput.displayName = "StyledInput";

const normalizeDate = (value?: DateInputProps["minDate"]) => {
	if (!value) {
		return undefined;
	}
	if (value instanceof Date) {
		return value;
	}
	return parseToDate(value) ?? undefined;
};

const DateInput = ({
	id,
	name,
	value,
	onChange,
	placeholder = "dd/mm/aaaa",
	inputClassName,
	required,
	disabled,
	autoComplete = "off",
	minDate,
	maxDate,
	dateFormat = "dd/MM/yyyy",
	isClearable = false,
	pickerProps,
}: DateInputProps) => {
	const selectedDate = parseToDate(value);
	const resolvedMinDate = normalizeDate(minDate);
	const resolvedMaxDate = normalizeDate(maxDate);
	const customInput = (
		<StyledInput
			id={id}
			name={name}
			placeholder={placeholder}
			required={required}
			disabled={disabled}
			autoComplete={autoComplete}
			className={inputClassName}
		/>
	);
	const handleDateChange = (date: Date | [Date | null, Date | null] | Date[] | null) => {
		const candidate = Array.isArray(date) ? date[0] ?? null : date;
		onChange(formatToISO(candidate instanceof Date || candidate === null ? candidate : null));
	};
	const baseProps = {
		selected: selectedDate,
		onChange: handleDateChange as DatePickerProps["onChange"],
		customInput,
		dateFormat,
		isClearable,
		placeholderText: placeholder,
		disabled,
		required,
		showMonthDropdown: true,
		showYearDropdown: true,
		dropdownMode: "select",
		scrollableYearDropdown: true,
		yearDropdownItemNumber: 100,
	} as DatePickerProps;

	if (resolvedMinDate) {
		baseProps.minDate = resolvedMinDate;
	}

	if (resolvedMaxDate) {
		baseProps.maxDate = resolvedMaxDate;
	}

	if (pickerProps) {
		Object.assign(baseProps, pickerProps);
	}

	baseProps.wrapperClassName = joinClasses("w-full", baseProps.wrapperClassName);
	baseProps.className = joinClasses(baseProps.className, "w-full");

	return (
		<DatePicker {...baseProps} />
	);
};

export default DateInput;
