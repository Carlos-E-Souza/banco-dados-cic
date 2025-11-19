"use client";

import MenuCard from "../../components/MenuCard";
import Navbar from "../../components/Navbar";
import AppFooter from "../../components/AppFooter";
import { useUser } from "../../components/UserContext";

const funcionarioLinks = [
	{ href: "/ocorrencias/listar", label: "Listar Ocorrências", description: "Visualize todas as manifestações registradas e monitore seus status." },
];

const moradorLinks = [
	{ href: "/ocorrencias/cadastrar", label: "Cadastrar Ocorrência", description: "Relate uma nova manifestação e encaminhe rapidamente para análise." },
	{ href: "/ocorrencias/listar", label: "Listar Ocorrências", description: "Acompanhe as manifestações já enviadas, conferindo prazos e atualizações." },
];

const OcorrenciaMenuPage = () => {
	const { isFuncionario } = {isFuncionario: true}; // useUser();
	const links = isFuncionario ? funcionarioLinks : moradorLinks;

	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
				<Navbar
					links={links.map(({ href, label }) => ({ href, label }))}
				/>
				<main className="flex flex-1 justify-center px-6 py-16">
					<div className="w-full max-w-6xl space-y-12">
						<div className="space-y-4 text-center md:text-left">
							<h1 className="text-4xl font-semibold leading-tight text-neutral-900">
								Gestão de Ocorrências
							</h1>
							<p className="max-w-2xl text-lg text-neutral-600">
								Selecione uma opção para gerenciar as ocorrências.
							</p>
						</div>
						<div className="grid gap-6 md:grid-cols-2">
							{links.map(({ href, label, description }, index) => (
								<MenuCard
									key={href}
									title={label}
									description={description}
									href={href}
									accent={index % 2 === 0 ? "neutral" : "lime"}
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

export default OcorrenciaMenuPage;
