# Byte-Bank

<!---Esses são exemplos. Veja https://shields.io para outras pessoas ou para personalizar este conjunto de escudos. Você pode querer incluir dependências, status do projeto e informações de licença aqui--->

![GitHub repo size](https://img.shields.io/github/repo-size/IsisFernandez/Byte-Bank?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/IsisFernandez/Byte-Bank?style=for-the-badge)
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" /> 
<img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" /> 


<!---<img src="exemplo-image.png" alt="exemplo imagem">--->

> Camada de API que simula operações bancárias, tais como saque, deposito, transferencia e extrato.
### Ajustes e melhorias

O projeto ainda está em desenvolvimento e as próximas atualizações serão voltadas nas seguintes tarefas:

- [ ] Deploy no Heroku
- [ ] Envio de email para confirmar a conta
- [ ] Transações disponíveis apenas após a confirmação da conta


## 💻 Pré-requisitos

Antes de começar, verifique se você atendeu aos seguintes requisitos:
<!---Estes são apenas requisitos de exemplo. Adicionar, duplicar ou remover conforme necessário--->
* Você instalou a versão mais recente de `<TypeScript, nodejs, express>`.
* Você tem uma máquina `<Windows / Linux / Mac>`. 

## 🚀 Instalando Byte-Bank

Para instalar o Byte-Bank, siga estas etapas depois de ter baixado o arquivo e estar rodando no VS code:

<!---Linux e macOS:
```
npm i
npm i -D
```

Windows:--->
```
npm i
npm i - D
```

## ☕ Usando Byte-Bank

Para usar Byte-Bank, siga estas etapas:


/client/saldo: 
```
{
  "cpf": Number
  "senha": String
}

```
/adm/login 
``` 
{
  "senhaAdm": String
}
```
/client/login 
``` 
{
  "cpf": Number,
  "senha": String
}
```
/adm/extratos 
```
{
  "id": String (opcional),
  "date": String (opcional),
  "dateFim": String (opcional),
  "operador": String (opcional),
  "fluxo": String (opcional),
  "tipo": String (opcional)
}
```
/client/extrato 
``` 
{
  "cpf": Number,
  "senha": String,
  "date": String (opcional),
  "dateFim": String (opcional),
  "ano": Number (opcional),
  "operador": String (opcional)
}
```
/client/saque 
``` 
{
  "cpf": Number,
  "senha": String,
  "valSaque": Number
}
```
/client/deposito 
``` 
{
  "cpf": Number,
  "senha": String,
  "valDepo": Number
}
```
/client/transferencia 
```
{
  "remetente": Number,
  "destinatario": Number,
  "valTransferencia": Number,
  "senha": String
}
```
/ 
```
{
}
```
/client/register 
```
{
  "cpf": Number,
  "senha": String,
  "confirmeSenha": String,
  "email": String,
  "name": String,
  "sobrenome": String,
  "dataNascimento": String,
  "telefone": String
}
```

<!---Adicione comandos de execução e exemplos que você acha que os usuários acharão úteis. Fornece uma referência de opções para pontos de bônus!--->

<!---## 📫 Contribuindo para <nome_do_projeto>
Se o seu README for longo ou se você tiver algum processo ou etapas específicas que deseja que os contribuidores sigam, considere a criação de um arquivo CONTRIBUTING.md separado
Para contribuir com <nome_do_projeto>, siga estas etapas:

1. Bifurque este repositório.
2. Crie um branch: `git checkout -b <nome_branch>`.
3. Faça suas alterações e confirme-as: `git commit -m '<mensagem_commit>'`
4. Envie para o branch original: `git push origin <nome_do_projeto> / <local>`
5. Crie a solicitação de pull.

Como alternativa, consulte a documentação do GitHub em [como criar uma solicitação pull](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/creating-a-pull-request).
--->
## 🤝 Colaboradores

Agradecemos às seguintes pessoas que contribuíram para este projeto:

[Giovannne Berteli Comba](https://github.com/hethus) 

[Isis Fernandez](https://github.com/IsisFernandez)


<!---## 😄 Seja um dos contribuidores<br>

Quer fazer parte desse projeto? Clique [AQUI](CONTRIBUTING.md) e leia como contribuir.

## 📝 Licença

Esse projeto está sob licença. Veja o arquivo [LICENÇA](LICENSE.md) para mais detalhes.--->

[⬆ Voltar ao topo](#nome-do-projeto)<br>
