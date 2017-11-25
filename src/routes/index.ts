import {NextFunction, Request, Response, Router} from 'express';
import {default as User} from '../models/user.model';

/**
 * / route
 *
 * @class User
 */
export class IndexRoute {

    /**
     * Create the routes.
     */
    public static create(router: Router) {
        //log
        console.log('[IndexRoute::create] Creating index route.');

        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            new IndexRoute().users(req, res, next);
        });
    }

    public users(req: Request, res: Response, next: NextFunction) {
        const user = new User({
            username: 'user1',
        });

        user.save((err, saved) => {
            if (err) {
                console.log('error', err);
                return next(err);
            }
            console.log('saved', saved);
        });

        User.find({}, (err, users) => {
            if (err) {
                return next(err);
            }
            if (users) {
                console.log('users:', users);
                return res.json(users);
            }
        });
    }
}
