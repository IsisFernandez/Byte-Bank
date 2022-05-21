import { model, Schema, Document } from "mongoose"; //minusculo = função; maiusculo = classe; 
//Importe apenas o que vai usar, esta é uma boa prática

//Como as informações serão recebidas
export interface ClientInterface extends Document { //Interface. É um contrato que todo o produto deve serguir
  name: string; //clausula
  sobrenome: string; //clausula
  cpf: number;
  valor: number;
  creation: Date;
}

//como as informações serao gravadas no banco
const ClientSchema = new Schema({ 
  name: {
    type: String,
    unique: true,
    required: [true, 'Nome é obrigatório']
  },
  sobrenome: {
    type: String,
    required: [true, 'Sobrenome é obrigatório']
  }, 
  cpf: {
    type: Number,
    required: [true, 'cpf é requerido']
  }, valor: {
    type: Number, 
    //default: Date.now
  }, creation: {
    type: Date, 
    default: Date.now
  }
}); 

export default model<ClientInterface>('Client', ClientSchema); //classe exportada como modelo