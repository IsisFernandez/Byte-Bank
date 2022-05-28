import { model, Schema, Document } from "mongoose"; //minusculo = função; maiusculo = classe;
//Importe apenas o que vai usar, esta é uma boa prática
import dayjs from "dayjs";

//Como as informações serão recebidas
export interface ClientInterface extends Document {
  //Interface. É um contrato que todo o produto deve serguir
  name: string; //clausula
  sobrenome: string; //clausulaz
  cpf: number;
  email: string;
  telefone: string;
  senha: string;
  valor: number;
  extrato: [{ createdAt: Date; operation: string; value: number }];
  creation: Date;
}

//como as informações serao gravadas no banco
const ClientSchema = new Schema({
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
});

export default model<ClientInterface>("Client", ClientSchema); //classe exportada como modelo
