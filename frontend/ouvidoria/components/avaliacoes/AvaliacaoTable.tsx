import { AvaliacaoDisplay } from "./types";

type AvaliacaoTableProps = {
	avaliacoes: AvaliacaoDisplay[];
	isLoading: boolean;
	onShowOcorrencia: (avaliacao: AvaliacaoDisplay) => void;
	onShowServico: (avaliacao: AvaliacaoDisplay) => void;
	onShowDescricao: (avaliacao: AvaliacaoDisplay) => void;
};

const AvaliacaoTable = ({ avaliacoes, isLoading, onShowOcorrencia, onShowServico, onShowDescricao }: AvaliacaoTableProps) => (
	<div className="overflow-hidden rounded-3xl border border-neutral-200 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
		<table className="min-w-full divide-y divide-neutral-200 text-sm">
			<thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
				<tr>
					<th className="px-6 py-4 text-left">Código</th>
					<th className="px-6 py-4 text-left">Serviço</th>
					<th className="px-6 py-4 text-left">Morador</th>
					<th className="px-6 py-4 text-center">Nota serviço</th>
					<th className="px-6 py-4 text-center">Nota tempo</th>
					<th className="px-6 py-4 text-right">Ações</th>
				</tr>
			</thead>
			<tbody className="divide-y divide-neutral-200 bg-white">
				{isLoading ? (
					<tr>
						<td colSpan={6} className="px-6 py-10 text-center text-neutral-500">
							Carregando avaliações...
						</td>
					</tr>
				) : avaliacoes.length === 0 ? (
					<tr>
						<td colSpan={6} className="px-6 py-10 text-center text-neutral-500">
							Nenhuma avaliação encontrada.
						</td>
					</tr>
				) : (
					avaliacoes.map((avaliacao) => (
						<tr key={avaliacao.cod_avaliacao} className="transition-colors hover:bg-neutral-50">
							<td className="px-6 py-4 text-neutral-800">{avaliacao.cod_avaliacao}</td>
							<td className="px-6 py-4 text-neutral-600">{avaliacao.servico_nome}</td>
							<td className="px-6 py-4 text-neutral-600">{avaliacao.morador_nome}</td>
							<td className="px-6 py-4 text-center text-neutral-800">{avaliacao.nota_servico}</td>
							<td className="px-6 py-4 text-center text-neutral-800">{avaliacao.nota_tempo}</td>
							<td className="px-6 py-4">
								<div className="flex items-center justify-end gap-3">
									<button
										type="button"
										onClick={() => onShowOcorrencia(avaliacao)}
										className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:border-lime-500 hover:text-lime-600"
									>
										Ocorrência
										</button>
									<button
										type="button"
										onClick={() => onShowServico(avaliacao)}
										className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:border-blue-500 hover:text-blue-600"
									>
										Serviço
										</button>
									<button
										type="button"
										onClick={() => onShowDescricao(avaliacao)}
										className="rounded-full border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-800"
									>
										Descrição
										</button>
								</div>
							</td>
						</tr>
					))
				)}
			</tbody>
		</table>
	</div>
);

export default AvaliacaoTable;
