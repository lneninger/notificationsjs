import { HtmlHelpers } from './helpers/html';
import { NotificationGroupService, INotificationGroupOptions } from './notificationgroup.service';
import { Http } from './helpers/http';
import { NotificationSettings } from './notification.settings.class';
import { NotificationHtml } from './html-elements/notificationhtml';
import { Observable, Subject } from 'rxjs';

declare var Firebase: any;
declare var firebase: any;
declare var messaging: any;

export class NotificationModule {

    // Setup scripts
    setupScriptsDone: boolean = false;

    // Firebase instances
    firebaseConfig: any;
    firebase: any;
    database: any;
    messaging: any;

    options: IFocusNotificationOptions;

    private http: Http;

   

    private notificationGroups: NotificationGroupService[];
    private firebaseScriptsLoaded: number = 0;


    currentSessionCookieName: string;

    get currentSessionId() {
        return HtmlHelpers.getCookie(this.options.currentSessionCookieName);
    }

    set currentSessionId(value) {
        HtmlHelpers.setCookie(this.options.currentSessionCookieName, value, this.options.currentSessionCookieExpiresInMinutes);
    }


    // Events
    onInitialized: Subject<boolean>;

    constructor(private accountKey: string, private defaultChatGroupKey?: string, options?: IFocusNotificationOptions) {
        if (!accountKey) {
            throw 'accountKey is required';
        }

        this.defaultChatGroupKey = defaultChatGroupKey || 'default';

        this.notificationGroups = [];
        // this.wrapper = element;

        let defaultOptions = <IFocusNotificationOptions>{
            defaultActorType: 'subscriber',
            currentSessionCookieName: 'focusnotification|currentsession',
            currentSessionCookieExpiresInMinutes: 60
        };

        this.options = {
            ...defaultOptions, ...(options || {})
        };

        // Events
        this.onInitialized = new Subject<boolean>();


        this.http = new Http();
        this.config();
    }

    config() {
        // alert('Common code here');
        console.log('test');

        //this.addExtraJs();
        this.addFirebaseScript();
    }

    //addExtraJs(): any {
    //    HtmlHelpers.addScript(NotificationSettings.fontawesomeJsUrl);
    //}

    addFirebaseScript() {
            //HtmlHelpers.addStyle(NotificationSettings.styleUrl, null, null);
            HtmlHelpers.addScript(NotificationSettings.firebaseAppScriptUrl, () => {
                HtmlHelpers.addScript([NotificationSettings.firebaseMessagingScriptUrl, NotificationSettings.firebaseDatabaseScriptUrl], this.firebaseScriptOnLoadFunction.bind(this), this.firebaseScriptOnErrorFunction.bind(this));
            }
                , this.firebaseScriptOnErrorFunction.bind(this));

    }

    firebaseScriptOnErrorFunction() {
        console.log('Firebase script was not loaded!!');
    }

    firebaseScriptOnLoadFunction(element, event) {
       
        console.log('Firebase script was loaded!!');
        
        this.initializeApp();

        this.initializeChatGroups();
        this.onInitialized.next(true);
        this.onInitialized.complete();
    }

    initializeApp() {
        this.firebaseConfig = {
            apiKey: "AIzaSyCgVdtPw0go7eKPKadhBsbCH85GY6l91tE",
            authDomain: "focus-notifications.firebaseapp.com",
            databaseURL: NotificationSettings.firebaseDatabaseUrl,
            projectId: "focus-notifications",
            storageBucket: "focus-notifications.appspot.com",
            messagingSenderId: "95627638743"
        };



        console.log('Initializing Firebase Application: ', this.firebaseConfig);
        this.firebase = firebase.initializeApp(this.firebaseConfig, NotificationSettings.firebaseLocalApplicationName);

        this.database = this.firebase.database();
        //console.log(`Firebase: ${JSON.stringify(firebase)}`);
        console.log('Application Name: ', this.firebase.name);

        this.setupScriptsDone = true;
    }

    initializeChatGroups() {
        if (this.options.defaultActorType == 'subscriber') {
            let options: INotificationGroupOptions = {
                actorType: 'subscriber'
            };

            this.createChatGroup(this.defaultChatGroupKey, options);
        }
        else {
            // if attendant get chatgroups hosted by the current account
        }
    }




    createChatGroup(accountKey: string, options?: INotificationGroupOptions) {
        let group = new NotificationGroupService(this, this.defaultChatGroupKey, this.database, options);
        this.notificationGroups.push(group);
    }

}


export interface IFocusNotificationOptions {
    defaultActorType: ActorType,
    currentSessionCookieName?: string;
    currentSessionCookieExpiresInMinutes?: number;
}