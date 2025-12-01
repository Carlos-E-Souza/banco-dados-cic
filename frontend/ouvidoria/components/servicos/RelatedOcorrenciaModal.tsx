import { FiMapPin, FiTag, FiX } from "react-icons/fi";
import { Ocorrencia } from "../ocorrencias/types";

type RelatedOcorrenciaModalProps = {
	ocorrencia: Ocorrencia | null;
	onClose: () => void;
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


const RelatedOcorrenciaModal = ({ ocorrencia, onClose }: RelatedOcorrenciaModalProps) => {
	if (!ocorrencia) {
		return null;
	}

	const formattedDate = formatDate(ocorrencia.data);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl">
				<div className="flex items-center justify-between">
					<h2 className="text-2xl font-semibold text-neutral-900">Ocorrência vinculada</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-full border border-neutral-200 p-2 text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700"
					>
						<FiX className="h-4 w-4" />
					</button>
				</div>
				<div className="mt-6 space-y-5">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3 text-sm text-neutral-500">
							<FiTag className="h-4 w-4" />
							<span>#{ocorrencia.cod_oco}</span>
						</div>
						<span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">{ocorrencia.tipo_status}</span>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-semibold text-neutral-800">Tipo</p>
						<p className="text-neutral-600">{ocorrencia.tipo_nome}</p>
					</div>
					<div className="space-y-1 text-sm text-neutral-600">
						<p className="flex items-center gap-2 font-semibold text-neutral-800">
							<FiMapPin className="h-4 w-4" />
							Localização
						</p>
						<p>
							{[ocorrencia.endereco, ocorrencia.bairro, ocorrencia.cidade, ocorrencia.estado]
								.filter(Boolean)
								.join(" • ") || "Endereço não informado"}
						</p>
						<p>{ocorrencia.data ? formattedDate : "Data não informada"}</p>
					</div>
					{ocorrencia.descr && (
						<div className="space-y-1">
							<p className="text-sm font-semibold text-neutral-800">Descrição</p>
							<p className="text-sm leading-relaxed text-neutral-600">{ocorrencia.descr}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default RelatedOcorrenciaModal;
