import { HtmlHelpers } from './helpers/html';
import { ChatGroupService, IChatGroupOptions } from './chatgroup.service';
import { Http } from './helpers/http';
import { NotificationSettings } from './notification.settings.class';
import { NotificationHtml } from './html-elements/notificationhtml';
import { Observable } from 'rxjs';

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

   

    private chatGroupServices: ChatGroupService[];
    private firebaseScriptsLoaded: number = 0;


    
    //chatTable = 'chats';
    //pendingChatTable = 'pending-chats';

    currentSessionCookieName: string;

    get currentSessionId() {
        return HtmlHelpers.getCookie(this.options.currentSessionCookieName);
    }

    set currentSessionId(value) {
        HtmlHelpers.setCookie(this.options.currentSessionCookieName, value, this.options.currentSessionCookieExpiresInMinutes);
    }

    //chatId: string;
    //chatRefPath: string;
    //chatRef: any;

    constructor(private key: string, options?: IFocusNotificationOptions) {
        if (!key) {
            throw 'Key is required';
        }

        this.chatGroupServices = [];
        // this.wrapper = element;

        let defaultOptions = <IFocusNotificationOptions>{
            currentSessionCookieName: 'focusnotification|currentsession',
            currentSessionCookieExpiresInMinutes: 60
        };

        this.options = {
            ...defaultOptions, ...(options || {})
        };

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
         /*console.log('element: ', element);
        console.log('event: ', event);
        */
        this.initializeApp();
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
        console.log(`Firebase: ${JSON.stringify(firebase)}`);
        console.log('Application Name: ', this.firebase.firebase.app().name);

        this.setupScriptsDone = true;
    }

    createChatGroup(instanceKey: string, options?: IChatGroupOptions) {
        let group = new ChatGroupService(this, instanceKey, this.database, options);
        this.chatGroupServices.push(group);
    }

    //initializeMessagingWidget() {
    //    this.createWidgetShell();
    //}

    //createWidgetShell() {
    //    // Configure Wrapper
    //    let result = new NotificationHtml();

    //    //HtmlHelpers.addClass(this.elements.wrapper, this.collapsedClass);


    //    // Configure instance
    //    let instance = document.createElement("notification-area");
    //    instance.className = '';
    //    HtmlHelpers.addEvent(instance, 'click', this.headerClick.bind(this));
    //    result.header = instance;
    //    result.wrapper.appendChild(instance);

    //    // Header
    //    let header = document.createElement("notification-header");
    //    header.className = '';
    //    HtmlHelpers.addEvent(header, 'click', this.headerClick.bind(this));
    //    result.header = header;
    //    result.wrapper.appendChild(header);

    //    //Header Title
    //    let headerTitle = document.createElement("title");
    //    headerTitle.className = '';
    //    headerTitle.innerText = 'Send Message';
    //    result.headerTitle = headerTitle;
    //    header.appendChild(headerTitle);


    //    // Body
    //    let body = document.createElement("notification-body");
    //    body.className = '';
    //    result.body = body;
    //    result.wrapper.appendChild(body);


    //    return result;
    //}

    
    //headerClick($event: Event) {

    //    let instance = FocusNotificationInstance.getInstanceByElement((<Element>$event.target), this.instances);

    //    console.log('headerClick: ', 'this = ', this);
    //    if (this.expanded) {
    //        HtmlHelpers.removeClass(this.wrapper, this.expandedClass);
    //        HtmlHelpers.addClass(this.wrapper, this.collapsedClass);
    //    }
    //    else {
    //        HtmlHelpers.removeClass(this.wrapper, this.collapsedClass);
    //        HtmlHelpers.addClass(this.wrapper, this.expandedClass);
    //    }
    //}


    //processRemoteMessage(remoteMessage) {
    //    let messageObject = <NotificationMessage>remoteMessage.val();
    //    console.log('Remote message ', messageObject);
    //    let messageElement = document.createElement('message');
    //    messageElement.innerHTML = messageObject.message;
    //    HtmlHelpers.addClass(messageElement, messageObject.as);

    //    let instanceKey = messageObject.key;
    //    let instances = this.instances.filter(item => item.instanceKey == instanceKey);

    //    if (instances.length > 0) {
    //        instances[0].processRemoteMessage(messageObject);
    //    }
    //}
}


export interface IFocusNotificationOptions {
    currentSessionCookieName?: string;
    currentSessionCookieExpiresInMinutes?: number;
}