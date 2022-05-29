//ISTO É UM API!!!
import "dotenv/config";
import { NextFunction, Request, Response } from "express";
import Client from "../schemas/Client";
import Operation from "../schemas/Operation";
import Controller from "./Controller";
import emailvalidator from "email-validator";
import Bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isBetween from "dayjs/plugin/isBetween.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import { validate } from "gerador-validador-cpf";
import parse from "telefone/parse";
//var passwordValidator = require('password-validator');

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

class ClientController extends Controller {
  //é preciso implementar os metodos da classe controller
  constructor() {
    super("/client"); //não consigo chegar a rota se ela não for iniciada
  }
  protected initRoutes(): void {
    //passe o caminho e o metodo para a rota
    //os verbos após router são os verbos do postman. Não pode ter a mesma rota para o mesmo verbo.
    this.router.get(this.path, this.list); //quero receber todos
    this.router.post(`${this.path}/register`, this.create);
    // this.router.get(`${this.path}/:id`, this.findById); //quero receber apenas um // Busca pelo ID
    this.router.put(`${this.path}/:id`, this.edit); //Edição pelo ID
    this.router.delete(`${this.path}/:id`, this.delete); // Exclusão pelo ID
    this.router.patch(`${this.path}/transferencia`, this.transfer);
    this.router.patch(`${this.path}/saque`, this.saque);
    this.router.patch(`${this.path}/deposito`, this.deposito);
    this.router.get(`${this.path}/login`, this.login);
    this.router.get(`${this.path}/extrato`, this.extrato);
    this.router.get(`/admin/login`, this.admin)
    this.router.get(`/adm/extratos`, this.extratos);
    this.router.get(`${this.path}/saldo`, this.saldo); //exibe apenas o saldo
    // this.router.get(http://localhost:8000/admin/login)
  }
  private async saldo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const cliente = await Client.findOne({ cpf: req.body.cpf }).select(
      "+senha"
    );
    if (!cliente) {
      return res.status(400).send({ error: "User not found" });
    }
    if (!(await Bcrypt.compareSync(req.body.senha, cliente.senha))) {
      return res.status(400).send({ error: "Invalid password" });
    }
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Acesso negado!" });
    }
    const secret = process.env.SECRET;
    if (jwt.verify(token, secret)) {
      const cliente = await Client.findOne({ cpf: req.body.cpf });
      return res.send({ valor: cliente.valor });
    } else {
      res.status(400).json({ msg: "token inválido!" });
    }
  }

<<<<<<< HEAD
  private async admin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const senhaAdmin = req.body.senhaAdmin;
    if(senhaAdmin === process.env.SENHAADMIN){
      const token = jwt.sign({ senha: senhaAdmin }, process.env.SECRET, {
        expiresIn: 86400, //24h
      });
      return res.send(token)
    }
  }

=======
>>>>>>> 737f12afdf5c9cbc315dfb81645fd02f1025a688
  private async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const cliente = await Client.findOne({ cpf: req.body.cpf }).select(
      "+senha"
    );
    const client = await Client.findOne({ cpf: req.body.cpf });

    if (!cliente) {
      return res.status(400).send({ error: "User not found" });
    }
    if (!(await Bcrypt.compareSync(req.body.senha, cliente.senha))) {
      return res.status(400).send({ error: "Invalid password" });
    }
    const token = jwt.sign({ cpf: cliente.cpf }, process.env.SECRET, {
<<<<<<< HEAD
      expiresIn: "4h", //24h TESTAR!
=======
      expiresIn: 86400, //24h
>>>>>>> 737f12afdf5c9cbc315dfb81645fd02f1025a688
    });
    return res.send({ client, token });
  }

  private async extratos(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    try {
      const id = req.body.id;
      const date = req.body.date;
      const dateFim = req.body.dateFim;
      const operador = req.body.operador;
      const fluxo = req.body.fluxo;
      const tipo = req.body.tipo;

      let dataFormata = "";
      let finalFormata = "";
      let dataDefault = "";
      if (date) {
        dataFormata = dayjs(date, "D/M/YYYY").format();
      }
      if (dateFim) {
        finalFormata = dayjs(dateFim, "D/M/YYYY").format();
      } else {
        dataDefault = dayjs(date, "D/M/YYYY").add(1, "day").format();
      }

      if (id) {
        const cliente = await Operation.findById(id);
        if (!cliente) {
          return res.status(400).send({ error: "Extrato não encontrado" });
        }
        return res.send(cliente);
      }

      if (date) {
        if (fluxo) {
          if (dateFim) {
            const cliente = await Operation.find({
              adm: { $gte: dataFormata, $lte: finalFormata },
              [fluxo]: { $exists: true },
            });
            return res.send(cliente);
          }
          const cliente = await Operation.find({
            adm: { $gte: dataFormata, $lte: dataDefault },
            [fluxo]: { $exists: true },
          });
          if (!cliente) {
            return res.status(400).send({ error: "Extrato não encontrado" });
          }
          return res.send(cliente);
        }
        if (tipo) {
          if (dateFim) {
            const cliente = await Operation.find({
              adm: { $gte: dataFormata, $lte: finalFormata },
              operacao: { $in: tipo },
            });
            return res.send(cliente);
          }
          const cliente = await Operation.find({
            adm: { $gte: dataFormata, $lte: dataDefault },
            operacao: { $in: tipo },
          });
          if (!cliente) {
            return res.status(400).send({ error: "Extrato não encontrado" });
          }
          return res.send(cliente);
        }

        if (dateFim) {
          const cliente = await Operation.find({
            adm: { $gte: dataFormata, $lte: finalFormata },
          });
          if (!cliente) {
            return res.status(400).send({ error: "Extrato não encontrado" });
          }
          return res.send(cliente);
        }
        if (operador == "menor") {
          const cliente = await Operation.find({ adm: { $lte: dataFormata } });
          if (!cliente) {
            return res.status(400).send({ error: "Extrato não encontrado" });
          }
          return res.send(cliente);
        }
        if (operador == "maior") {
          const cliente = await Operation.find({ adm: { $gte: dataFormata } });
          if (!cliente) {
            return res.status(400).send({ error: "Extrato não encontrado" });
          }
          return res.send(cliente);
        }
        const cliente = await Operation.find({
          adm: { $gte: dataFormata, $lte: dataDefault },
        });
        if (!cliente) {
          return res.status(400).send({ error: "Extrato não encontrado" });
        }
        return res.send(cliente);
      }
      if (fluxo) {
        const cliente = await Operation.find({ [fluxo]: { $exists: true } });
        if (!cliente) {
          return res.status(400).send({ error: "Extrato não encontrado" });
        }
        return res.send(cliente); //
      }
      if (tipo) {
        const cliente = await Operation.find({ operacao: { $in: tipo } });
        if (!cliente) {
          return res.status(400).send({ error: "Extrato não encontrado" });
        }
        return res.send(cliente);
      }
      const cliente = await Operation.find({});
      if (!cliente) {
        return res.status(400).send({ error: "Extrato não encontrado" });
      }
      return res.send(cliente);
    } catch (error) {
      return res.status(400).send({ error: error.message });
    }
  }

  private async extrato(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const cpf = req.body.cpf;
    const date = req.body.date;
    const ano = req.body.ano;
    const dateFim = req.body.dateFim;
    const operador = req.body.operador;

    const client = await Client.findOne({ cpf: cpf }).select("+senha");

    if (date == undefined && ano == undefined) {
      return res.send(client.extrato);
    }

    const retorno = [];

    if (date && operador) {
      let a = dayjs(date, "D M YYYY");
      if (operador == "antes") {
        client.extrato.forEach((element) => {
          if (
            dayjs(element.createdAt, "D/M/YYYY h:mm:ss A").isSameOrBefore(
              a,
              "day"
            )
          ) {
            retorno.push(element);
          }
        });
        return res.send(retorno);
      }
      if (operador == "depois") {
        client.extrato.forEach((element) => {
          if (
            dayjs(element.createdAt, "D/M/YYYY h:mm:ss A").isSameOrAfter(
              a,
              "day"
            )
          ) {
            retorno.push(element);
          }
        });
        return res.send(retorno);
      }
    }

    if (ano && operador) {
      let a = dayjs(ano, "YYYY");
      if (operador == "antes") {
        client.extrato.forEach((element) => {
          if (
            dayjs(element.createdAt, "D/M/YYYY h:mm:ss A").isSameOrBefore(
              a,
              "year"
            )
          ) {
            retorno.push(element);
          }
        });

        return res.send(retorno);
      }
      if (operador == "depois") {
        client.extrato.forEach((element) => {
          if (
            dayjs(element.createdAt, "D/M/YYYY h:mm:ss A").isSameOrAfter(
              a,
              "year"
            )
          ) {
            retorno.push(element);
          }
        });

        return res.send(retorno);
      }
    }

    if (date) {
      let a = dayjs(date, "D M YYYY");
      let b: any;
      if (dateFim) {
        b = dayjs(dateFim, "D M YYYY");
      } else {
        b = dayjs(date, "D M YYYY").add(1, "day");
      }
      client.extrato.forEach((element) => {
        if (dayjs(element.createdAt, "D/M/YYYY h:mm:ss A").isBetween(a, b)) {
          retorno.push(element);
        }
      });

      return res.send(retorno);
    }

    if (ano) {
      let a = dayjs(`01/01/${ano}`, "D M YYYY");
      let b: any;
      if (dateFim) {
        b = dayjs(`31/12/${dateFim}`, "D M YYYY");
      } else {
        b = dayjs(`31/12/${ano}`, "D M YYYY");
      }
      client.extrato.forEach((element) => {
        if (dayjs(element.createdAt, "D/M/YYYY h:mm:ss A").isBetween(a, b)) {
          retorno.push(element);
        }
      });

      return res.send(retorno);
    }

    return res.send(retorno);

    /* const client = await Client.findOne({cpf: cpf, "extrato.createdAt": {$month: date}}); // ERRO BEM AQUI, NÃO MEXER NA FUNÇÃO!

    return res.send(client.extrato); */
  }

  private async saque(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { cpf, valSaque } = req.body;
    const cliente = await Client.findOne({ cpf: cpf }).select("+senha");
    if (!cliente) {
      return res.status(400).send({ error: "User not found" });
    }
    if (!(await Bcrypt.compareSync(req.body.senha, cliente.senha))) {
      return res.status(400).send({ error: "Invalid password" });
    }
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Acesso negado!" });
    }
    const secret = process.env.SECRET;
    if (jwt.verify(token, secret)) {
      try {
        const operacao = await Operation.create({
          remetente: cpf,
          operacao: "saque",
          valor: valSaque,
        });

        operacao;

        const idOpe = operacao._id;
        const Date = operacao.creation;

        await Client.findOneAndUpdate(
          { cpf: cpf },
          {
            $inc: { valor: -valSaque },
            $push: {
              extrato: {
                idOperacao: idOpe,
                remetente: cpf,
                operacao: "saque",
                tipo: "saída",
                valor: valSaque,
                createdAt: Date,
              },
            },
          }
        );

        return res.send("Operação concluída");
      } catch (error) {
        return res.status(400).send(error);
      }
    } else {
      res.status(400).json({ msg: "token inválido!" });
    }
  }

  private async deposito(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { cpf, valDepo, senha } = req.body;
    const cliente = await Client.findOne({ cpf: cpf }).select("+senha");
    if (!cliente) {
      return res.status(400).send({ error: "User not found" });
    }
    if (!(await Bcrypt.compareSync(req.body.senha, cliente.senha))) {
      return res.status(400).send({ error: "Invalid password" });
    }
    const authHeader = req.headers.authorization;
    /*     const token = authHeader && authHeader.split(" ")[1] 

  if(!token) {
    console.log(authHeader)
    return res.status(401).json({msg: "Acesso negado!"})
  } */
    let cpfVerificado: string;
    const secret = process.env.SECRET;

    jwt.verify(authHeader, secret, function (err, decoded) {
      if (err) {
        return res.status(401).json({ msg: "Acesso negado!" });
      }
      cpfVerificado = decoded.cpf;
    });
    if (cpfVerificado != cpf) {
      return res.status(401).json({ msg: "Acesso negado!" });
    }

    try {
      const operacao = await Operation.create({
        remetente: cpf,
        operacao: "deposito",
        valor: valDepo,
      });

      operacao;

      const idOpe = operacao._id;
      const Date = operacao.creation;

      await Client.findOneAndUpdate(
        { cpf: cpf },
        {
          $inc: { valor: +valDepo },
          $push: {
            extrato: {
              idOperacao: idOpe,
              destinatario: cpf,
              operacao: "deposito",
              tipo: "entrada",
              valor: valDepo,
              createdAt: Date,
            },
          },
        }
      );

      return res.send("Operação concluida");
    } catch (error) {
      return res.status(400).send(error);
    }

    //return res.send("Operação concluida");//ISIS para testar o token
  }

  private async transfer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { remetente, destinatario, valtransferencia } = req.body;
    const envia = await Client.findOne({ cpf: remetente }).select("+senha");
    const recebe = await Client.findOne({ cpf: destinatario });
    if (!(await Bcrypt.compareSync(req.body.senha, envia.senha))) {
      return res.status(400).send({ error: "Invalid password" });
    }
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "Acesso negado!" });
    }

    const secret = process.env.SECRET;
    if (jwt.verify(token, secret)) {
      try {
        if (!envia) {
          return res
            .status(422)
            .json({
              error: "ID do remetente é obrigatório e tem que ser válido.",
            });
        }
        if (!recebe) {
          return res
            .status(422)
            .json({
              error: "ID do destinatário é obrigatório e tem que ser válido.",
            });
        }
        if (
          valtransferencia <= 0 ||
          isNaN(valtransferencia) ||
          valtransferencia > envia.valor
        ) {
          return res
            .status(422)
            .json({
              error:
                "Valor da transferência é obrigatório e tem que ser válido.",
            });
        }
        if (envia.cpf == recebe.cpf) {
          return res
            .status(422)
            .json({
              error:
                "A conta remetente e a conta destinatário não podem ser as mesmas.",
            });
        }

        await Client.updateOne(
          { cpf: remetente },
          { $inc: { valor: -valtransferencia } }
        ); //ISIS para testar o token
        await Client.updateOne(
          { cpf: destinatario },
          { $inc: { valor: +valtransferencia } }
        ); //ISIS para testar o token

        const operacao = await Operation.create({
          remetente: remetente,
          destinatario: destinatario,
          operacao: "transferência",
          valor: valtransferencia,
        });

        operacao;

        const idOpe = operacao._id;
        const Date = operacao.creation;

        // atualizar o saldo do remetente

        await Client.updateOne(
          { cpf: remetente },
          {
            $inc: { valor: -valtransferencia },
            $push: {
              extrato: {
                idOperacao: idOpe,
                remetente: remetente,
                destinatario: destinatario,
                operacao: "transferência",
                tipo: "saida",
                valor: valtransferencia,
                createdAt: Date,
              },
            },
          }
        );

        // atualizar o saldo do destinatário
        await Client.updateOne(
          { cpf: destinatario },
          {
            $inc: { valor: +valtransferencia },
            $push: {
              extrato: {
                idOperacao: idOpe,
                remetente: remetente,
                destinatario: destinatario,
                operacao: "transferência",
                tipo: "entrada",
                valor: valtransferencia,
                createdAt: Date,
              },
            },
          }
        );

        //operação concluida

        return res.send("Operação concluida");
      } catch (error) {
        return res.status(400).send(error);
      }
    } else {
      res.status(400).json({ msg: "token inválido!" });
    }
    //return res.send("Operação concluida")//ISIS para testar o token
  }

  private async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    //É uma promessa de resposta
    const client = await Client.find(); //Aguarde a resulução da busca
    return res.send(client); //fazendo a busca de todos os produtos (questão de coerencia)
  }

  private async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    // checar se o usuário já existe no sistema:
    const usuarioExiste = await Client.findOne({ cpf: req.body.cpf });
    if (usuarioExiste) {
      res.status(400).send("Usuário já cadastrado");
    } else {
      if (emailvalidator.validate(req.body.email)) {
        // Your call to model here      //estou devolvendo a criação
      } else {
        res.status(400).send("Invalid Email");
      }
      if (req.body.senha !== req.body.confirmesenha) {
        return res.status(422).json({ msg: "As senhas não são iguais" });
      }
      const cpf = req.body.cpf;
      const stringCPF = cpf.toString();
      if (!validate(stringCPF)) {
        return res.status(422).json({ msg: "CPF falso" });
      }
      const tel = req.body.telefone;
      if (!parse(tel, { apenasCelular: true })) {
        return res.status(422).json({ msg: "numero inválido" });
      }
      const client = await Client.create(req.body); //mandei criar o produto
      await Client.updateOne(
        { cpf: req.body.cpf },
        {
          senha: Bcrypt.hashSync(req.body.senha, 10),
        }
      );
    }
    return res.send("Operação concluida");
  }

  /* private async findById(req: Request, res: Response, next: NextFunction): Promise<Response> {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).send('Id Inválido');
    }

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).send('Produto não encontrado');
    }

    return res.send(client);
  } */
  private async edit(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { id } = req.params;
    await Client.findByIdAndUpdate(id, req.body);
    const client = await Client.findById(id);
    return res.send(client);
  }

  private async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { id } = req.params;
    const client = await Client.findById(id);
    client.deleteOne();
    return res.send(client);
  }
}

export default ClientController;
