import { NotificationModule } from './notification.module';
import { HtmlHelpers } from './helpers/html';
import { NotificationChannelService } from './notificationchannel.service';
import { Subject, Observable, of, pipe } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { NotificationMessage } from './notificationmessage.class';
import { INotificationGroupOptions, INotificationGroupClient, OnChannelNotificationEventArgs, NotificationGroupClient } from './models';



export class NotificationGroupService {
    // Events
    onClientConnected: Subject<NotificationGroupClient> = new Subject<NotificationGroupClient>();

    // Properties
    //currentSessionId: string;



    static notificationGroupTableName = 'notification-groups';
    static connectedInGroupTableName = 'connected-in-groups'

    // Connected reference for this group. The record key must be the same of general notification module connected key
    connectedRef: any;

    private _notificationGroupKey: string;
    get notificationGroupKey() {
        return this._notificationGroupKey;
    }

    options: INotificationGroupOptions;
    notificationChannels: NotificationChannelService[];

    _connectedClients: any[];
    get connectedClients() {
        return this._connectedClients;
    }

    private _details: any;
    get details() {
        if (this._details) {
            return of(this.details);
        }
        else {
            this.database.ref(`${NotificationGroupService.notificationGroupTableName}/${this.notificationGroupKey}`)
        }
    }

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

    constructor(public notification: NotificationModule, defaultNotificationGroupKey: string, private database: any, options: INotificationGroupOptions) {

        this._notificationGroupKey = defaultNotificationGroupKey;
        this.notificationChannels = [];
        this._connectedClients = [];

        let defaultOptions = <INotificationGroupOptions>{
            actorType: 'subscriber',
        };

        this.options = <INotificationGroupOptions>{ ...defaultOptions, ...options };

        console.log(`Setting onClientConnected`);
        //debugger;

        this.onClientConnected.subscribe(res => {
            //debugger;
            this.connectedClients.push(res);
        });

        this.connectToGroup();

        //if (this.options.actorType == 'subscriber') {
        //    this.createNotificationChannel();
        //}
    }

    connectToGroup(notificationGroupKey?: string) {
        let internalNotificationGroupKey = notificationGroupKey || this.notificationGroupKey;
        let connectedRef: any;

        //debugger;
        let connectedData = <INotificationGroupClient>{ clientInfo: this.notification.options.clientInfo, sessionId: this.notification.currentSessionId };
        this.database.ref(`${NotificationGroupService.connectedInGroupTableName}/${this.notificationGroupKey}`).child(this.notification.currentSessionId).set(connectedData);
        this.connectedRef = this.database.ref(`${NotificationGroupService.connectedInGroupTableName}/${this.notificationGroupKey}/${this.notification.currentSessionId}`);
        this.connectedRef.onDisconnect().remove();

        this.initializeWatchConnected();
    }

    initializeWatchConnected() {
        this.database.ref(`${NotificationGroupService.connectedInGroupTableName}/${this.notificationGroupKey}`).on('child_added', snapshot => {
            //debugger;
            let key = snapshot.key;
            let data = <INotificationGroupClient>snapshot.val();
            let connected = new NotificationGroupClient(data);
            //debugger;
            // If connected udser is not the current user send connection event
            if (connected.clientIdentifier != this.notification.clientIdentifier && this.getNotificationChannelByClient(connected).length == 0) {
                this.createNotificationChannel(connected).subscribe(channelService => {
                    this.onClientConnected.next(connected);
                });
            }
            //this.onClientConnected.complete();
        });
    }

    getNotificationChannelByClient(client: NotificationGroupClient): NotificationChannelService[] {
        return this.notificationChannels.filter(o => o.client.clientIdentifier == client.clientIdentifier);
    }

    onSelectNotificationGroupClient(client: NotificationGroupClient): Observable<NotificationChannelService> {

        let observable: Observable<NotificationChannelService>;
        //debugger;
        let channel = this.getNotificationChannelByClient(client);
        if (channel.length > 0) {
                observable = of(channel[0]);
        }
        else {
            this.createNotificationChannel(client);
            //debugger;
            
        }

        return observable;
    }

    createNotificationChannel(client: NotificationGroupClient) {
        let observable: Observable<NotificationChannelService>;
        observable = NotificationChannelService.create(client, this).pipe<NotificationChannelService>(mergeMap(channelService => {
            this.notificationChannels.push(channelService);
            channelService.onChannelNotificationReceived.subscribe((args: OnChannelNotificationEventArgs) => {
                this.channelNotificationReceived(args);
            });
            channelService.onChannelNotificationSent.subscribe((args: OnChannelNotificationEventArgs) => {
                this.channelNotificationSent(args);
            });

            channelService.onChannelNotification.subscribe((args: OnChannelNotificationEventArgs) => {
                this.channelNotification(args);
            });
            return of(channelService)
        }));

        return observable;
    }

    channelNotificationReceived(args: OnChannelNotificationEventArgs) {
        this.onChannelNotificationReceived.next(args);
    }

    channelNotificationSent(args: OnChannelNotificationEventArgs) {
        this.onChannelNotificationSent.next(args);
    }

    channelNotification(args: OnChannelNotificationEventArgs) {
        this.onChannelNotification.next(args);
    }
}
