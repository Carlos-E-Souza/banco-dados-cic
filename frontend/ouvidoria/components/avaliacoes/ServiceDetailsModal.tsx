import { Servico } from "../servicos/types";

type ServiceDetailsModalProps = {
	servico: Servico | null;
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


const ServiceDetailsModal = ({ servico, onClose }: ServiceDetailsModalProps) => {
	if (!servico) {
		return null;
	}

	const formattedInicioDate = formatDate(servico.inicio_servico);
	const formattedFimDate = formatDate(servico.fim_servico);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="relative w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl">
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 rounded-full border border-neutral-200 p-2 text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
						<path d="m6 6 12 12" strokeLinecap="round" />
						<path d="m18 6-12 12" strokeLinecap="round" />
					</svg>
				</button>
				<div className="space-y-6">
					<div>
						<h2 className="text-2xl font-semibold text-neutral-900">Detalhes do serviço</h2>
						<p className="text-sm text-neutral-500">Informações vinculadas à avaliação selecionada.</p>
					</div>
					<div className="space-y-4 text-sm text-neutral-700">
						<div>
							<p className="font-semibold text-neutral-800">Nome</p>
							<p>{servico.nome || "Nome não informado"}</p>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<p className="font-semibold text-neutral-800">Órgão responsável</p>
								<p>{servico.orgao_nome || "Órgão não informado"}</p>
							</div>
							<div>
								<p className="font-semibold text-neutral-800">Ocorrência vinculada</p>
								<p>{servico.cod_ocorrencia ? `#${servico.cod_ocorrencia}` : "Não informado"}</p>
							</div>
						</div>
						<div className="grid gap-4 md:grid-cols-2">
							<div>
								<p className="font-semibold text-neutral-800">Início do serviço</p>
								<p>{formattedInicioDate}</p>
							</div>
							<div>
								<p className="font-semibold text-neutral-800">Conclusão</p>
								<p>{formattedFimDate}</p>
							</div>
						</div>
						<div>
							<p className="font-semibold text-neutral-800">Descrição</p>
							<p className="leading-relaxed text-neutral-600">
								{servico.descr?.trim() ? servico.descr : "Nenhuma descrição registrada para este serviço."}
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ServiceDetailsModal;
