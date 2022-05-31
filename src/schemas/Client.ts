import { model, Schema, Document } from "mongoose";
import dayjs from "dayjs";

export interface ClientInterface extends Document {
  name: string;
  sobrenome: string;
  cpf: number;
  email: string;
  telefone: string;
  senha: string;
  valor: number;
  extrato: Array<any>;
  creation: Date;
}

const ClientSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Nome é obrigatório"],
    },
    sobrenome: {
      type: String,
      required: [true, "Sobrenome é obrigatório"],
    },
    cpf: {
      type: Number,
      unique: true,
      required: [true, "cpf é requerido"],
    },
    dataNascimento: {
      type: String,
      required: [true, "Data de nascimento é obrigatória"],
    },
    email: {
      type: String,
      required: [true, "email é requerido"],
    },
    telefone: {
      type: String,
      required: [true, "telefone é requerido"],
    },
    senha: {
      type: String,
      required: [true, "Senha é obrigatória"],
    },
    valor: {
      type: Number,
      //default: Date.now
    },
    extrato: {
      type: Array,
      default: [],
    },
    creation: {
      type: String,
      default: dayjs().format("D/M/YYYY h:mm:ss A"),
    },
  },
  {
    versionKey: false,
  }
);

export default model<ClientInterface>("Client", ClientSchema); //classe exportada como modelo
