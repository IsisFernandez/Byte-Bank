import { model, Schema, Document } from "mongoose";
import dayjs from "dayjs";

export interface OperationInterface extends Document { //Interface. É um contrato que todo o produto deve serguir
  //clausula
  remetente: number; //clausula
  destinatario: number;
  operacao: string;
  tipo: string;
  valor: number;
  creation: Date;
  adm: Date;
}

const OperationSchema = new Schema({
  remetente: {
    type: Number,
  },
  destinatario: {
    type: Number,
  }, 
  operacao: {
    type: String,
    required: [true, 'Operação é obrigatória']
  },
  valor: {
    type: Number,
    required: [true, 'Valor é obrigatório']
  },
  creation: {
    type: String, 
    default: dayjs().format("D/M/YYYY h:mm:ss A")
  },
  adm: {
    type: Date
  }
}); 

export default model<OperationInterface>('Operation', OperationSchema); 