import { NotificationModule } from './notification.module';
import { HtmlHelpers } from './helpers/html';
import { NotificationService } from './notification.service';
import { Subject, Observable, of } from 'rxjs';

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

    private _details: any;
    get details(){
        if (this._details) {
            return of(this.details);
        }
        else {
            this.database.ref(`${NotificationGroupService.notificationGroupTableName}`)
        }
    }

    constructor(private notification: NotificationModule, defaultNotificationGroupKey: string, private database: any, options: INotificationGroupOptions) {

        this._notificationGroupKey = defaultNotificationGroupKey;
        this.notifications = [];

        let defaultOptions = <INotificationGroupOptions>{
            actorType: 'subscriber',
        };

        this.options = <INotificationGroupOptions>{ ...defaultOptions, ...options };

        if (this.options.actorType == 'subscriber') {
            this.createChat();
        }
    }

    connectToGroup() {
        let connectedRef: any;
        if (!this.currentSessionId) {
            connectedRef = this.database.ref(`connected/${this.notificationGroupKey}`).push();
            this.currentSessionId = connectedRef.key;
        }
        else {
            connectedRef = this.database.ref(`connected/${this.notificationGroupKey}/${this.currentSessionId}`);
        }

        connectedRef.onDisconnect().remove();
        connectedRef.set(true);
    }

    initializeWatchConnected() {
        this.database.ref(`connected/${this.notificationGroupKey}`).on('child_added', snapshot => {
            this.onClientConnected.next(snapshot.value());
            this.onClientConnected.complete();
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
