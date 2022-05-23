import 'dotenv/config';
import  express  from 'express'; // app em node
import cors from 'cors'; // chamada de api nao dar erro
import mongoose from 'mongoose';
import Controller from './controllers/Controller';

class App { //classe
  public app: express.Application; //o tipo da propriedade. Application é uma propriedade dentro do express

  public constructor(controllers: Controller[]) { //quando essa clase for chamada, essa sera aprimeira coisa executada
    this.app = express(); //executado
    this.app.use(cors()); // executado

    this.initMongoose();
    this.connectDatabase();
    this.initExpressJson();
    this.initController(controllers); //nesse contexto, chame alguém chamado initController
  }

  private initMongoose(): void {
    mongoose.set('runValidators', true);
  }

  private connectDatabase(): void {
    mongoose.connect (
    `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}@${process.env.MONGO_DB_CLUSTER}/crud-nodejs?retryWrites=true&w=majority`);
  }

  private initExpressJson(): void {
    this.app.use(express.json());
  }

  private initController(controllers: Controller[]): void {
    controllers.forEach((controller) => {
      this.app.use('/', controller.router);
    })
  }

//se fosse private, só estaria acessível aqui. 
  public listen(port: number): void { // metodo listem. Parametro um valor chamado port do tipo numero. Ele n]ao vai ter retorno. 
    this.app.listen(port, () => { //vai deixar essa app pronta para receber requisição (ouvindo)
      console.log(`Application is running or port ${port}`); // para ter certeza 
    })
  }
}

export default App;