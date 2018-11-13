declare var Firebase: any;
declare var firebase: any;
declare var messaging: any;

import { ChatHtml } from './html-elements/chathtml';
import { HtmlHelpers } from './helpers/html';
import { NotificationGroupService } from './notificationgroup.service';
import { Observable, of, pipe, Subject } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { INotificationGroupClient, NotificationChannel, INotificationChannel, IChannelNotification, ChannelNotification, OnChannelNotificationEventArgs } from './models';





export class NotificationChannelService {

    private _onChannelNotificationReceived: Subject<OnChannelNotificationEventArgs> = new Subject<OnChannelNotificationEventArgs>();
    get onChannelNotificationReceived() {
        return this._onChannelNotificationReceived;
    }

    private _onChannelNotificationSent: Subject<OnChannelNotificationEventArgs> = new Subject<OnChannelNotificationEventArgs>();
    get onChannelNotificationSent() {
        return this._onChannelNotificationSent;
    }

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

    protected notificationChannelNotificationsRef: any;
    get notificationChannelNotificationsRefPath() {
        return `${NotificationChannelService.notificationChannelTableName}-notifications/${this.notificationChannelId}`;
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


    static create(client: INotificationGroupClient, notificationGroup: NotificationGroupService): Observable<NotificationChannelService> {
        let resultObj = new NotificationChannelService(notificationGroup, client);

        return resultObj.createFirebaseChannel()
            .pipe(map(o => resultObj));
    }

    protected createFirebaseChannel(): Observable<boolean> {
        //debugger;
        let observable = of(this.client)
            .pipe<boolean>(mergeMap(client => {
                //debugger
                return this.referenceNotificationChannelForClient(client);
            }))

            .pipe<boolean>(mergeMap(status => {
                //debugger;
                this.initializeNotificationWatch();
                return of(true);
            }));



        return observable;
    }

    referenceNotificationChannelForClient(client: INotificationGroupClient): Observable<boolean> {
        let channelUserIds = [this.notificationGroupService.notification.clientIdentifier, client.clientId].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
        let notificationChannelIdentifier = channelUserIds.join('|');

        let pipeObservable = Observable.create(observer => {
            //let notificationChannelKey: string;
            this.database.ref(`${NotificationChannelService.notificationChannelTableName}`).orderByChild('notificationChannelIdentifier').equalTo(notificationChannelIdentifier).once('value', snapshot => {
                let notificationChannel = snapshot.val();
                let keys = Object.getOwnPropertyNames(notificationChannel);

                if (keys.length > 0) {
                    this.channelDetails = notificationChannel[keys[0]];
                    this.notificationChannelId = keys[0];
                    this.notificationChannelRef = this.database.ref(this.notificationChannelRefPath);
                }
                else {
                    this.notificationChannelId = this.database.ref(NotificationChannelService.notificationChannelTableName).push().key;
                    let notificationChannel = NotificationChannel.createNew(notificationChannelIdentifier);
                    this.notificationChannelRef = this.database.ref(this.notificationChannelRefPath);
                    this.notificationChannelRef.set(notificationChannel);
                }

                //this.notificationChannelDetailsRef = this.database.ref(`${this.notificationChannelDetailsRefPath}`);
                this.notificationChannelRef.on('value', snapshot => {
                    //debugger;
                    this.channelDetails = <INotificationChannel>snapshot.val();
                });
                this.notificationChannelNotificationsRef = this.database.ref(this.notificationChannelNotificationsRefPath);

                observer.next(true);
                observer.complete();
            });
        });

        return pipeObservable;
    }

    initializeNotificationWatch() {
        this.database.ref(`${this.notificationChannelNotificationsRefPath}`).once('value', snapshot => {
            let notificationsObj = snapshot.val();
            if (notificationsObj == null) return;
            //debugger;
            let keys = Object.getOwnPropertyNames(notificationsObj);
            let result = [];
            for (let key of keys) {
                let notification = <IChannelNotification>notificationsObj[key];
                result.push(notification);

            }
            //this.channelNotifications.push(notificationsObj.map(res => {
            //    let notificationKeys = Object.getOwnPropertyNames(res);
            //    for (let notificationKey of notificationKeys) {
            //    }

            //}));
        });

        this.database.ref(`${this.notificationChannelNotificationsRefPath}`).on('child_added', snapshot => {
            //debugger;
            let notification = <IChannelNotification>snapshot.val();
            this.channelNotifications.push(notification);

            let eventArgs = <OnChannelNotificationEventArgs>{ channelNotification: notification, notificationChannelService: this };
            this.onChannelNotificationReceived.next(eventArgs);
        });
    }


    sendMessage(message: string) {
        //if (!this.chatId) {
        //    this.createChat();
        //}
        let notification = new ChannelNotification(this.notificationGroupService.notification.currentSessionId, this.client.sessionId, message);
        let messageId = this.notificationChannelNotificationsRef.push().key;
        notification.key = messageId;
        this.database.ref(`${this.notificationChannelNotificationsRefPath}/${messageId}`).set(notification);

        let eventArgs = <OnChannelNotificationEventArgs>{ channelNotification: notification, notificationChannelService: this };
        this.onChannelNotificationSent.next(eventArgs);
    }
}



