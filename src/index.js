import env from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';
import cors from 'cors';

import router from './routes/index';
import { initSocket } from './libs/socket';

const app = express();
const server = http.createServer(app);

env.config();
initSocket(server);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);

const httpServer = server.listen(3000, function() {
    console.log('We are live on ', httpServer.address());
});
