import * as http from 'http';
import {Server as HttpServer} from 'http';
import * as debug from 'debug';
import * as mongo from 'connect-mongo';
import * as session from 'express-session';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as logger from 'morgan';
import * as errorHandler from 'errorhandler';
import * as methodOverride from 'method-override';
import {IndexRoute} from './routes/index';
import {APP_CONFIGS} from './config';
import {MongoStoreFactory} from 'connect-mongo';

/**
 * The server.
 */
export class Server {

    public app: express.Application;
    public mongo: MongoStoreFactory;
    private httpServer: HttpServer;

    /**
     * Bootstrap the application.
     */
    public static bootstrap(): Server {
        return new Server();
    }

    /**
     * Constructor.
     */
    constructor() {
        // create express.js application
        this.app = express();

        // configure mongoDB
        this.configureDB();

        // configure application
        this.configureServer();

        // add routes
        this.configureRoutes();

        // add api
        this.configureApi();

        // http server
        this.startHttp();
    }

    public configureDB() {
        this.mongo = mongo(session);

        mongoose.connect(APP_CONFIGS.DB_URL, {
            useMongoClient: true,
        });

        mongoose.connection.on('connected', () => {
            console.log('Mongoose connection created!');
        });
        mongoose.connection.on('error', (err) => {
            console.log('Mongoose connection error: ' + err);
        });
        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose disconnected!');
        });
    }

    /**
     * Configure application
     */
    public configureServer() {
        this.app.set('port', APP_CONFIGS.HTTP_PORT);

        this.app.use(session({
                resave: true,
                saveUninitialized: true,
                secret: APP_CONFIGS.SECRET,
                store: new this.mongo({
                    url: APP_CONFIGS.DB_URL,
                    autoReconnect: true
                })
            })
        );

        // use logger middlware
        this.app.use(logger('dev'));

        // use json form parser middlware
        this.app.use(bodyParser.json());

        // use query string parser middlware
        this.app.use(bodyParser.urlencoded({
            extended: true
        }));

        // use cookie parser middleware
        this.app.use(cookieParser('SECRET_GOES_HERE'));

        // use override middlware
        this.app.use(methodOverride());

        // catch 404 and forward to error handler
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            err.status = 404;
            next(err);
        });

        // error handling
        this.app.use(errorHandler());
    }

    /**
     * Create router
     */
    public configureRoutes() {
        let router: express.Router;
        router = express.Router();

        // IndexRoute
        IndexRoute.create(router);

        // use router middleware
        this.app.use(router);
    }

    /**
     * Create REST API routes
     */
    public configureApi() {
        // empty for now
    }

    public startHttp() {
        this.httpServer = http.createServer(this.app);
        this.httpServer.listen(APP_CONFIGS.HTTP_PORT);
        this.httpServer.on('error', (error: any) => {
            if (error.syscall !== 'listen') {
                throw error;
            }
        });
        this.httpServer.on('listening', () => {
            const address = this.httpServer.address();
            const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + address.port;
            debug('express:server')('Listening on ' + bind);
        });
    }

}

Server.bootstrap();
