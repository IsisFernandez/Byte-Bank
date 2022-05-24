import { model, Schema, Document, Mixed } from "mongoose"; //minusculo = função; maiusculo = classe; 
//Importe apenas o que vai usar, esta é uma boa prática

//Como as informações serão recebidas
export interface ClientInterface extends Document { //Interface. É um contrato que todo o produto deve serguir
  name: string; //clausula
  sobrenome: string; //clausulaz
  cpf: number;
  email: string,
  senha: string,
  valor: number;
  extrato: Array<object>;
  creation: Date;
}

//como as informações serao gravadas no banco
const ClientSchema = new Schema({ 
  name: {
    type: String,
    required: [true, 'Nome é obrigatório']
  },
  sobrenome: {
    type: String,
    required: [true, 'Sobrenome é obrigatório']
  }, 
  cpf: {
    type: Number,
    unique: true,
    required: [true, 'cpf é requerido']
  },
  email: {
    type: String,
    required: [true, 'email é requerido']
  }, 
  senha: {
    
    type: String,
    required: [true, 'Senha é obrigatória']
  },
  valor: {
    type: Number, 
    //default: Date.now
  },
  extrato: {
    type: Array,
    default: []
  },
  creation: {
    type: Date, 
    default: Date.now
  }
}); 

export default model<ClientInterface>('Client', ClientSchema); //classe exportada como modelo