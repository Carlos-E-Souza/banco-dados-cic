import { ChangeEvent, FormEvent } from "react";
import { FiX } from "react-icons/fi";
import { OrgaoPublico } from "../funcionarios/types";
import { Servico } from "./types";
import { EditServicoFormState } from "./types";

type EditServicoModalProps = {
	servico: Servico | null;
	orgaos: OrgaoPublico[];
	formState: EditServicoFormState;
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onChange: (field: keyof EditServicoFormState, value: string) => void;
};

const EditServicoModal = ({ servico, orgaos, formState, isSaving, onClose, onSubmit, onChange }: EditServicoModalProps) => {
	if (!servico) {
		return null;
	}

	const handleChange = (field: keyof EditServicoFormState) =>
		(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
			onChange(field, event.target.value);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-neutral-900">Editar serviço</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full border border-neutral-200 p-2 text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700"
					>
						<FiX className="h-4 w-4" />
					</button>
				</div>
				<form className="mt-6 space-y-5" onSubmit={onSubmit}>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label className="text-sm font-semibold text-neutral-800">Código do serviço</label>
							<input
								type="text"
								value={servico.cod_servico}
								readOnly
								className="w-full rounded-full border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500 focus:outline-none"
							/>
						</div>
						<div className="space-y-2">
							<label className="text-sm font-semibold text-neutral-800">Ocorrência vinculada</label>
							<input
								type="text"
								value={`#${servico.cod_ocorrencia}`}
								readOnly
								className="w-full rounded-full border border-neutral-200 bg-neutral-100 px-4 py-3 text-sm text-neutral-500 focus:outline-none"
							/>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="editar-servico-nome" className="text-sm font-semibold text-neutral-800">
								Nome do serviço
							</label>
							<input
								id="editar-servico-nome"
								type="text"
								value={formState.nome}
								onChange={handleChange("nome")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="editar-servico-orgao" className="text-sm font-semibold text-neutral-800">
								Órgão público responsável
							</label>
							<select
								id="editar-servico-orgao"
								value={formState.codOrgao}
								onChange={handleChange("codOrgao")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							>
								{orgaos.map((orgao) => (
									<option key={orgao.cod_orgao} value={orgao.cod_orgao}>
										{orgao.nome}
									</option>
								))}
							</select>
						</div>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="editar-servico-inicio" className="text-sm font-semibold text-neutral-800">
								Início do serviço
							</label>
							<input
								id="editar-servico-inicio"
								type="date"
								value={formState.inicioServico}
								onChange={handleChange("inicioServico")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="editar-servico-fim" className="text-sm font-semibold text-neutral-800">
								Conclusão do serviço
							</label>
							<input
								id="editar-servico-fim"
								type="date"
								value={formState.fimServico}
								onChange={handleChange("fimServico")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
							/>
						</div>
					</div>
					<div className="space-y-2">
						<label htmlFor="editar-servico-descricao" className="text-sm font-semibold text-neutral-800">
							Descrição do serviço
						</label>
						<textarea
							id="editar-servico-descricao"
							value={formState.descricao}
							onChange={handleChange("descricao")}
							className="h-32 w-full rounded-3xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
							placeholder="Atualize a descrição do serviço"
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
						{isSaving ? "Salvando..." : "Salvar alterações"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default EditServicoModal;
