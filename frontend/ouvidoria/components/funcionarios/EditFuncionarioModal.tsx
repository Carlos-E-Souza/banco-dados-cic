import { ChangeEvent, FormEvent } from "react";
import { Cargo, Funcionario, FuncionarioFormState, OrgaoPublico } from "./types";

type EditFuncionarioModalProps = {
	funcionario: Funcionario | null;
	cargos: Cargo[];
	orgaos: OrgaoPublico[];
	formState: FuncionarioFormState;
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onChange: (field: keyof FuncionarioFormState, value: string) => void;
};

const EditFuncionarioModal = ({ funcionario, cargos, orgaos, formState, isSaving, onClose, onSubmit, onChange }: EditFuncionarioModalProps) => {
	if (!funcionario) {
		return null;
	}

	const handleChange = (field: keyof FuncionarioFormState) =>
		(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange(field, event.target.value);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-neutral-900">Editar funcionário</h2>
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
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-semibold text-neutral-800">CPF</label>
							<input
								type="text"
								value={funcionario.cpf}
								readOnly
								className="w-full rounded-full border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500 focus:outline-none"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="funcionario-nome" className="text-sm font-semibold text-neutral-800">
								Nome completo
							</label>
							<input
								id="funcionario-nome"
								type="text"
								value={formState.nome}
								onChange={handleChange("nome")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="funcionario-data-nasc" className="text-sm font-semibold text-neutral-800">
								Data de nascimento
							</label>
							<input
								id="funcionario-data-nasc"
								type="date"
								value={formState.dataNasc}
								onChange={handleChange("dataNasc")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="funcionario-inicio" className="text-sm font-semibold text-neutral-800">
								Início do contrato
							</label>
							<input
								id="funcionario-inicio"
								type="date"
								value={formState.inicioContrato}
								onChange={handleChange("inicioContrato")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="funcionario-fim" className="text-sm font-semibold text-neutral-800">
								Fim do contrato
							</label>
							<input
								id="funcionario-fim"
								type="date"
								value={formState.fimContrato}
								onChange={handleChange("fimContrato")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="funcionario-orgao" className="text-sm font-semibold text-neutral-800">
								Órgão público
							</label>
							<select
								id="funcionario-orgao"
								value={formState.orgaoPub}
								onChange={handleChange("orgaoPub")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
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
						<label htmlFor="funcionario-cargo" className="text-sm font-semibold text-neutral-800">
							Cargo
						</label>
						<select
							id="funcionario-cargo"
							value={formState.cargo}
							onChange={handleChange("cargo")}
							className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
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
						{isSaving ? "Salvando..." : "Salvar alterações"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default EditFuncionarioModal;
