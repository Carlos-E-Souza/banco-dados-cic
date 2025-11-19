import { FiAlertTriangle } from "react-icons/fi";
import { Servico } from "./types";

type DeleteServicoModalProps = {
	servico: Servico | null;
	isSaving: boolean;
	onCancel: () => void;
	onConfirm: () => void;
};

const DeleteServicoModal = ({ servico, isSaving, onCancel, onConfirm }: DeleteServicoModalProps) => {
	if (!servico) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="w-full max-w-md space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-2xl">
				<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
					<FiAlertTriangle className="h-6 w-6" />
				</div>
				<h2 className="text-lg font-semibold text-neutral-900">Excluir serviço?</h2>
				<p className="text-sm text-neutral-600">
					Essa ação não pode ser desfeita. O serviço "{servico.nome}" será removido do sistema.
				</p>
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<button
						type="button"
						onClick={onCancel}
						className="rounded-full border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-400"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isSaving}
						className="rounded-full border border-red-400 bg-red-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
					>
						{isSaving ? "Excluindo..." : "Sim, excluir"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default DeleteServicoModal;
