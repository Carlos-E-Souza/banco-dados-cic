type DescriptionModalProps = {
	descricao: string | null;
	onClose: () => void;
};

const DescriptionModal = ({ descricao, onClose }: DescriptionModalProps) => {
	if (descricao === null) {
		return null;
	}

	const descriptionText = descricao.trim() ? descricao : "Nenhuma descrição informada para esta avaliação.";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
			<div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-8 shadow-2xl">
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
				<div className="space-y-4">
					<div>
						<h2 className="text-2xl font-semibold text-neutral-900">Observações do morador</h2>
						<p className="text-sm text-neutral-500">Feedback registrado na avaliação selecionada.</p>
					</div>
					<p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">{descriptionText}</p>
				</div>
			</div>
		</div>
	);
};

export default DescriptionModal;
