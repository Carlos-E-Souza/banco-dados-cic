import { Ocorrencia } from "./types";

type OcorrenciaCardProps = {
	ocorrencia: Ocorrencia;
	isFuncionario: boolean;
	onEdit?: (ocorrencia: Ocorrencia) => void;
	onDelete?: (ocorrencia: Ocorrencia) => void;
	onEvaluate?: (ocorrencia: Ocorrencia) => void;
	onService?: (ocorrencia: Ocorrencia) => void;
};

const formatDate = (rawDate?: string | null) => {
	if (!rawDate) {
		return "";
	}

	const [year, month, day] = rawDate.split("-").map(Number);
	if (!year || !month || !day) {
		return rawDate;
	}

	return new Intl.DateTimeFormat("pt-BR").format(new Date(year, month - 1, day));
};

const OcorrenciaCard = ({ ocorrencia, isFuncionario, onEdit, onDelete, onEvaluate, onService }: OcorrenciaCardProps) => {
	const formattedDate = formatDate(ocorrencia.data);
	const isFinalizada = ocorrencia.tipo_status?.toLowerCase() === "finalizada";
	const canEvaluate = !isFuncionario && isFinalizada;

	return (
		<div className="flex h-full flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
			<div className="space-y-3">
				<div className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lime-700">
					{ocorrencia.tipo_nome}
					<span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
						{ocorrencia.tipo_status}
					</span>
				</div>
				<h3 className="text-xl font-semibold text-neutral-900">Código #{ocorrencia.cod_oco}</h3>
				<ul className="space-y-1 text-sm text-neutral-600">
					<li>
						<span className="font-semibold text-neutral-800">Data:</span> {formattedDate}
					</li>
					<li>
						<span className="font-semibold text-neutral-800">Local:</span> {ocorrencia.endereco}, {ocorrencia.bairro}, {ocorrencia.cidade} - {ocorrencia.estado}
					</li>
					<li>
						<span className="font-semibold text-neutral-800">Descrição:</span> {ocorrencia.descr}
					</li>
				</ul>
			</div>
			<div className="mt-6 flex flex-wrap items-center justify-end gap-3">
				<>
					<button
						type="button"
						onClick={() => onEdit?.(ocorrencia)}
						className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:border-lime-500 hover:text-lime-600"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-4 w-4"
						>
							<path d="M16.862 3.487a2.1 2.1 0 0 1 2.97 2.97l-9.05 9.05a4 4 0 0 1-1.69 1.01l-3.38.99.99-3.38a4 4 0 0 1 1.01-1.69l9.15-9.15Z" />
							<path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						Editar
					</button>
					<button
						type="button"
						onClick={() => onDelete?.(ocorrencia)}
						className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-500 transition-colors hover:border-red-400 hover:text-red-600"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							className="h-4 w-4"
						>
							<path d="M6 7h12" strokeLinecap="round" />
							<path d="M10 11v6" strokeLinecap="round" />
							<path d="M14 11v6" strokeLinecap="round" />
							<path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" />
							<path d="M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						Excluir
					</button>
					{canEvaluate && (
						<button
							type="button"
							onClick={() => onEvaluate?.(ocorrencia)}
							className="inline-flex items-center gap-2 rounded-full border border-lime-300 px-4 py-2 text-xs font-semibold text-lime-600 transition-colors hover:border-lime-500 hover:text-lime-700"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								className="h-4 w-4"
							>
								<path d="m12 6.5 1.35 2.73 3.02.44-2.18 2.13.51 2.99L12 13.77l-2.7 1.42.51-2.99-2.18-2.13 3.02-.44L12 6.5Z" strokeLinejoin="round" />
							</svg>
							Avaliar
						</button>
					)}
				</>
			</div>
		</div>
	);
};

export default OcorrenciaCard;
