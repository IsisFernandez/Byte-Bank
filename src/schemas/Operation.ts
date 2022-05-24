import { model, Schema, Document } from "mongoose";

export interface OperationInterface extends Document { //Interface. É um contrato que todo o produto deve serguir
  //clausula
  remetente: number; //clausula
  destinatario: number;
  operacao: string;
  tipo: string;
  valor: number;
  creation: Date;
}

const OperationSchema = new Schema({
  remetente: {
    type: Number,
    required: [true, 'Destinatario é obrigatório']
  },
  destinatario: {
    type: Number,
    required: [true, 'Remetente é obrigatório']
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
    type: Date, 
    default: Date.now
  }
}); 

export default model<OperationInterface>('Operation', OperationSchema); 