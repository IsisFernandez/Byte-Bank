import App from './app';
import ClientController from './controllers/ClientController';
const app = new App([new ClientController() ]);
//Só é possivel acessar pois listen é public
app.listen(8002); //se já estiver ocupada, usar outra