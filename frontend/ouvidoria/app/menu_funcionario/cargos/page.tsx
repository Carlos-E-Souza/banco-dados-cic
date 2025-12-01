"use client";

import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import AppFooter from "../../../components/AppFooter";
import Navbar from "../../../components/Navbar";
import { useUser } from "../../../components/UserContext";
import CreateCargoModal from "../../../components/cargos/CreateCargoModal";
import DeleteCargoModal from "../../../components/cargos/DeleteCargoModal";
import EditCargoModal from "../../../components/cargos/EditCargoModal";
import { Cargo, CargoFormState } from "../../../components/cargos/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const emptyForm: CargoFormState = {
	nome: "",
	descricao: "",
};

const funcionarioLinks = [
	{ href: "/menu_funcionario", label: "Menu" },
];

const CargosPage = () => {
	const { isFuncionario } = useUser();
	const [cargos, setCargos] = useState<Cargo[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [editingCargo, setEditingCargo] = useState<Cargo | null>(null);
	const [deleteCandidate, setDeleteCandidate] = useState<Cargo | null>(null);
	const [formState, setFormState] = useState<CargoFormState>(emptyForm);
	const [createFormState, setCreateFormState] = useState<CargoFormState>(emptyForm);

	useEffect(() => {
		const controller = new AbortController();

		const fetchData = async () => {
			setIsLoading(true);
			setErrorMessage("");

			try {
				const response = await axios.get<Cargo[]>(`${API_BASE_URL}/cargos`, {
					signal: controller.signal,
				});
				setCargos(
					(response.data ?? []).map((item) => ({
						...item,
						descricao: item.descricao ?? "",
					}))
				);
			} catch (error) {
				if (!controller.signal.aborted) {
					if (axios.isAxiosError(error)) {
						setErrorMessage(error.response?.data?.message ?? "Não foi possível carregar os cargos.");
					} else {
						setErrorMessage("Erro inesperado ao carregar dados.");
					}
				}
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();

		return () => controller.abort();
	}, []);

	const filteredCargos = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) {
			return cargos;
		}
		return cargos.filter((cargo) =>
			cargo.nome.toLowerCase().includes(term) || (cargo.descricao ?? "").toLowerCase().includes(term)
		);
	}, [cargos, searchTerm]);

	const handleFieldChange = (field: keyof CargoFormState, value: string) => {
		setFormState((prev) => ({ ...prev, [field]: value }));
	};

	const handleCreateFieldChange = (field: keyof CargoFormState, value: string) => {
		setCreateFormState((prev) => ({ ...prev, [field]: value }));
	};

	const openCreateModal = () => {
		setIsCreateModalOpen(true);
		setCreateFormState(emptyForm);
		setErrorMessage("");
		setSuccessMessage("");
	};

	const closeCreateModal = () => {
		setIsCreateModalOpen(false);
		setCreateFormState(emptyForm);
	};

	const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		const payload = {
			nome: createFormState.nome,
			descricao: createFormState.descricao ? createFormState.descricao : null,
		};

		try {
			const response = await axios.post<Cargo>(`${API_BASE_URL}/cargos`, payload);
			const responseData = response.data;

			setCargos((prev) => {
				const newItem: Cargo = responseData
					? {
						...responseData,
						descricao: responseData.descricao ?? "",
					}
					: {
						cod_cargo: Math.max(0, ...prev.map((item) => item.cod_cargo)) + 1,
						nome: createFormState.nome,
						descricao: createFormState.descricao,
					};

				return [...prev, newItem];
			});

			setSuccessMessage("Cargo cadastrado com sucesso.");
			closeCreateModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível cadastrar o cargo.");
			} else {
				setErrorMessage("Erro inesperado ao cadastrar cargo.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const openEditModal = (cargo: Cargo) => {
		setEditingCargo(cargo);
		setFormState({
			nome: cargo.nome,
			descricao: cargo.descricao ?? "",
		});
		setErrorMessage("");
		setSuccessMessage("");
	};

	const closeEditModal = () => {
		setEditingCargo(null);
		setFormState(emptyForm);
	};

	const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingCargo) {
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			const payload = {
				nome: formState.nome,
				descricao: formState.descricao ? formState.descricao : null,
			};

			const response = await axios.put<Cargo>(`${API_BASE_URL}/cargos/${editingCargo.cod_cargo}`, payload);
			const responseData = response.data;

			setCargos((prev) =>
				prev.map((item) =>
					item.cod_cargo === editingCargo.cod_cargo
						? {
							...item,
							nome: responseData?.nome ?? formState.nome,
							descricao: responseData?.descricao ?? formState.descricao,
						}
						: item
				)
			);

			setSuccessMessage("Cargo atualizado com sucesso.");
			closeEditModal();
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível atualizar o cargo.");
			} else {
				setErrorMessage("Erro inesperado ao atualizar cargo.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const requestDeleteCargo = (cargo: Cargo) => {
		setDeleteCandidate(cargo);
		setErrorMessage("");
		setSuccessMessage("");
	};

	const handleDelete = async () => {
		if (!deleteCandidate) {
			return;
		}

		setIsSaving(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			await axios.delete(`${API_BASE_URL}/cargos/${deleteCandidate.cod_cargo}`);
			setCargos((prev) => prev.filter((item) => item.cod_cargo !== deleteCandidate.cod_cargo));
			setSuccessMessage("Cargo removido com sucesso.");
			setDeleteCandidate(null);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				setErrorMessage(error.response?.data?.message ?? "Não foi possível excluir o cargo.");
			} else {
				setErrorMessage("Erro inesperado ao excluir cargo.");
			}
		} finally {
			setIsSaving(false);
		}
	};

	const pageLinks = isFuncionario ? funcionarioLinks : undefined;

	return (
		<div className="min-h-screen bg-white text-neutral-900">
			<div className="flex min-h-screen flex-col">
				<Navbar links={pageLinks} />
				<main className="flex flex-1 justify-center px-6 py-16">
					<div className="w-full max-w-6xl space-y-10">
						<header className="space-y-4 text-center md:text-left">
							<h1 className="text-4xl font-semibold leading-tight text-neutral-900">Cargos cadastrados</h1>
							<p className="max-w-2xl text-lg text-neutral-600">
								Gerencie os cargos disponíveis no sistema. Utilize o filtro para encontrar rapidamente um cargo específico.
							</p>
						</header>
						<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
							<label className="relative w-full max-w-md">
								<input
									type="text"
									value={searchTerm}
									onChange={(event) => setSearchTerm(event.target.value)}
									placeholder="Filtrar por nome ou descrição"
									className="w-full rounded-full border border-neutral-300 px-5 py-3 text-sm text-neutral-900 transition-colors focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
								/>
								<span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-400">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
										<path d="m19 19-3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
										<path d="M10.5 17a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z" />
									</svg>
								</span>
							</label>
							<button
								type="button"
								onClick={openCreateModal}
								className="flex w-full items-center justify-center gap-2 rounded-full border border-lime-500 bg-lime-500 px-5 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-lime-400 md:w-auto"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.5"
									className="h-4 w-4"
								>
									<path d="M12 6v12" strokeLinecap="round" />
									<path d="M18 12H6" strokeLinecap="round" />
								</svg>
								<span>Adicionar cargo</span>
							</button>
						</div>
						{errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
						{successMessage && <p className="text-sm text-lime-600">{successMessage}</p>}
						<div className="overflow-hidden rounded-3xl border border-neutral-200 shadow-[0_20px_60px_rgba(17,24,39,0.08)]">
							<table className="min-w-full divide-y divide-neutral-200 text-sm">
								<thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
									<tr>
										<th className="px-6 py-4 text-left">Nome</th>
										<th className="px-6 py-4 text-left">Descrição</th>
										<th className="px-6 py-4 text-right">Ações</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-neutral-200 bg-white">
									{isLoading ? (
										<tr>
											<td colSpan={3} className="px-6 py-10 text-center text-neutral-500">
												Carregando cargos...
											</td>
										</tr>
									) : filteredCargos.length === 0 ? (
										<tr>
											<td colSpan={3} className="px-6 py-10 text-center text-neutral-500">
												Nenhum cargo encontrado.
											</td>
										</tr>
									) : (
										filteredCargos.map((cargo) => (
											<tr key={cargo.cod_cargo} className="transition-colors hover:bg-neutral-50">
												<td className="px-6 py-4 text-neutral-800">{cargo.nome}</td>
												<td className="px-6 py-4 text-neutral-600">
													{cargo.descricao ? cargo.descricao : "—"}
												</td>
												<td className="px-6 py-4">
													<div className="flex items-center justify-end gap-3">
														<button
															type="button"
															onClick={() => openEditModal(cargo)}
															className="rounded-full border border-neutral-300 p-2 text-neutral-600 transition-colors hover:border-lime-500 hover:text-lime-600"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="1.5"
																className="h-4 w-4"
															>
																<path d="M16.862 3.487a2.1 2.1 0 0 1 2.97 2.97l-9.05 9.05a4 4 0 0 1-1.69 1.01l-3.38.99.99-3.38a4 4 0 0 1 1.01-1.69l9.15-9.15Z" />
																<path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
															</svg>
														</button>
														<button
															type="button"
															onClick={() => requestDeleteCargo(cargo)}
															className="rounded-full border border-red-200 p-2 text-red-500 transition-colors hover:border-red-400 hover:text-red-600"
														>
															<svg
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="1.5"
																className="h-4 w-4"
															>
																<path d="M6 7h12" strokeLinecap="round" />
																<path d="M10 11v6" strokeLinecap="round" />
																<path d="M14 11v6" strokeLinecap="round" />
																<path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" strokeLinecap="round" />
																<path d="M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" strokeLinecap="round" strokeLinejoin="round" />
															</svg>
														</button>
													</div>
												</td>
											</tr>
										))
									)}
							</tbody>
						</table>
					</div>
				</div>
			</main>
			<AppFooter />
		</div>
		<CreateCargoModal
			isOpen={isCreateModalOpen}
			formState={createFormState}
			isSaving={isSaving}
			onClose={closeCreateModal}
			onSubmit={handleCreateSubmit}
			onChange={handleCreateFieldChange}
		/>
		<EditCargoModal
			cargo={editingCargo}
			formState={formState}
			isSaving={isSaving}
			onClose={closeEditModal}
			onSubmit={handleEditSubmit}
			onChange={handleFieldChange}
		/>
		<DeleteCargoModal
			cargo={deleteCandidate}
			isSaving={isSaving}
			onCancel={() => setDeleteCandidate(null)}
			onConfirm={handleDelete}
		/>
	</div>
	);
};

export default CargosPage;
