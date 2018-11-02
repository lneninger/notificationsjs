import { https, Request, Response} from 'firebase-functions';


export const getFirebaseConfig = https.onRequest((req: Request, res: Response) => {

    res.json({
        apiKey: "AIzaSyCgVdtPw0go7eKPKadhBsbCH85GY6l91tE",
        authDomain: "focus-notifications.firebaseapp.com",
        databaseURL: 'https://focus-notifications.firebaseio.com',
        projectId: "focus-notifications",
        storageBucket: "focus-notifications.appspot.com",
        messagingSenderId: "95627638743"
    });
});