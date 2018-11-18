declare var Firebase: any;
declare var firebase: any;
declare var messaging: any;

import { ChatHtml } from './html-elements/chathtml';
import { HtmlHelpers } from './helpers/html';
import { NotificationGroupService } from './notificationgroup.service';
import { Observable, of, pipe, Subject } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { INotificationGroupClient, NotificationGroupClient, NotificationChannel, INotificationChannel, IChannelNotification, ChannelNotification, OnChannelNotificationEventArgs } from './models';





export class NotificationChannelService {

    private _onChannelNotificationReceived: Subject<OnChannelNotificationEventArgs> = new Subject<OnChannelNotificationEventArgs>();
    get onChannelNotificationReceived() {
        return this._onChannelNotificationReceived;
    }

    private _onChannelNotificationSent: Subject<OnChannelNotificationEventArgs> = new Subject<OnChannelNotificationEventArgs>();
    get onChannelNotificationSent() {
        return this._onChannelNotificationSent;
    }

    private _onChannelNotification: Subject<OnChannelNotificationEventArgs> = new Subject<OnChannelNotificationEventArgs>();
    get onChannelNotification() {
        return this._onChannelNotification;
    }

    private _onChannelNotificationUpdated: Subject<OnChannelNotificationEventArgs> = new Subject<OnChannelNotificationEventArgs>();
    get onChannelNotificationUpdated() {
        return this._onChannelNotificationUpdated;
    }



    static chatAttributeName = 'chat';

    notificationChannelRef: any;
    static notificationChannelTableName = 'notification-channel';
    static pendingNotificationChannelTableName = 'pending-channels';


    notificationChannelId: string;
    _client: NotificationGroupClient;
    get client(): NotificationGroupClient {
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

    constructor(private notificationGroupService: NotificationGroupService, client: NotificationGroupClient) {
        this._client = client;
    }

    processRemoteMessage(arg0: any): any {
        throw new Error("Method not implemented.");
    }

    static create(client: NotificationGroupClient, notificationGroup: NotificationGroupService): Observable<NotificationChannelService> {
        let resultObj = new NotificationChannelService(notificationGroup, client);

        let result = resultObj.createFirebaseChannel()
            .pipe<NotificationChannelService>(mergeMap(bool => {
                return of(resultObj);
            }));

        return result;
    }

    protected createFirebaseChannel(): Observable<boolean> {
        //debugger;
        let observable = of(this.client)
            .pipe<boolean>(mergeMap(client => {
                return this.referenceNotificationChannelForClient(client);
            }))

            .pipe<boolean>(mergeMap(status => {
                this.initializeNotificationWatch();
                return of(true);
            }));

        return observable;
    }

    referenceNotificationChannelForClient(client: NotificationGroupClient): Observable<boolean> {
        let channelUserIds = [this.notificationGroupService.notification.clientIdentifier, client.clientIdentifier].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
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
            let keys = Object.getOwnPropertyNames(notificationsObj);
            let result = [];
            for (let key of keys) {
                let notification = <IChannelNotification>notificationsObj[key];
                result.push(notification);
            }
        });

        this.database.ref(`${this.notificationChannelNotificationsRefPath}`).on('child_added', snapshot => {
            let notification = <IChannelNotification>snapshot.val();
            this.channelNotifications.push(notification);

            let eventArgs = <OnChannelNotificationEventArgs>{ direction: 'received', channelNotification: notification, notificationChannelService: this };
            this.onChannelNotificationReceived.next(eventArgs);
            this.onChannelNotification.next(eventArgs);
        });

        this.database.ref(`${this.notificationChannelNotificationsRefPath}`).on('child_changed', snapshot => {
            //debugger;
            let notification = <IChannelNotification>snapshot.val();
            let matches = this.channelNotifications.filter((item: IChannelNotification) => item.key == notification.key);
            if (matches.length > 0) {
                let indexOf = this.channelNotifications.indexOf(matches[0]);
                let newNotification = { ...matches[0], ...notification };
                this.channelNotifications.splice(indexOf, 1, newNotification);

                let eventArgs = <OnChannelNotificationEventArgs>{ direction: 'received', channelNotification: notification, notificationChannelService: this };
                this.client.unreadMessages = this.channelNotifications.filter(o => !o.read).length;
                this.onChannelNotificationUpdated.next(eventArgs);
                this.onChannelNotification.next(eventArgs);
            }
        });
    }

    sendMessage(message: string) {
        let senderIdentifier = this.notificationGroupService.notification.clientIdentifier;
        let receiverIdentifier = this.client.clientIdentifier;

        let notification = new ChannelNotification(senderIdentifier, receiverIdentifier, message);
        let messageId = this.notificationChannelNotificationsRef.push().key;
        notification.key = messageId;
        this.database.ref(`${this.notificationChannelNotificationsRefPath}/${messageId}`).set(notification);

        let eventArgs = <OnChannelNotificationEventArgs>{ direction: 'sent', channelNotification: notification, notificationChannelService: this };
        this.onChannelNotificationSent.next(eventArgs);
        this.onChannelNotification.next(eventArgs);
    }
    setMessageAsRead(messageId: string) {
        this.database.ref(`${this.notificationChannelNotificationsRefPath}/${messageId}`).update({ 'read': true });
    }

    markMessagesAsRead() {
        //debugger;
        let notRead = this.channelNotifications.filter(notification => !notification.read);
        for (let i = 0; i < notRead.length; i++) {
            this.setMessageAsRead(notRead[i].key);
        }
    }
}

