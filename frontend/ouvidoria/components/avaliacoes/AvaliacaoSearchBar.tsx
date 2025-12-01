type AvaliacaoSearchBarProps = {
	value: string;
	onChange: (value: string) => void;
};

const AvaliacaoSearchBar = ({ value, onChange }: AvaliacaoSearchBarProps) => (
	<label className="relative w-full max-w-md">
		<input
			type="text"
			value={value}
			onChange={(event) => onChange(event.target.value)}
			placeholder="Filtrar por nome do serviço"
			className="w-full rounded-full border border-neutral-300 px-5 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
		/>
		<span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
				<path d="m19 19-3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
				<path d="M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" />
			</svg>
		</span>
	</label>
);

export default AvaliacaoSearchBar;
