import { HtmlHelpers } from './helpers/html';
import { NotificationGroupService } from './notificationgroup.service';
import { INotificationGroupOptions, IFocusNotificationOptions, OnChannelNotificationEventArgs} from './models'
import { HttpHelpers } from './helpers/http';
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

    private http: HttpHelpers;

    private notificationGroups: NotificationGroupService[];
    private firebaseScriptsLoaded: number = 0;

    currentSessionCookieName: string;

    _accountKey: string;
    get accountKey() {
        return this._accountKey;
    }


    private _defaultNotificationGroupKey: string;
    get defaultNotificationGroupKey() {
        return this._defaultNotificationGroupKey;
    }

    get currentSessionId() {
        return HtmlHelpers.getCookie(this.options.currentSessionCookieName);
    }

    set currentSessionId(value) {
        debugger;
        if (value == null) {
            HtmlHelpers.deleteCookie(this.options.currentSessionCookieName);
        }
        else {
            HtmlHelpers.setCookie(this.options.currentSessionCookieName, value, this.options.currentSessionCookieExpiresInMinutes);
        }
    }

    // Events
    onInitialized: Subject<boolean>;

    constructor(accountKey: string, defaultNotificationGroupKey?: string, options?: IFocusNotificationOptions) {
        this._accountKey = accountKey;
        if (!accountKey) {
            throw 'accountKey is required';
        }

        this._defaultNotificationGroupKey = defaultNotificationGroupKey || 'default';

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


        this.http = new HttpHelpers();
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
            HtmlHelpers.addScript([NotificationSettings.firebaseMessagingScriptUrl, NotificationSettings.firebaseDatabaseScriptUrl, NotificationSettings.firebaseFunctionsScriptUrl], this.firebaseScriptOnLoadFunction.bind(this), this.firebaseScriptOnErrorFunction.bind(this));
            }
                , this.firebaseScriptOnErrorFunction.bind(this));

    }

    firebaseScriptOnErrorFunction() {
        console.log('Firebase script was not loaded!!');
    }

    firebaseScriptOnLoadFunction(element, event) {
       
        console.log('Firebase script was loaded!!');
        
        this.initializeApp().subscribe(res => {
            this.initializeNotificationGroups();
            this.onInitialized.next(true);
            this.onInitialized.complete();
        });

        
    }

    initializeApp() {
        // debugger;
        let initAppObservable = Observable.create(observer => {
            this.http.httpCall('GET', 'https://us-central1-focus-notifications.cloudfunctions.net/getFirebaseConfig', null, (res) => {
                // debugger;
                this.firebaseConfig = res;
                console.log('Initializing Firebase Application: ', this.firebaseConfig);
                this.firebase = firebase.initializeApp(this.firebaseConfig, NotificationSettings.firebaseLocalApplicationName);

                this.database = this.firebase.database();
                //console.log(`Firebase: ${JSON.stringify(firebase)}`);
                console.log('Application Name: ', this.firebase.name);

                this.setupScriptsDone = true;
                observer.next();
                observer.complete();
            });
        });
        
        return initAppObservable;

        //this.firebaseConfig = {
        //    apiKey: "AIzaSyCgVdtPw0go7eKPKadhBsbCH85GY6l91tE",
        //    authDomain: "focus-notifications.firebaseapp.com",
        //    databaseURL: NotificationSettings.firebaseDatabaseUrl,
        //    projectId: "focus-notifications",
        //    storageBucket: "focus-notifications.appspot.com",
        //    messagingSenderId: "95627638743"
        //};
    }

    initializeNotificationGroups() {
        if (this.options.defaultActorType == 'subscriber') {
            let options: INotificationGroupOptions = {
                actorType: 'subscriber'
            };

            this.bindToNotificationGroup(this.defaultNotificationGroupKey, options);
        }
        else {
            // if attendant get chatgroups hosted by the current account
        }
    }

    bindToNotificationGroup(accountKey: string, options?: INotificationGroupOptions) {
        // debugger;
        let group = new NotificationGroupService(this, this.defaultNotificationGroupKey, this.database, options);
        this.notificationGroups.push(group);

        group.onChannelNotificationReceived.subscribe((args: OnChannelNotificationEventArgs) => {

        });

        group.onChannelNotificationSent.subscribe((args: OnChannelNotificationEventArgs) => {
            this.channelNotificationSent(args);
        });
    }

    channelNotificationSent(args: OnChannelNotificationEventArgs) {
        this.updateCurrentExpirationIdExpirationDate();
    }

    updateCurrentExpirationIdExpirationDate() {
        // cache the current value
        let currentSessionId = this.currentSessionId;

        // delete the cokkie
        this.currentSessionId = null;

        // recreate cookie with new value
        this.currentSessionId = currentSessionId;
    }
}



