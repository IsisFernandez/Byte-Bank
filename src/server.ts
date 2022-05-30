import App from "./app";
import ClientController from "./controllers/ClientController";
const app = new App([new ClientController()]);
app.listen(8000);
