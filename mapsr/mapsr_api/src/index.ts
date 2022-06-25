import "reflect-metadata";
import { createConnection, getManager } from "typeorm";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import { Routes } from "./routes";
import * as cors from 'cors';
import config from "./configuration/config"
import auth from "./middlaware/auth";

// createConnection().then(async connection => {

// create express app
const app = express();
// app.use(express.urlencoded({ extended: true }))
app.use(cors()); //criar filtro de dominio

app.use(bodyParser.json({limit: '6000mb'}));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(auth);  //passa por ele antes das rotas
// register express routes from defined application routes
Routes.forEach(route => {
    (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
        const result = (new (route.controller as any))[route.action](req, res, next);
        if (result instanceof Promise) {
            // result.then(result => result !== null && result !== undefined ? res.send(result) : undefined);
            result.then(d => { //retorna erro
                if (d && d.status)
                    res.status(d.status).send(d.message || d.errors);
                else if (d && d.file)
                    res.sendFile(d.file)
                else
                    res.json(d);
            });
        } else if (result !== null && result !== undefined) {
            res.json(result);
        }
    });
});



app.listen(config.port, '0.0.0.0', async () => {
    console.log(`Api initilze in port ${config.port}`);
    try {
        await createConnection();

        console.log('Database connected');
        console.log(`Express server has started on port ${config.port}. Open http://localhost:${config.port} to see results`);
    } catch (error) {
        if (error == 'ER_DUP_ENTRY') {
            return { message: 'Dado duplicado não aceito' }
        }
        else {
            console.error('Data base not connected', error);
            return { message: 'Dado duplicado não aceito' }
        }

    }
});