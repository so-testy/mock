import env from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';

import router from './routes/index';

const app = express();
const server = http.createServer(app);

env.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);

const httpServer = server.listen(3000, function() {
    console.log('We are live on ', httpServer.address());
});
