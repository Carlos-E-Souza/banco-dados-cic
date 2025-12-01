"use client";

import { ChangeEvent, FormEvent } from "react";
import DateInput from "../DateInput";
import { Cargo, FuncionarioFormState, OrgaoPublico } from "./types";

type CreateFuncionarioModalProps = {
	isOpen: boolean;
	cargos: Cargo[];
	orgaos: OrgaoPublico[];
	formState: FuncionarioFormState;
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onChange: (field: keyof FuncionarioFormState, value: string) => void;
};

const inputClassName =
	"w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200";

const CreateFuncionarioModal = ({ isOpen, cargos, orgaos, formState, isSaving, onClose, onSubmit, onChange }: CreateFuncionarioModalProps) => {
	if (!isOpen) {
		return null;
	}

	const handleChange = (field: keyof FuncionarioFormState) =>
		(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(field, event.target.value);

	const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
		const input = event.target;
		const file = input.files?.[0];
		if (!file) {
			onChange("foto", "");
			input.value = "";
			return;
		}

		const reader = new FileReader();
		reader.onloadend = () => {
			if (typeof reader.result === "string") {
				const [, base64Data] = reader.result.split(",");
				onChange("foto", base64Data ?? "");
			}
			input.value = "";
		};
		reader.readAsDataURL(file);
	};

	const handleRemoveImage = () => {
		onChange("foto", "");
	};

	const previewSrc = formState.foto ? `data:image/*;base64,${formState.foto}` : null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-neutral-900">Adicionar funcionário</h2>
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
					<div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
						<div className="flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border border-neutral-200 bg-neutral-50">
							{previewSrc ? (
								<img
									src={previewSrc}
									alt="Pré-visualização da foto do funcionário"
									className="h-full w-full object-cover"
								/>
							) : (
								<span className="px-3 text-center text-xs text-neutral-400">Sem foto</span>
							)}
						</div>
						<div className="flex flex-col items-center gap-2 text-center md:items-start md:text-left">
							<label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-lime-400 hover:text-lime-600">
								<input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
								Selecionar imagem
							</label>
							{formState.foto && (
								<button
									type="button"
									onClick={handleRemoveImage}
									className="text-xs font-semibold text-red-500 transition-colors hover:text-red-600"
								>
									Remover foto
								</button>
							)}
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="novo-funcionario-cpf" className="text-sm font-semibold text-neutral-800">
								CPF
							</label>
							<input
								id="novo-funcionario-cpf"
								type="text"
								value={formState.cpf}
								onChange={handleChange("cpf")}
								className={inputClassName}
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="novo-funcionario-nome" className="text-sm font-semibold text-neutral-800">
								Nome completo
							</label>
							<input
								id="novo-funcionario-nome"
								type="text"
								value={formState.nome}
								onChange={handleChange("nome")}
								className={inputClassName}
								required
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="novo-funcionario-email" className="text-sm font-semibold text-neutral-800">
								E-mail
							</label>
							<input
								id="novo-funcionario-email"
								type="email"
								value={formState.email}
								onChange={handleChange("email")}
								className={inputClassName}
								placeholder="nome@exemplo.com"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="novo-funcionario-senha" className="text-sm font-semibold text-neutral-800">
								Senha de acesso
							</label>
							<input
								id="novo-funcionario-senha"
								type="password"
								value={formState.senha}
								onChange={handleChange("senha")}
								className={inputClassName}
								required
								minLength={6}
								placeholder="Crie uma senha segura"
							/>
							<p className="text-xs text-neutral-500">Use pelo menos 6 caracteres.</p>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="novo-funcionario-data-nasc" className="text-sm font-semibold text-neutral-800">
								Data de nascimento
							</label>
							<DateInput
								id="novo-funcionario-data-nasc"
								value={formState.dataNasc}
								onChange={(value) => onChange("dataNasc", value)}
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="novo-funcionario-inicio" className="text-sm font-semibold text-neutral-800">
								Início do contrato
							</label>
							<DateInput
								id="novo-funcionario-inicio"
								value={formState.inicioContrato}
								onChange={(value) => onChange("inicioContrato", value)}
								required
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="novo-funcionario-fim" className="text-sm font-semibold text-neutral-800">
								Fim do contrato
							</label>
							<DateInput
								id="novo-funcionario-fim"
								value={formState.fimContrato}
								onChange={(value) => onChange("fimContrato", value)}
								isClearable
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="novo-funcionario-orgao" className="text-sm font-semibold text-neutral-800">
								Órgão público
							</label>
							<select
								id="novo-funcionario-orgao"
								value={formState.orgaoPub}
								onChange={handleChange("orgaoPub")}
								className={inputClassName}
								required
							>
								<option value="" disabled>
									Selecione um órgão
								</option>
								{orgaos.map((orgao) => (
									<option key={orgao.cod_orgao} value={orgao.cod_orgao}>
										{orgao.nome}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="space-y-2">
						<label htmlFor="novo-funcionario-cargo" className="text-sm font-semibold text-neutral-800">
							Cargo
						</label>
						<select
							id="novo-funcionario-cargo"
							value={formState.cargo}
							onChange={handleChange("cargo")}
							className={inputClassName}
							required
						>
							<option value="" disabled>
								Selecione um cargo
							</option>
							{cargos.map((item) => (
								<option key={item.cod_cargo} value={item.cod_cargo}>
									{item.nome}
								</option>
							))}
						</select>
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
						{isSaving ? "Salvando..." : "Adicionar funcionário"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default CreateFuncionarioModal;
