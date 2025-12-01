"use client";

import { useEffect } from "react";
import { FiX } from "react-icons/fi";

type AlertPopupProps = {
	message: string;
	type?: "success" | "error";
	onClose: () => void;
};

const typeStyles: Record<NonNullable<AlertPopupProps["type"]>, string> = {
	success: "bg-lime-100 text-lime-800 border-lime-300",
	error: "bg-red-100 text-red-800 border-red-300",
};

const AlertPopup = ({ message, type = "error", onClose }: AlertPopupProps) => {
	useEffect(() => {
		if (!message) {
			return;
		}

		const timeoutId = window.setTimeout(() => {
			onClose();
		}, 5000);

		return () => window.clearTimeout(timeoutId);
	}, [message, onClose]);

	if (!message) {
		return null;
	}

	return (
		<div
			className={`fixed left-1/2 top-6 z-[70] flex -translate-x-1/2 items-center gap-4 rounded-3xl border px-5 py-3 text-sm font-medium shadow-lg ${typeStyles[type]}`}
			data-alert-type={type}
		>
			<span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-inherit">
				{type === "error" ? "Erro" : "Sucesso"}
			</span>
			<span className="max-w-md leading-relaxed text-inherit">{message}</span>
			<button
				type="button"
				onClick={onClose}
				className="flex h-8 w-8 items-center justify-center rounded-full border border-current bg-white/40 text-current transition-colors hover:bg-white"
				aria-label="Fechar alerta"
			>
				<FiX className="h-4 w-4" />
			</button>
		</div>
	);
};

export default AlertPopup;
