import { ChangeEvent, FormEvent } from "react";
import { OrgaoPublico } from "../funcionarios/types";
import { OrgaoPublicoFormState } from "./types";

type EditOrgaoPublicoModalProps = {
	orgao: OrgaoPublico | null;
	formState: OrgaoPublicoFormState;
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onChange: (field: keyof OrgaoPublicoFormState, value: string) => void;
};

const EditOrgaoPublicoModal = ({ orgao, formState, isSaving, onClose, onSubmit, onChange }: EditOrgaoPublicoModalProps) => {
	if (!orgao) {
		return null;
	}

	const handleChange = (field: keyof OrgaoPublicoFormState) =>
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field, event.target.value);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-neutral-900">Editar órgão público</h2>
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
							<label className="text-sm font-semibold text-neutral-800">Código</label>
							<input
								type="text"
								value={orgao.cod_orgao}
								readOnly
								className="w-full rounded-full border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500 focus:outline-none"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="orgao-nome" className="text-sm font-semibold text-neutral-800">
								Nome do órgão
							</label>
							<input
								id="orgao-nome"
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
							<label htmlFor="orgao-estado" className="text-sm font-semibold text-neutral-800">
								Estado
							</label>
							<input
								id="orgao-estado"
								type="text"
								value={formState.estado}
								onChange={handleChange("estado")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="orgao-data-inicio" className="text-sm font-semibold text-neutral-800">
								Data de início
							</label>
							<input
								id="orgao-data-inicio"
								type="date"
								value={formState.dataInicio}
								onChange={handleChange("dataInicio")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="orgao-data-fim" className="text-sm font-semibold text-neutral-800">
								Data de término
							</label>
							<input
								id="orgao-data-fim"
								type="date"
								value={formState.dataFim}
								onChange={handleChange("dataFim")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
							/>
						</div>
						<div className="space-y-2 md:col-span-1">
							<label htmlFor="orgao-descricao" className="text-sm font-semibold text-neutral-800">
								Descrição
							</label>
							<textarea
								id="orgao-descricao"
								value={formState.descricao}
								onChange={handleChange("descricao")}
								className="h-32 w-full rounded-3xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								placeholder="Explique a finalidade do órgão"
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

export default EditOrgaoPublicoModal;
