import { FormEvent, ChangeEvent } from "react";
import { Ocorrencia, OcorrenciaFormState, TipoOcorrencia } from "./types";

type EditOcorrenciaModalProps = {
	ocorrencia: Ocorrencia | null;
	tipos: TipoOcorrencia[];
	formState: OcorrenciaFormState;
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onChange: (field: keyof OcorrenciaFormState, value: string) => void;
};

const EditOcorrenciaModal = ({
	ocorrencia,
	tipos,
	formState,
	isSaving,
	onClose,
	onSubmit,
	onChange,
}: EditOcorrenciaModalProps) => {
	if (!ocorrencia) {
		return null;
	}

	const createChangeHandler = (field: keyof OcorrenciaFormState) =>
		(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
			onChange(field, event.target.value);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="w-full max-w-3xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-neutral-900">Editar ocorrência</h2>
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
							<label htmlFor="edit-tipo" className="text-sm font-semibold text-neutral-800">
								Tipo de ocorrência
							</label>
							<select
								id="edit-tipo"
								value={formState.tipoOcorrencia}
								onChange={createChangeHandler("tipoOcorrencia")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							>
								<option value="" disabled>
									Selecione uma opção
								</option>
								{tipos.map((tipo) => (
									<option key={tipo.cod_tipo} value={tipo.cod_tipo}>
										{tipo.nome}
									</option>
								))}
							</select>
						</div>
						<div className="space-y-2">
							<label htmlFor="edit-status" className="text-sm font-semibold text-neutral-800">
								Status
							</label>
							<input
								id="edit-status"
								type="text"
								value={formState.status}
								onChange={createChangeHandler("status")}
								placeholder="Em análise"
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="edit-estado" className="text-sm font-semibold text-neutral-800">
								Estado
							</label>
							<input
								id="edit-estado"
								type="text"
								value={formState.estado}
								onChange={createChangeHandler("estado")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="edit-municipio" className="text-sm font-semibold text-neutral-800">
								Município
							</label>
							<input
								id="edit-municipio"
								type="text"
								value={formState.municipio}
								onChange={createChangeHandler("municipio")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="edit-bairro" className="text-sm font-semibold text-neutral-800">
								Bairro
							</label>
							<input
								id="edit-bairro"
								type="text"
								value={formState.bairro}
								onChange={createChangeHandler("bairro")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="edit-endereco" className="text-sm font-semibold text-neutral-800">
								Endereço
							</label>
							<input
								id="edit-endereco"
								type="text"
								value={formState.endereco}
								onChange={createChangeHandler("endereco")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="edit-data" className="text-sm font-semibold text-neutral-800">
								Data
							</label>
							<input
								id="edit-data"
								type="date"
								value={formState.data}
								onChange={createChangeHandler("data")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="edit-descricao" className="text-sm font-semibold text-neutral-800">
								Descrição
							</label>
							<textarea
								id="edit-descricao"
								value={formState.descricao}
								onChange={createChangeHandler("descricao")}
								className="h-28 w-full rounded-3xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
							/>
						</div>
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

export default EditOcorrenciaModal;
