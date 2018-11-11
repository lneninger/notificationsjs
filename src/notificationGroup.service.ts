import { NotificationModule } from './notification.module';
import { HtmlHelpers } from './helpers/html';
import { NotificationChannelService } from './notificationchannel.service';
import { Subject, Observable, of, pipe } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { NotificationMessage } from './notificationmessage.class';
import { INotificationGroupOptions, INotificationGroupClient, OnChannelNotificationEventArgs } from './models';



export class NotificationGroupService {
    // Events
    onClientConnected: Subject<any> = new Subject<any>();

    // Properties
    //currentSessionId: string;



    static notificationGroupTableName = 'notification-groups';
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
        if (!this.notification.currentSessionId) {
            connectedRef = this.database.ref(`connected/${this.notificationGroupKey}`).push();
            this.notification.currentSessionId = connectedRef.key;
        }
        else {
            connectedRef = this.database.ref(`connected/${this.notificationGroupKey}/${this.notification.currentSessionId}`);
        }

        connectedRef.onDisconnect().remove();
        let connectedData = <INotificationGroupClient>{ clientId: this.notification.options.userId, sessionId: this.notification.currentSessionId };
        connectedRef.set(connectedData);

        this.initializeWatchConnected();
    }

    initializeWatchConnected() {
        this.database.ref(`connected/${this.notificationGroupKey}`).on('child_added', snapshot => {
            //debugger;
            let key = snapshot.key;
            let data = <INotificationGroupClient>snapshot.val();
            //debugger;
            // If connected udser is not the current user send connection event
            if (data.clientId != this.notification.options.userId) {
                this.onClientConnected.next(data);
            }
            //this.onClientConnected.complete();
        });
    }

    getNotificationChannelByClient(client: INotificationGroupClient) {
        return this.notificationChannels.filter(o => o.client.sessionId == client.sessionId);
    }

    onSelectNotificationGroupClient(client: INotificationGroupClient): Observable<NotificationChannelService> {

        let observable: Observable<NotificationChannelService>;
        //debugger;
        let channel = this.getNotificationChannelByClient(client);
        if (channel.length > 0) {
                observable = of(channel[0]);
        }
        else {
            observable = NotificationChannelService.create(client, this).pipe<NotificationChannelService>(mergeMap(channelService => {
                this.notificationChannels.push(channelService);
                channelService.onChannelNotificationReceived.subscribe((args: OnChannelNotificationEventArgs) => {
                    this.channelNotificationReceived(args);
                });
                channelService.onChannelNotificationSent.subscribe((args: OnChannelNotificationEventArgs) => {
                    this.channelNotificationSent(args);
                });
                return of(channelService)
            }));
            //debugger;
            
        }
       

        return observable;
    }

    channelNotificationReceived(args: OnChannelNotificationEventArgs) {
        this.onChannelNotificationReceived.next(args);
    }

    channelNotificationSent(args: OnChannelNotificationEventArgs) {
        this.onChannelNotificationSent.next(args);
    }

}
