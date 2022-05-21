import { model, Schema, Document } from "mongoose";

export interface OperationInterface extends Document { //Interface. É um contrato que todo o produto deve serguir
  //clausula
  remetente: number; //clausula
  destinataria: number; 
  //cpf: number;
  valtransferencia: number;
  creation: Date;
}

const OperationSchema = new Schema({ 
  remetente: {
    type: Number,
    unique: true,
    required: [true, 'Destinatario é obrigatório']
  },
  destinataria: {
    type: Number,
    required: [true, 'Remetente é obrigatório']
  }, 
 /* cpf: {
    type: Number,
    required: [true, 'cpf é requerido']
  },*/ creation: {
    type: Date, 
    default: Date.now
  }
}); 

export default model<OperationInterface>('Operation', OperationSchema); 