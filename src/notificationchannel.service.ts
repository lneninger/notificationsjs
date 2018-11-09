declare var Firebase: any;
declare var firebase: any;
declare var messaging: any;

import { ChatHtml } from './html-elements/chathtml';
import { HtmlHelpers } from './helpers/html';
import { NotificationGroupService } from './notificationgroup.service';
import { Observable, of, pipe } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { INotificationGroupClient, NotificationChannel, INotificationChannel, IChannelNotification, ChannelNotification } from './models';





export class NotificationChannelService {

    static chatAttributeName = 'chat';

    notificationChannelRef: any;
    static notificationChannelTableName = 'notification-channel';
    static pendingNotificationChannelTableName = 'pending-channels';


    notificationChannelId: string;
    _client: INotificationGroupClient;
    get client(): INotificationGroupClient {
        return this._client;
    }

    channelDetails: any;
    channelNotifications: IChannelNotification[] = [];

    get notificationChannelRefPath() {
        return `${NotificationChannelService.notificationChannelTableName}/${this.notificationChannelId}`;
    }

    protected notificationChannelDetailsRef: any;
    get notificationChannelDetailsRefPath() {
        return `${this.notificationChannelRefPath}/details`;
    }


    protected notificationChannelNotificationsRef: any;
    get notificationChannelNotificationsRefPath() {
        return `${this.notificationChannelRefPath}/notifications`;
    }


    get database() {
        return this.notificationGroupService.notification.database;
    }


    constructor(private notificationGroupService: NotificationGroupService, client: INotificationGroupClient) {
        //this.notificationChannelTableRef = this.database.ref(NotificationChannelService.notificationChannelTableName);
        this._client = client;
    }

    processRemoteMessage(arg0: any): any {
        throw new Error("Method not implemented.");
    }


    static create(client: INotificationGroupClient, notificationGroup: NotificationGroupService): Observable<boolean> {
        let resultObj = new NotificationChannelService(notificationGroup, client);

        return resultObj.createFirebaseChannel();
    }

    protected createFirebaseChannel(): Observable<boolean> {
        let observable = of(this.client)
            .pipe(mergeMap<INotificationGroupClient, boolean>(client => {
                //debugger
                return Observable.create(observer => {
                    this.referenceNotificationChannelForClient(client).subscribe(ref => {
                        this.initializeNotificationWatch();
                        return of(true);
                        //let result = { connected: client, notificationChannelRef: ref };
                        //observer.next(result);
                        //observer.complete();
                    });
                });
            }));
            //.pipe(mergeMap<>(connectedAdRef => {
            //    return of(true);
            //    //debugger;
            //    //let client = (<any>connectedAdRef).client;
            //    //let channelRef = (<any>connectedAdRef).notificationChannelRef;

            //    //return Observable.create(observer => {
            //    //    //debugger;
            //    //    //client.channelRef = channelRef;
            //    //    //connected.channelRef.$connected = connected;


            //    //});
            //}));

        return observable;
    }

    referenceNotificationChannelForClient(client: INotificationGroupClient): Observable<boolean> {
        let channelUserIds = [this.notificationGroupService.notification.options.userId, client.clientId].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
        let notificationChannelIdentifier = channelUserIds.join('|');

        let pipeObservable = Observable.create(observer => {
            //let notificationChannelKey: string;
            this.database.ref(`${NotificationChannelService.notificationChannelTableName}`).orderByChild('notificationChannelIdentifier').equalTo(notificationChannelIdentifier).once('value', snapshot => {
                let notificationChannel = snapshot.val();
                if (notificationChannel) {
                    this.notificationChannelId = snapshot.key
                }
                else {
                    this.notificationChannelId = this.database.ref(NotificationChannelService.notificationChannelTableName).push().key;
                    let notificationChannel = NotificationChannel.createNew(notificationChannelIdentifier);
                    this.database.ref(this.notificationChannelDetailsRefPath).set(notificationChannel);
                }

                this.notificationChannelDetailsRef = this.database.ref(`${this.notificationChannelDetailsRefPath}`);
                this.notificationChannelRef.on('value', snapshot => {
                    debugger;
                    this.channelDetails = <INotificationChannel>snapshot.val();
                });
                observer.next(true);
                observer.complete();
            });

           
        });

        return pipeObservable;
    }

    initializeNotificationWatch() {
        this.database.ref(`${this.notificationChannelNotificationsRefPath}`).once('value', snapshot => {
            this.channelNotifications.push(snapshot.val().map(res => {
                let result = [];
                let notificationKeys = Object.getOwnPropertyNames(res);
                for (let notificationKey of notificationKeys) {
                    result.push(new Notification(notificationKey, res[notificationKey]))
                }

            }));
        });

        this.database.ref(`${this.notificationChannelNotificationsRefPath}`).on('child_added', snapshot => {
            this.channelNotifications.push(snapshot.val());
        });
    }

    //createWidgetShell(instanceData: any) {
    //    // Configure Wrapper
    //    let result = new ChatHtml();

    //    // Configure instance
    //    let instance = document.createElement("notification-chat");
    //    instance.className = '';
    //    instance.setAttribute(NotificationService.chatAttributeName, this.chatId);
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

    //    // Body Historic Area
    //    let historicArea = document.createElement('historic-area');
    //    historicArea.className = '';
    //    result.bodyHistoricArea = historicArea;
    //    result.body.appendChild(historicArea);
    //    let historicAreaContent = document.createElement('span');
    //    historicAreaContent.className = '';
    //    //historicAreaContent.innerText = 'Historic Area';
    //    result.bodyHistoricArea.appendChild(historicAreaContent);

    //    // Body Input Area
    //    let inputArea = document.createElement('input-area');
    //    inputArea.className = '';
    //    result.bodyInputArea = inputArea;
    //    result.body.appendChild(inputArea);
    //    let inputElement = document.createElement('input-element');
    //    inputElement.setAttribute('contenteditable', 'true');
    //    result.bodyInputElement = inputElement;
    //    result.bodyInputArea.appendChild(inputElement);

    //    let inputSend = document.createElement('input-send');
    //    result.bodyInputSend = inputSend;
    //    result.bodyInputArea.appendChild(inputSend);
    //    HtmlHelpers.addEvent(inputElement, 'keydown', this.inputKeyDown.bind(this));
    //}

    //createChat() {
    //    console.log('Firebase: ', firebase);
    //    this.chatId = this.chatTableRef.push().key;
    //    console.log(`chat url: ${this.chatRefPath}`);

    //    this.chatTableRef.child(this.chatId).set({
    //        date: this.database.ServerValue.TIMESTAMP
    //    });



    //    // pending chat
    //    this.database
    //        .ref(NotificationService.pendingChatTableName).push({
    //            chatId: this.chatId,
    //            chatGroupKey: this.notificationGroupService.notificationGroupKey,
    //            date: this.database.ServerValue.TIMESTAMP
    //        });

    //    //this.chatRef = this.database
    //    //    .ref().child(this.chatRefPath);

    //    console.log('Chat reference', this.chatTableRef);
    //    //debugger;
    //    let childAddedEvent = this.chatTableRef.on('child_added', (snapshot, prevChildName) => {
    //        console.log('remote message elements', snapshot, 0);
    //        this.processRemoteMessage(snapshot);
    //    });

    //    console.log(`childAddedEvent: `, childAddedEvent);

    //}

    //headerClick($event) {

    //}

    //inputKeyDown($event) {
    //    //debugger;
    //    console.log('keydown: ', $event);
    //    if ($event.keyCode == 13) {
    //        let message = $event.target.innerText;
    //        console.log('Enter message -> ', message);
    //        this.sendMessage(message);
    //    }
    //}

    sendMessage(message: string) {
        //if (!this.chatId) {
        //    this.createChat();
        //}
        let channelNotification = new ChannelNotification(this.client.clientId, message);
        let messageId = this.notificationChannelNotificationsRef.push(channelNotification);
    }
}



