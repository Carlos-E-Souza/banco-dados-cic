"use client";

import { ChangeEvent, FormEvent } from "react";
import { CargoFormState } from "./types";

type CreateCargoModalProps = {
	isOpen: boolean;
	formState: CargoFormState;
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onChange: (field: keyof CargoFormState, value: string) => void;
};

const inputClassName =
	"w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200";

const textareaClassName =
	"h-32 w-full rounded-3xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200";

const CreateCargoModal = ({ isOpen, formState, isSaving, onClose, onSubmit, onChange }: CreateCargoModalProps) => {
	if (!isOpen) {
		return null;
	}

	const handleChange = (field: keyof CargoFormState) =>
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field, event.target.value);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-neutral-900">Adicionar cargo</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full border border-neutral-200 p-2 text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-4 w-4"
						>
							<path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
						</svg>
					</button>
				</div>
				<form className="mt-6 space-y-5" onSubmit={onSubmit}>
					<div className="space-y-2">
						<label htmlFor="novo-cargo-nome" className="text-sm font-semibold text-neutral-800">
							Nome do cargo
						</label>
						<input
							id="novo-cargo-nome"
							type="text"
							value={formState.nome}
							onChange={handleChange("nome")}
							className={inputClassName}
							required
						/>
					</div>
					<div className="space-y-2">
						<label htmlFor="novo-cargo-descricao" className="text-sm font-semibold text-neutral-800">
							Descrição
						</label>
						<textarea
							id="novo-cargo-descricao"
							value={formState.descricao}
							onChange={handleChange("descricao")}
							className={textareaClassName}
							placeholder="Descreva as principais responsabilidades (opcional)"
						/>
					</div>
					<button
						type="submit"
						disabled={isSaving}
						className={`w-full rounded-full border px-6 py-3 text-sm font-semibold transition-colors ${
							isSaving
								? "border-neutral-300 bg-neutral-200 text-neutral-500"
								: "border-lime-500 bg-neutral-900 text-white hover:bg-lime-500 hover:text-neutral-900"
						}`}
					>
						{isSaving ? "Salvando..." : "Adicionar cargo"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default CreateCargoModal;
