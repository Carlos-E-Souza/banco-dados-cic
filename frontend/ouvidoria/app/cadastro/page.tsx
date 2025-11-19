import AppFooter from "../../components/AppFooter";
import CadastroForm from "../../components/CadastroForm";
import Navbar from "../../components/Navbar";

const CadastroPage = () => {
	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
				<Navbar hideLinks />
				<main className="flex flex-1 items-center justify-center px-6 py-16">
					<div className="flex w-full max-w-6xl flex-col items-center gap-12 md:flex-row md:items-start md:justify-between">
						<div className="flex-1 space-y-4 text-center md:text-left">
							<h1 className="text-4xl font-semibold leading-tight text-neutral-900">
								Crie sua conta
							</h1>
							<p className="max-w-sm text-lg text-neutral-600">
								Cadastre-se para registrar ocorrências, acompanhar respostas e avaliar serviços.
							</p>
						</div>
						<div className="flex flex-1 justify-center md:justify-end">
							<div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
								<CadastroForm />
							</div>
						</div>
					</div>
				</main>
				<AppFooter />
			</div>
		</div>
	);
};

export default CadastroPage;
