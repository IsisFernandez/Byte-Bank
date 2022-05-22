//ISTO É UM API!!!

import {NextFunction, Request, Response} from 'express'
import Client from '../schemas/Client';
import Operation from '../schemas/Operation'
import Controller from "./Controller";
import {isObjectIdOrHexString, Types} from 'mongoose';

class ClientController extends Controller { //é preciso implementar os metodos da classe controller
  constructor() {
    super('/client'); //não consigo chegar a rota se ela não for iniciada
  }
  protected initRoutes(): void {
    //passe o caminho e o metodo para a rota
    //os verbos após router são os verbos do postman. Não pode ter a mesma rota para o mesmo verbo. 
    this.router.get(this.path, this.list); //quero receber todos
    this.router.post(this.path, this.create);
    this.router.get(`${this.path}/:id`, this.findById); //quero receber apenas um // Busca pelo ID
    this.router.put(`${this.path}/:id`, this.edit); //Edição pelo ID
    this.router.delete(`${this.path}/:id`, this.delete); // Exclusão pelo ID
    //this.router.post(`${this.path}/transfer`, this.transfer);
    this.router.put(`${this.path}/`, this.transfer); 
  }

  private async transfer(req: Request, res: Response, next: NextFunction): Promise<Response> {
    const { remetente, destinataria, valtransferencia } = req.body;
    if (!remetente) {
      return res.status(422).json({ error: "Remetente é obrigatório" });
    } if(!destinataria) {
      return res.status(422).json({ error: "Destinatário é obrigatório" });
    } if (!valtransferencia){
      return res.status(422).json({ error: "Valor da transferencia é obrigatório" });
    }
    if (remetente == destinataria) {
      return res.status(422).json({ error: "A conta remetente e a conta destinatário não podem ser as mesmas." });
    }
    // atualizar o saldo do remetente

    await Client.updateOne({cpf: [destinataria]}, { $inc: { valor: +valtransferencia } });

    // atualizar o saldo do destinatário
    await Client.updateOne({cpf: [remetente]}, { $inc: { valor: -valtransferencia } });
        
    //operação concluida
    
    return res.send("Operação concluida");
  }



  /*private async trans(req: Request, res: Response, next: NextFunction): Promise<Response> {
    const { remetente, destinatario, valtransferencia } = req.body;
    if (!remetente || !destinatario || !valtransferencia) {
      return res.status(422).json({ error: "please add all the fields" });
    } else if (remetente == destinatario) {
      return res.status(422).json({ error: "please select different Client" });
    }
    Client.findOne({ cpf: remetente }).then((remetenteClient) => {
      Client.findOne({ cpf: destinatario }).then((destinatarioClient) => {
        if (remetenteClient.valor < valtransferencia) {
          return res.status(422).json({ error: "Insufficient Balance" });
        } else {
          let remetentevaltransferencia = remetenteClient.valor - parseInt(valtransferencia);
          let destinatariovaltransferencia = destinatarioClient.valor + parseInt(valtransferencia);
  
          Client.findOneAndUpdate(
            { cpf: remetente },
            { balance: remetentevaltransferencia },
            { new: true }
          ).exec((error, result) => {
            if (error) {
              return res.status(422).json({ error: "err at remetente" });
            }
          });
  
          Client.findOneAndUpdate(
            { cpf: destinatario },
            { balance: destinatariovaltransferencia },
            { new: true }
          ).exec((error, result) => {
            if (error) {
              return res.status(422).json({ error: "err at destinatario" });
            }
          });
  
          const newtransfer = new Operation ({
            remetente,
            destinatario,
            valtransferencia,
            date: Date.now(),
          });
          newtransfer
            .save()
            .then((Operation) => {
              res.json({ message: "transacted successfully" });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      });
    });
  }*/

  private async list (req: Request, res: Response, next: NextFunction): Promise<Response> { //É uma promessa de resposta
    const client = await Client.find(); //Aguarde a resulução da busca
    return res.send(client); //fazendo a busca de todos os produtos (questão de coerencia)
  }

  private async create(req: Request, res: Response, next: NextFunction): Promise<Response> {
    const client = await Client.create(req.body); //mandei criar o produto
    return res.send(client); //estou devolvendo a criação
}

  private async findById(req: Request, res: Response, next: NextFunction): Promise<Response> {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).send('Id Inválido');
    }

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).send('Produto não encontrado');
    }

    return res.send(client);
  }
  private async edit(req: Request, res: Response, next: NextFunction): Promise<Response> {
    const { id } = req.params;
    await Client.findByIdAndUpdate(id, req.body);
    const client = await Client.findById(id);
    return res.send(client);
  }

  private async delete(req: Request, res: Response, next: NextFunction): Promise<Response> {
    const { id } = req.params;
    const client = await Client.findById(id);
    client.deleteOne();
    return res.send(client);
  }
}


export default ClientController;