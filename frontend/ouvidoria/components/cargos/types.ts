import { Cargo as BaseCargo } from "../funcionarios/types";

export type Cargo = BaseCargo;

export type CargoFormState = {
	nome: string;
	descricao: string;
};
