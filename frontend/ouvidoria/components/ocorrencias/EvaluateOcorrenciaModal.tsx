import { ChangeEvent, FormEvent } from "react";
import { AvaliacaoFormState, Ocorrencia } from "./types";

type EvaluateOcorrenciaModalProps = {
	ocorrencia: Ocorrencia | null;
	formState: AvaliacaoFormState;
	isSaving: boolean;
	isLoading: boolean;
	isEditing: boolean;
	onClose: () => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	onChange: (field: keyof AvaliacaoFormState, value: string) => void;
};

const EvaluateOcorrenciaModal = ({ ocorrencia, formState, isSaving, isLoading, isEditing, onClose, onSubmit, onChange }: EvaluateOcorrenciaModalProps) => {
	if (!ocorrencia) {
		return null;
	}

	const handleChange = (field: keyof AvaliacaoFormState) =>
		(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(field, event.target.value);

	const inputsDisabled = isSaving || isLoading;
	const submitLabel = isLoading ? "Carregando avaliação..." : isSaving ? "Enviando avaliação..." : isEditing ? "Atualizar avaliação" : "Enviar avaliação";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="w-full max-w-2xl space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-neutral-900">Avaliar ocorrência #{ocorrencia.cod_oco}</h2>
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
				<form className="space-y-5" onSubmit={onSubmit}>
					{isLoading && (
						<div className="rounded-full border border-neutral-200 bg-neutral-100 px-4 py-2 text-center text-xs font-semibold text-neutral-600">
							Carregando dados da avaliação...
						</div>
					)}
					<div className="grid gap-4 md:grid-cols-2">
						<div className="space-y-2">
							<label htmlFor="avaliacao-nota-serv" className="text-sm font-semibold text-neutral-800">
								Nota do serviço
							</label>
							<input
								id="avaliacao-nota-serv"
								type="number"
								min="0"
								max="10"
								value={formState.notaServ}
								onChange={handleChange("notaServ")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
								disabled={inputsDisabled}
							/>
						</div>
						<div className="space-y-2">
							<label htmlFor="avaliacao-nota-tempo" className="text-sm font-semibold text-neutral-800">
								Nota do tempo de atendimento
							</label>
							<input
								id="avaliacao-nota-tempo"
								type="number"
								min="0"
								max="10"
								value={formState.notaTempo}
								onChange={handleChange("notaTempo")}
								className="w-full rounded-full border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								required
								disabled={inputsDisabled}
							/>
						</div>
					</div>
					<div className="space-y-2">
						<label htmlFor="avaliacao-opiniao" className="text-sm font-semibold text-neutral-800">
							Comentário adicional
						</label>
						<textarea
							id="avaliacao-opiniao"
							value={formState.opiniao}
							onChange={handleChange("opiniao")}
							className="h-32 w-full rounded-3xl border border-neutral-300 px-4 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
							placeholder="Conte como foi o atendimento."
							disabled={inputsDisabled}
						/>
					</div>
					<button
						type="submit"
						disabled={inputsDisabled}
						className={`w-full rounded-full border px-6 py-3 text-sm font-semibold transition-colors ${
							inputsDisabled
								? "border-neutral-300 bg-neutral-200 text-neutral-500"
								: "border-lime-500 bg-neutral-900 text-white hover:bg-lime-500 hover:text-neutral-900"
						}`}
					>
						{submitLabel}
					</button>
				</form>
			</div>
		</div>
	);
};

export default EvaluateOcorrenciaModal;
