import { ChangeEvent, FormEvent } from "react";
import { FiX } from "react-icons/fi";
import { Ocorrencia } from "../ocorrencias/types";
import { OrgaoPublico } from "../funcionarios/types";
import { CreateServicoFormState } from "./types";

type CreateServicoModalProps = {
	isOpen: boolean;
	orgaos: OrgaoPublico[];
	ocorrencias: Ocorrencia[];
	formState: CreateServicoFormState;
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onChange: (field: keyof CreateServicoFormState, value: string) => void;
};

const CreateServicoModal = ({ isOpen, orgaos, ocorrencias, formState, isSaving, onClose, onSubmit, onChange }: CreateServicoModalProps) => {
	if (!isOpen) {
		return null;
	}

	const handleChange = (field: keyof CreateServicoFormState) =>
		(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
			onChange(field, event.target.value);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-neutral-900">Registrar serviço</h2>
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
							<label htmlFor="servico-nome" className="text-sm font-semibold text-neutral-800">
								Nome do serviço
							</label>
							<input
								id="servico-nome"
								type="text"
								value={formState.nome}
								onChange={handleChange("nome")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="servico-orgao" className="text-sm font-semibold text-neutral-800">
								Órgão público responsável
							</label>
							<select
								id="servico-orgao"
								value={formState.codOrgao}
								onChange={handleChange("codOrgao")}
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
						<label htmlFor="servico-ocorrencia" className="text-sm font-semibold text-neutral-800">
							Código da ocorrência vinculada
						</label>
						<select
							id="servico-ocorrencia"
							value={formState.codOcorrencia}
							onChange={handleChange("codOcorrencia")}
							className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
							required
						>
							<option value="" disabled>
								Selecione a ocorrência
							</option>
							{ocorrencias.map((ocorrencia) => (
								<option key={ocorrencia.cod_oco} value={ocorrencia.cod_oco}>
									#{ocorrencia.cod_oco} — {ocorrencia.tipo_nome}
								</option>
							))}
						</select>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="servico-inicio" className="text-sm font-semibold text-neutral-800">
								Início do serviço
							</label>
							<input
								id="servico-inicio"
								type="date"
								value={formState.inicioServico}
								onChange={handleChange("inicioServico")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
						/>
						</div>
						<div className="space-y-2">
							<label htmlFor="servico-fim" className="text-sm font-semibold text-neutral-800">
								Conclusão do serviço
							</label>
							<input
								id="servico-fim"
								type="date"
								value={formState.fimServico}
								onChange={handleChange("fimServico")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
						/>
						</div>
					</div>
					<div className="space-y-2">
						<label htmlFor="servico-descricao" className="text-sm font-semibold text-neutral-800">
							Descrição do serviço
						</label>
						<textarea
							id="servico-descricao"
							value={formState.descricao}
							onChange={handleChange("descricao")}
							className="h-32 w-full rounded-3xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
							placeholder="Descreva as ações que serão executadas"
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
						{isSaving ? "Salvando..." : "Adicionar serviço"}
					</button>
				</form>
			</div>
		</div>
	);
};

export default CreateServicoModal;
