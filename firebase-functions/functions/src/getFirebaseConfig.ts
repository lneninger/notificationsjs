import { https, Request, Response} from 'firebase-functions';
const cors = require('cors')({ origin: '*' });


export const getFirebaseConfig = https.onRequest((req: Request, res: Response) => {

    return cors(req, res, () => {
        console.log(`Sending firebase configuration`);
        res.status(200).json({
            apiKey: "AIzaSyCgVdtPw0go7eKPKadhBsbCH85GY6l91tE",
            authDomain: "focus-notifications.firebaseapp.com",
            databaseURL: 'https://focus-notifications.firebaseio.com',
            projectId: "focus-notifications",
            storageBucket: "focus-notifications.appspot.com",
            messagingSenderId: "95627638743"
        });
    });
});