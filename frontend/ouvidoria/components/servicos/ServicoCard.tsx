import { FiEdit2, FiEye, FiTrash2 } from "react-icons/fi";
import { Servico } from "./types";

type ServicoCardProps = {
	servico: Servico;
	onShowOcorrencia: (servico: Servico) => void;
	onEdit: (servico: Servico) => void;
	onDelete: (servico: Servico) => void;
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

const ServicoCard = ({ servico, onShowOcorrencia, onEdit, onDelete }: ServicoCardProps) => {
	const formattedInicioDate = formatDate(servico.inicio_servico);
	const formattedFimDate = formatDate(servico.fim_servico);
	const notaMedia =
		typeof servico.nota_media_servico === "number" && Number.isFinite(servico.nota_media_servico)
			? servico.nota_media_servico
			: null;
	
	return (
		<div className="flex h-full flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_20px_60px_rgba(17,24,39,0.08)] transition-transform hover:-translate-y-1">
			<div className="space-y-4">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 className="text-xl font-semibold text-neutral-900">{servico.nome}</h2>
						<p className="text-sm text-neutral-500">Órgão responsável: {servico.orgao_nome ?? `#${servico.cod_orgao}`}</p>
					</div>
					<span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">#{servico.cod_servico}</span>
				</div>
				{servico.descr && <p className="text-sm leading-relaxed text-neutral-600">{servico.descr}</p>}
				<div className="flex flex-wrap items-center gap-2 text-sm text-neutral-700">
					<span className="font-semibold text-neutral-800">Nota média</span>
					<span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
						{notaMedia !== null ? notaMedia.toFixed(1) : "Sem avaliações"}
					</span>
				</div>
				<div className="grid gap-3 text-sm text-neutral-600 sm:grid-cols-2">
					<div>
						<p className="font-semibold text-neutral-800">Início</p>
						<p>{servico.inicio_servico ? formattedInicioDate : "--"}</p>
					</div>
					<div>
						<p className="font-semibold text-neutral-800">Conclusão</p>
						<p>{servico.fim_servico ? formattedFimDate : "Em andamento"}</p>
					</div>
				</div>
				<p className="text-xs text-neutral-400">Ocorrência vinculada: #{servico.cod_ocorrencia}</p>
			</div>
			<div className="mt-6 flex flex-wrap items-center justify-between gap-3">
				<button
					type="button"
					onClick={() => onShowOcorrencia(servico)}
					className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-400"
				>
					<FiEye className="h-4 w-4" />
					Ver ocorrência
				</button>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => onEdit(servico)}
						className="flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-lime-500 hover:text-lime-600"
					>
						<FiEdit2 className="h-4 w-4" />
						Editar
					</button>
					<button
						type="button"
						onClick={() => onDelete(servico)}
						className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-500 transition-colors hover:border-red-400 hover:text-red-600"
					>
						<FiTrash2 className="h-4 w-4" />
						Excluir
					</button>
				</div>
			</div>
		</div>
	);
};

export default ServicoCard;
