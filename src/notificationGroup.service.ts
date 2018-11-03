import { NotificationModule } from './notification.module';
import { HtmlHelpers } from './helpers/html';
import { NotificationService } from './notification.service';
import { Subject, Observable, of } from 'rxjs';
import { NotificationMessage } from './notificationmessage.class';

export class NotificationGroupService {
    // Events
    onClientConnected: Subject<any> = new Subject<any>();

    // Properties
    currentSessionId: string;
    static notificationGroupTableName = 'notification-groups';
    private _notificationGroupKey: string;
    get notificationGroupKey() {
        return this._notificationGroupKey;
    }

    options: INotificationGroupOptions;
    notifications: NotificationService[];

    _connectedClients: any[];
    get connectedClients() {
        return this._connectedClients;
    }

    private _details: any;
    get details(){
        if (this._details) {
            return of(this.details);
        }
        else {
            this.database.ref(`${NotificationGroupService.notificationGroupTableName}/${this.notificationGroupKey}`)
        }
    }

    constructor(public notification: NotificationModule, defaultNotificationGroupKey: string, private database: any, options: INotificationGroupOptions) {

        this._notificationGroupKey = defaultNotificationGroupKey;
        this.notifications = [];
        this._connectedClients = [];

        let defaultOptions = <INotificationGroupOptions>{
            actorType: 'subscriber',
        };

        this.options = <INotificationGroupOptions>{ ...defaultOptions, ...options };

        //debugger;

        this.onClientConnected.subscribe(res => {
            //debugger;
            this.connectedClients.push(res);
        });

        this.connectToGroup();

        if (this.options.actorType == 'subscriber') {
            this.createChat();
        }
    }

    connectToGroup(notificationGroupKey?: string) {
        let internalNotificationGroupKey = notificationGroupKey || this.notificationGroupKey;

        let connectedRef: any;
        if (!this.currentSessionId) {
            connectedRef = this.database.ref(`connected/${this.notificationGroupKey}`).push();
            this.currentSessionId = connectedRef.key;
        }
        else {
            connectedRef = this.database.ref(`connected/${this.notificationGroupKey}/${this.currentSessionId}`);
        }

        connectedRef.onDisconnect().remove();
        connectedRef.set({userId: this.notification.options.userId });

        this.initializeWatchConnected();
    }

    initializeWatchConnected() {
        this.database.ref(`connected/${this.notificationGroupKey}`).on('child_added', snapshot => {
            //debugger;
            this.onClientConnected.next({ sessionId: snapshot.key, data: snapshot.val() });
            //this.onClientConnected.complete();
        });
    }

    createChat(): any {
        let chat = new NotificationService(this, this.options.actorType, this.database);
    }

    processRemoteMessage(message: NotificationMessage): any {
        let chatId = message.chatId;
        let chats = this.notifications.filter(o => o.chatId == chatId);
        if (chats.length > 0) {
            chats[0].processRemoteMessage(message);
        }
    }
}

export interface INotificationGroupOptions {
    actorType: ActorType;
}

export interface INotificationGroupDetails {
}
