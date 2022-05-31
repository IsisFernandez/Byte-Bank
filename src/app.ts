import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Controller from "./controllers/Controller";
import swaggerUi from "swagger-ui-express";
import swaggerDocs from "../swagger.json";


class App {
  public app: express.Application;

  public constructor(controllers: Controller[]) {
    this.app = express();
    this.app.use(cors());

    this.initMongoose();
    this.connectDatabase();
    this.initExpressJson();
    this.initSwagger();
    this.initController(controllers);
  }

  private initMongoose(): void {
    mongoose.set("runValidators", true);
  }

  private connectDatabase(): void {
    mongoose.connect(
      `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}@${process.env.MONGO_DB_CLUSTER}/crud-nodejs?retryWrites=true&w=majority`
    );
  }

  private initExpressJson(): void {
    this.app.use(express.json());
  }

  private initController(controllers: Controller[]): void {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router);
    });
  }



  public initSwagger(): void {
    this.app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  }

  public listen(port: number): void {
    this.app.listen(port, () => {
      console.log(`Application is running or port ${port}`);
    });
  }
}

export default App;
