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

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

let status: number;

class ClientController extends Controller {
  constructor() {
    super("/client");
  }
  protected initRoutes(): void {
    this.router.get("/", this.list);
    this.router.post(`${this.path}/register`, this.create);
    this.router.patch(`${this.path}/transferencia`, this.transfer);
    this.router.patch(`${this.path}/saque`, this.saque);
    this.router.patch(`${this.path}/deposito`, this.deposito);
    this.router.post(`${this.path}/login`, this.login);
    this.router.patch(`${this.path}/extrato`, this.extrato);
    this.router.post(`/adm/login`, this.admin);
    this.router.post(`/adm/extratos`, this.extratos);
    this.router.patch(`${this.path}/saldo`, this.saldo);
  }

  private async saldo(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { cpf, senha } = req.body;
    const cliente = await Client.findOne({ cpf }).select("+senha");

    try {
      const authHeader = req.headers.authorization;
      let cpfVerificado: string;

      if (!authHeader) {
        status = 401;
        throw new Error("Não autorizado");
      }

      if (!cliente) {
        status = 400;
        throw new Error("Usuário não encontrado");
      }

      if (!(await Bcrypt.compareSync(senha, cliente.senha))) {
        status = 401;
        throw new Error("Senha inválida");
      }

      jwt.verify(
        authHeader,
        process.env.SECRET,
        function (err: any, decoded: any) {
          if (err) {
            status = 401;
            throw new Error("Token inválido!");
          }
          cpfVerificado = decoded.cpf;
        }
      );

      if (cpfVerificado != cpf) {
        status = 401;
        throw new Error("CPF inválido para esse token!");
      }

      if (typeof cpf != "number") {
        status = 401;
        throw new Error("CPF tem que ser um número!");
      }
      return res.send({
        valor: cliente.valor,
        "Ultima alteração":
          cliente.extrato[cliente.extrato.length - 1].createdAt,
      });
    } catch (error) {
      res.status(status);
      return res.send(error.message);
    }
  }

  private async admin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const senhaAdm = req.body.senhaAdm;

    try {
      if (!Bcrypt.compareSync(req.body.senhaAdm, process.env.SENHA_ADM)) {
        status = 401;
        throw new Error("Senha inválida");
      }

      const token = jwt.sign({ senhaAdm: senhaAdm }, process.env.SECRET_ADM, {
        expiresIn: "4h",
      });
      return res.send({ token });
    } catch (error) {
      res.status(status);
      return res.send(error.message);
    }
  }

  private async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const cliente = await Client.findOne({ cpf: req.body.cpf }).select(
      "+senha"
    );
    const client = await Client.findOne(
      { cpf: req.body.cpf },
      "-senha -extrato -valor"
    );

    try {
      if (!cliente) {
        status = 400;
        throw new Error("Usuário não encontrado");
      }

      if (!Bcrypt.compareSync(req.body.senha, cliente.senha)) {
        status = 401;
        throw new Error("Senha inválida");
      }

      const token = jwt.sign({ cpf: cliente.cpf }, process.env.SECRET, {
        expiresIn: "1h",
      });

      if (!token) {
        status = 503;
        throw new Error("Token não foi gerado, erro inesperado :/");
      }

      return res.send({ client, token });
    } catch (error) {
      res.status(status);
      return res.send(error.message);
    }
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

      const authHeader = req.headers.authorization;
      let senhaVerificada: string;

      jwt.verify(
        authHeader,
        process.env.SECRET_ADM,
        function (err: any, decoded: any) {
          if (err) {
            status = 401;
            throw new Error("Token inválido!");
          }
          senhaVerificada = decoded.senhaAdm;
        }
      );

      if (!authHeader) {
        status = 401;
        throw new Error("Não autorizado");
      }

      if (!Bcrypt.compareSync(senhaVerificada, process.env.SENHA_ADM)) {
        console.log(senhaVerificada, process.env.SENHA_ADM);
        status = 401;
        throw new Error("Senha invalida para esse token!");
      }

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
          status = 400;
          throw new Error("Extrato não encontrado");
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

            if (!cliente) {
              status = 400;
              throw new Error("Extrato não encontrado");
            }
            return res.send(cliente);
          }
          const cliente = await Operation.find({
            adm: { $gte: dataFormata, $lte: dataDefault },
            [fluxo]: { $exists: true },
          });
          if (!cliente) {
            status = 400;
            throw new Error("Extrato não encontrado");
          }
          return res.send(cliente);
        }
        if (tipo) {
          if (dateFim) {
            const cliente = await Operation.find({
              adm: { $gte: dataFormata, $lte: finalFormata },
              operacao: { $in: tipo },
            });

            if (!cliente) {
              status = 400;
              throw new Error("Extrato não encontrado");
            }

            return res.send(cliente);
          }

          const cliente = await Operation.find({
            adm: { $gte: dataFormata, $lte: dataDefault },
            operacao: { $in: tipo },
          });
          if (!cliente) {
            status = 400;
            throw new Error("Extrato não encontrado");
          }

          return res.send(cliente);
        }

        if (dateFim) {
          const cliente = await Operation.find({
            adm: { $gte: dataFormata, $lte: finalFormata },
          });
          if (!cliente) {
            status = 400;
            throw new Error("Extrato não encontrado");
          }

          return res.send(cliente);
        }
        if (operador == "menor") {
          const cliente = await Operation.find({ adm: { $lte: dataFormata } });
          if (!cliente) {
            status = 400;
            throw new Error("Extrato não encontrado");
          }

          return res.send(cliente);
        }
        if (operador == "maior") {
          const cliente = await Operation.find({ adm: { $gte: dataFormata } });
          if (!cliente) {
            status = 400;
            throw new Error("Extrato não encontrado");
          }
          return res.send(cliente);
        }
        const cliente = await Operation.find({
          adm: { $gte: dataFormata, $lte: dataDefault },
        });
        if (!cliente) {
          status = 400;
          throw new Error("Extrato não encontrado");
        }
        return res.send(cliente);
      }
      if (fluxo) {
        const cliente = await Operation.find({ [fluxo]: { $exists: true } });
        if (!cliente) {
          status = 400;
          throw new Error("Extrato não encontrado");
        }
        return res.send(cliente); //
      }
      if (tipo) {
        const cliente = await Operation.find({ operacao: { $in: tipo } });
        if (!cliente) {
          status = 400;
          throw new Error("Extrato não encontrado");
        }
        return res.send(cliente);
      }

      const cliente = await Operation.find({});
      if (!cliente) {
        status = 400;
        throw new Error("Extrato não encontrado");
      }

      return res.send(cliente);
    } catch (error) {
      res.status(status || 400);
      return res.send(error.message);
    }
  }

  private async extrato(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { cpf, date, ano, dateFim, operador, senha } = req.body;

    try {
      const authHeader = req.headers.authorization;
      let cpfVerificado: string;

      if (!authHeader) {
        status = 401;
        throw new Error("Não autorizado");
      }

      const cliente = await Client.findOne({ cpf: cpf }).select("+senha");

      if (!cliente) {
        status = 400;
        throw new Error("Cliente não encontrado");
      }

      jwt.verify(
        authHeader,
        process.env.SECRET,
        function (err: any, decoded: any) {
          if (err) {
            status = 401;
            throw new Error("Token inválido!");
          }
          cpfVerificado = decoded.cpf;
        }
      );

      if (cpfVerificado != cpf) {
        status = 401;
        throw new Error("CPF inválido para esse token!");
      }

      if (isNaN(cpf)) {
        status = 401;
        throw new Error("CPF tem que ser um número!");
      }

      if (!(await Bcrypt.compareSync(senha, cliente.senha))) {
        status = 401;
        throw new Error("Senha inválida!");
      }

      if (date == undefined && ano == undefined) {
        if (!cliente.extrato) {
          status = 400;
          throw new Error("Extrato não encontrado");
        }

        return res.send(cliente.extrato);
      }

      const retorno = [];

      if (date && operador) {
        if (!dayjs(date, "D M YYYY").isValid()) {
          status = 400;
          throw new Error("Data inválida");
        }
        let a = dayjs(date, "D M YYYY");
        if (operador == "antes") {
          cliente.extrato.forEach((element) => {
            if (
              dayjs(element.createdAt, "D/M/YYYY h:mm:ss A").isSameOrBefore(
                a,
                "day"
              )
            ) {
              retorno.push(element);
            }
          });
          if (retorno.length == 0) {
            status = 400;
            throw new Error("Extrato não encontrado");
          }
          return res.send(retorno);
        }
        if (operador == "depois") {
          cliente.extrato.forEach((element) => {
            if (
              dayjs(element.createdAt, "D/M/YYYY h:mm:ss A").isSameOrAfter(
                a,
                "day"
              )
            ) {
              retorno.push(element);
            }
          });
          if (retorno.length == 0) {
            status = 400;
            throw new Error("Extrato não encontrado");
          }
          return res.send(retorno);
        } else {
          status = 400;
          throw new Error("Operador inválido");
        }
      }

      if (ano && operador) {
        if (!dayjs(ano, "YYYY").isValid()) {
          status = 400;
          throw new Error("Ano inválido");
        }
        let a = dayjs(ano, "YYYY");
        if (operador == "antes") {
          cliente.extrato.forEach((element) => {
            if (
              dayjs(element.createdAt, "D/M/YYYY h:mm:ss A").isSameOrBefore(
                a,
                "year"
              )
            ) {
              retorno.push(element);
            }
          });
          if (retorno.length == 0) {
            status = 400;
            throw new Error("Extrato não encontrado");
          }

          return res.send(retorno);
        }
        if (operador == "depois") {
          cliente.extrato.forEach((element) => {
            if (
              dayjs(element.createdAt, "D/M/YYYY h:mm:ss A").isSameOrAfter(
                a,
                "year"
              )
            ) {
              retorno.push(element);
            }
          });

          if (retorno.length == 0) {
            status = 400;
            throw new Error("Extrato não encontrado");
          }

          return res.send(retorno);
        } else {
          status = 400;
          throw new Error("Operador inválido");
        }
      }

      if (date) {
        if (!dayjs(date, "D M YYYY").isValid()) {
          status = 400;
          throw new Error("Data inválida");
        }

        let a = dayjs(date, "D M YYYY");
        let b: any;
        if (dateFim) {
          if (!dayjs(dateFim, "D M YYYY").isValid()) {
            status = 400;
            throw new Error("Data inválida");
          }

          b = dayjs(dateFim, "D M YYYY");
        } else {
          if (!dayjs(date, "D M YYYY").isValid()) {
            status = 400;
            throw new Error("Data inválida");
          }

          b = dayjs(date, "D M YYYY").add(1, "day");
        }
        cliente.extrato.forEach((element) => {
          if (dayjs(element.createdAt, "D/M/YYYY h:mm:ss A").isBetween(a, b)) {
            retorno.push(element);
          }
        });
        if (retorno.length == 0) {
          status = 400;
          throw new Error("Extrato não encontrado");
        }

        return res.send(retorno);
      }

      if (ano) {
        if (!dayjs(ano, "YYYY").isValid()) {
          status = 400;
          throw new Error("Ano inválido");
        }

        let a = dayjs(`01/01/${ano}`, "D M YYYY");
        let b: any;
        if (dateFim) {
          if (!dayjs(dateFim, "D M YYYY").isValid()) {
            status = 400;
            throw new Error("Data inválida");
          }

          b = dayjs(`31/12/${dateFim}`, "D M YYYY");
        } else {
          if (!dayjs(ano, "YYYY").isValid()) {
            status = 400;
            throw new Error("Ano inválido");
          }

          b = dayjs(`31/12/${ano}`, "D M YYYY");
        }
        cliente.extrato.forEach((element) => {
          if (dayjs(element.createdAt, "D/M/YYYY h:mm:ss A").isBetween(a, b)) {
            retorno.push(element);
          }
        });
        if (retorno.length == 0) {
          status = 400;
          throw new Error("Extrato não encontrado");
        }

        return res.send(retorno);
      }

      if (retorno.length == 0) {
        status = 400;
        throw new Error("Nenhum extrato encontrado");
      }

      return res.send(retorno);
    } catch (error) {
      status = status || 400;
      return res.send(error.message);
    }
  }

  private async saque(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    let { cpf, valSaque, senha } = req.body;

    const cliente = await Client.findOne({ cpf: cpf });

    try {
      if (!cliente) {
        status = 400;
        throw new Error("Usuário não encontrado!");
      }

      const authHeader = req.headers.authorization;
      let cpfVerificado: string;

      jwt.verify(
        authHeader,
        process.env.SECRET,
        function (err: any, decoded: any) {
          if (err) {
            status = 401;
            throw new Error("Token inválido!");
          }
          cpfVerificado = decoded.cpf;
        }
      );
      if (cpfVerificado != cpf) {
        status = 401;
        throw new Error("CPF inválido para esse token!");
      }

      if (isNaN(cpf)) {
        status = 401;
        throw new Error("CPF tem que ser um número!");
      }

      if (!(await Bcrypt.compareSync(senha, cliente.senha))) {
        status = 401;
        throw new Error("Senha inválida!");
      }

      if (
        !Number.isFinite(valSaque) ||
        valSaque <= 0 ||
        valSaque > cliente.valor
      ) {
        status = 401;
        throw new Error("Valor inválido!");
      }

      valSaque = +valSaque.toFixed(2);

      const operacao = await Operation.create({
        remetente: cpf,
        operacao: "saque",
        valor: +valSaque,
      });

      if (!operacao) {
        status = 400;
        throw new Error("Operação não realizada!");
      }

      const idOpe = operacao._id;
      const Date = operacao.creation;

      await Client.findOneAndUpdate(
        { cpf: cpf },
        {
          $inc: { valor: -valSaque },
          $push: {
            extrato: {
              idOperacao: idOpe,
              destinatario: cpf,
              operacao: "saque",
              tipo: "saída",
              valor: -valSaque,
              createdAt: Date,
            },
          },
        }
      );

      return res.send("Operação concluída");
    } catch (error) {
      res.status(status);
      return res.send(error.message);
    }
  }

  private async deposito(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    let { cpf, valDepo, senha } = req.body;

    const cliente = await Client.findOne({ cpf: cpf });

    try {
      if (!cliente) {
        status = 400;
        throw new Error("Usuário não encontrado!");
      }

      const authHeader = req.headers.authorization;
      let cpfVerificado: string;

      jwt.verify(
        authHeader,
        process.env.SECRET,
        function (err: any, decoded: any) {
          if (err) {
            status = 401;
            throw new Error("Token inválido!");
          }
          cpfVerificado = decoded.cpf;
        }
      );
      if (cpfVerificado != cpf) {
        status = 401;
        throw new Error("CPF inválido para esse token!");
      }

      if (isNaN(cpf)) {
        status = 401;
        throw new Error("CPF tem que ser um número!");
      }

      if (!(await Bcrypt.compareSync(senha, cliente.senha))) {
        status = 401;
        throw new Error("Senha inválida!");
      }

      if (!Number.isFinite(valDepo) || valDepo <= 0) {
        status = 401;
        throw new Error("Valor inválido!");
      }

      valDepo = +valDepo.toFixed(2);

      const operacao = await Operation.create({
        remetente: cpf,
        operacao: "deposito",
        valor: +valDepo,
      });

      if (!operacao) {
        status = 400;
        throw new Error("Operação não realizada!");
      }

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
              valor: +valDepo,
              createdAt: Date,
            },
          },
        }
      );

      return res.send("Operação concluída");
    } catch (error) {
      res.status(status);
      return res.send(error.message);
    }
  }

  private async transfer(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const { remetente, destinatario, senha } = req.body;
    let valTransferencia = req.body.valTransferencia;

    try {
      const envia = await Client.findOne({ cpf: remetente }).select("+senha");
      const recebe = await Client.findOne({ cpf: destinatario }).select(
        "+senha"
      );

      if (!envia) {
        status = 400;
        throw new Error("Remetente não encontrado!");
      }

      if (!recebe) {
        status = 400;
        throw new Error("Destinatário não encontrado!");
      }

      const authHeader = req.headers.authorization;
      let cpfVerificado: string;

      jwt.verify(
        authHeader,
        process.env.SECRET,
        function (err: any, decoded: any) {
          if (err) {
            status = 401;
            throw new Error("Token inválido!");
          }
          cpfVerificado = decoded.cpf;
        }
      );

      let senhaVerificada: number;

      if (cpfVerificado === remetente) {
        senhaVerificada = Bcrypt.compareSync(senha, envia.senha);
      } else {
        status = 401;
        throw new Error("CPF inválido para esse token!");
      }

      if (!senhaVerificada) {
        console.log(senhaVerificada);
        status = 401;
        throw new Error("Senha inválida!");
      }

      if (
        !Number.isFinite(valTransferencia) ||
        valTransferencia <= 0 ||
        valTransferencia > envia.valor
      ) {
        status = 401;
        throw new Error("Valor inválido!");
      }

      if (remetente === destinatario) {
        status = 401;
        throw new Error("CPF iguais!");
      }

      valTransferencia = +valTransferencia.toFixed(2);

      const valorRemete = await Client.updateOne(
        { cpf: remetente },
        { $inc: { valor: -valTransferencia } }
      );

      const valorDesti = await Client.updateOne(
        { cpf: destinatario },
        { $inc: { valor: +valTransferencia } }
      );

      if (!valorRemete || !valorDesti) {
        status = 400;
        throw new Error("Operação não realizada! Erro inesperado!");
      }

      const operacao = await Operation.create({
        remetente: remetente,
        destinatario: destinatario,
        operacao: "transferência",
        valor: valTransferencia,
      });

      if (!operacao) {
        status = 400;
        throw new Error("Operação não realizada! Erro inesperado.");
      }

      const idOpe = operacao._id;
      const Date = operacao.creation;

      const remetenteFinal = await Client.updateOne(
        { cpf: remetente },
        {
          $inc: { valor: -valTransferencia },
          $push: {
            extrato: {
              idOperacao: idOpe,
              remetente: remetente,
              destinatario: destinatario,
              operacao: "transferência",
              tipo: "saida",
              valor: valTransferencia,
              createdAt: Date,
            },
          },
        }
      );

      const destinatarioFinal = await Client.updateOne(
        { cpf: destinatario },
        {
          $inc: { valor: +valTransferencia },
          $push: {
            extrato: {
              idOperacao: idOpe,
              remetente: remetente,
              destinatario: destinatario,
              operacao: "transferência",
              tipo: "entrada",
              valor: valTransferencia,
              createdAt: Date,
            },
          },
        }
      );

      if (!remetenteFinal || !destinatarioFinal) {
        status = 400;
        throw new Error("Operação não realizada! Erro inesperado.");
      }

      return res.send("Operação concluida");
    } catch (error) {
      status = status || 400;
      return res.send(error.message);
    }
  }

  private async list(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    return res.send("Seja bem vindo a API do banco 'Byte-Bank'!");
  }

  private async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response> {
    const {
      cpf,
      email,
      senha,
      confirmeSenha,
      dataNascimento,
      telefone,
      name,
      sobrenome,
    } = req.body;

    try {
      const usuarioExiste = await Client.findOne({ cpf: cpf });
      if (usuarioExiste) {
        status = 400;
        throw new Error("Usuário já existe!");
      }

      if (!name) {
        status = 400;
        throw new Error("Nome não informado!");
      }

      if (!sobrenome) {
        status = 400;
        throw new Error("Sobrenome não informado!");
      }

      if (!emailvalidator.validate(email)) {
        status = 400;
        throw new Error("Email inválido!");
      }

      const emailExiste = await Client.findOne({ email: email });

      if (emailExiste) {
        status = 400;
        throw new Error("Email já existe!");
      }

      if (!dayjs(dataNascimento, "D/M/YYYY").isValid()) {
        status = 401;
        throw new Error('Passe a data no formato: "D/M/YYYY"');
      }

      if (
        dayjs(dataNascimento, "D/M/YYYY").diff(
          dayjs().format("D/M/YYYY"),
          "year"
        ) < 18
      ) {
        status = 401;
        throw new Error("Usuário menor de idade!");
      }

      const dataNascimentoFormatada = dayjs(dataNascimento, "D/M/YYYY").format(
        "D/M/YYYY"
      );

      if (senha != confirmeSenha || senha.length < 8) {
        status = 401;
        throw new Error("Senhas não conferem ou senhas muito curtas!");
      }

      if (typeof cpf !== "number") {
        status = 401;
        throw new Error("CPF tem que ser um número!");
      }

      if (typeof name !== "string") {
        status = 401;
        throw new Error("Nome deve estar entre aspas duplas!");
      }

      if (typeof sobrenome !== "string") {
        status = 401;
        throw new Error("Sobrenome deve estar entre aspas duplas!");
      }

      if (typeof senha !== "string" || typeof confirmeSenha !== "string") {
        status = 401;
        throw new Error("Senhas devem ser fornecidas entre aspas duplas!");
      }

      if (typeof email !== "string") {
        status = 401;
        throw new Error("Email deve ser fornecido entre aspas duplas!");
      }

      if (typeof telefone !== "string") {
        console.log(telefone);
        status = 401;
        throw new Error("Telefone deve ser fornecido entre aspas duplas!");
      }

      const stringCPF = cpf.toString();

      if (!validate(stringCPF)) {
        status = 401;
        throw new Error("CPF inválido!");
      }

      if (
        !parse(telefone, {
          apenasCelular: true,
          apenasFixo: false,
          apenasDDD: [],
        })
      ) {
        status = 401;
        throw new Error('Telefone inválido! Formato aceito: "(99) 99999-9999"');
      }

      await Client.create(req.body);

      const cliente = await Client.updateOne(
        { cpf: cpf },
        {
          senha: Bcrypt.hashSync(senha, 10),
          dataNascimento: dataNascimentoFormatada,
        }
      );

      if (!cliente) {
        status = 400;
        throw new Error("Erro inesperado!");
      }

      return res.send("Operação concluída");
    } catch (error) {
      status = status || 400;
      return res.send(error.message);
    }
  }
}

export default ClientController;
