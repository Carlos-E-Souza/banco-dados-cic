import AppFooter from "../../components/AppFooter";
import MenuCard from "../../components/MenuCard";
import Navbar from "../../components/Navbar";

const AdminLinks = [
	{ href: "/menu_funcionario/funcionarios", label: "Funcionarios", description: "Gerencie os funcionarios." },
	{ href: "/menu_funcionario/cargos", label: "Cargos", description: "Defina, atualize e delete cargos." },
	{ href: "/menu_funcionario/orgaos_publicos", label: "Orgãos Publicos", description: "Atualize dados de órgãos e mantenha informações institucionais." },
	{ href: "/ocorrencias", label: "Ocorrências", description: "Acompanhe cada manifestação e resolva pendências rapidamente." },
	{ href: "/menu_funcionario/servicos", label: "Serviços", description: "Organize os serviços oferecidos." },
	{ href: "/menu_funcionario/avaliacoes", label: "Avaliações", description: "Monitore indicadores de satisfação dos cidadãos." },
];

const MenuFuncionarioPage = () => {
	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
				<Navbar links={AdminLinks.map(({ href, label }) => ({ href, label }))} showLogout/>
				<main className="flex flex-1 justify-center px-6 py-16">
					<div className="w-full max-w-6xl space-y-12">
						<div className="space-y-4 text-center md:text-left">
							<h1 className="text-4xl font-semibold leading-tight text-neutral-900">
								Painel do Funcionário
							</h1>
							<p className="max-w-2xl text-lg text-neutral-600">
								Centralize o trabalho operacional em um único lugar. Escolha uma das seções para administrar dados, serviços e ocorrências.
							</p>
						</div>
						<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
							{AdminLinks.map(({ href, label, description }, index) => (
								<MenuCard
									key={href}
									title={label}
									description={description}
									href={href}
									accent={index % 3 === 1 ? "lime" : index % 3 === 2 ? "dark" : "neutral"}
								/>
							))}
						</div>
					</div>
				</main>
				<AppFooter />
			</div>
		</div>
	);
};

export default MenuFuncionarioPage;
