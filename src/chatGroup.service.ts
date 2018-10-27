import { NotificationModule } from './notificationmodule';
import { HtmlHelpers } from './helpers/html';
import { ChatService } from './chat.service';
import { Subject } from 'rxjs';

export class ChatGroupService {
    // Events
    onClientConnected: Subject<any> = new Subject<any>();

    // Properties
    currentSessionId: string;

    private _accountKey: string;
    get accountKey() {
        return this._accountKey;
    }

    options: IChatGroupOptions;
    chats: ChatService[];

    constructor(private notification: NotificationModule, accountKey: string, private database: any, options: IChatGroupOptions) {

        this._accountKey = accountKey;
        this.chats = [];

        let defaultOptions = <IChatGroupOptions>{
            actorType: 'subscriber',
        };

        this.options = <IChatGroupOptions>{ ...defaultOptions, ...options };

        if (this.options.actorType == 'subscriber') {
            this.createChat();
        }

        //this.createWidgetShell();

    }



    connectToGroup() {
        let connectedRef: any;
        if (!this.currentSessionId) {
            connectedRef = this.database.ref(`connected/${this.accountKey}`).push();
            this.currentSessionId = connectedRef.key;
        }
        else {
            connectedRef = this.database.ref(`connected/${this.accountKey}/${this.currentSessionId}`);
        }

        connectedRef.onDisconnect().remove();
        connectedRef.set(true);
    }

    initializeWatchConnected() {
        this.database.ref(`connected/${this.accountKey}`).on('child_added', snapshot => {
            this.onClientConnected.next(snapshot.value());
            this.onClientConnected.complete();
        });
    }


    createChat(): any {
        let chat = new ChatService(this, this.options.actorType, this.database);
    }


    processRemoteMessage(message: NotificationMessage): any {
        let chatId = message.chatId;
        let chats = this.chats.filter(o => o.chatId == chatId);
        if (chats.length > 0) {
            chats[0].processRemoteMessage(message);
        }
    }
}

export interface IChatGroupOptions {
    actorType: ActorType;
}
