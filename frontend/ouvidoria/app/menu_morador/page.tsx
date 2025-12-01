import AppFooter from "../../components/AppFooter";
import MenuCard from "../../components/MenuCard";
import Navbar from "../../components/Navbar";

const MenuMoradorPage = () => {
	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
				<Navbar
					links={[
						{ href: "/menu_morador/informacoes", label: "Minhas informações" },
						{ href: "/ocorrencias", label: "Ocorrências" },
					]}
					showLogout
				/>
				<main className="flex flex-1 justify-center px-6 py-16">
					<div className="w-full max-w-6xl space-y-12">
						<div className="space-y-4 text-center md:text-left">
							<h1 className="text-4xl font-semibold leading-tight text-neutral-900">
								Menu do Morador
							</h1>
							<p className="max-w-2xl text-lg text-neutral-600">
								Escolha uma das opções abaixo para atualizar seus dados ou acompanhar as manifestações registradas. Todas as informações ficam centralizadas em um único lugar.
							</p>
						</div>
						<div className="grid gap-6 md:grid-cols-2">
							<MenuCard
								title="Minhas informações"
								description="Revise seus dados pessoais, atualize endereço, e mantenha seu perfil sempre em dia."
								href="/menu_morador/informacoes"
								accent="neutral"
							/>
							<MenuCard
								title="Ocorrências"
								description="Acompanhe o status de cada ocorrência registrada, responda interações e visualize históricos."
								href="/ocorrencias"
								accent="lime"
							/>
						</div>
					</div>
				</main>
				<AppFooter />
			</div>
		</div>
	);
};

export default MenuMoradorPage;
