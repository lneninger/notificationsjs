import { NotificationGroupService } from "./notificationgroup.service";
import { NotificationChannelService } from ".";


declare var firebase: any;


export interface IFocusNotificationOptions {
    defaultActorType: ActorType,
    currentUserCookieName?: string;
    currentSessionCookieName?: string;
    currentSessionCookieExpiresInMinutes?: number;
    clientInfo: IClientInfo;
}

export interface IClientInfo {
    clientId?: string;
    pictureUrl?: string;
}

export interface INotificationGroupOptions {
    actorType: ActorType;
}

export interface IConnected {
    clientInfo: IClientInfo;
    sessionId: string;
}

export interface INotificationGroupClient {
    clientInfo: IClientInfo;
    sessionId: string;
    channelRef?: any;
    channel: INotificationChannel;
    notifications: IChannelNotification[];
    unreadMessages: number;
}

export class NotificationGroupClient implements INotificationGroupClient {
    clientInfo: IClientInfo;
    sessionId: string;
    channelRef?: any;
    channel: INotificationChannel;
    notifications: IChannelNotification[];
    unreadMessages: number;

    constructor(client: INotificationGroupClient) {
        this.clientInfo = client.clientInfo;
        this.channelRef = client.channelRef;
        this.channel = client.channel;
        this.notifications = client.notifications;
        this.sessionId = client.sessionId;
        this.unreadMessages = client.unreadMessages || 0;
    }

    // returns clientId otherwise the currentSessionId
    get clientIdentifier() {
        return this.clientInfo.clientId || this.sessionId;
    }
}

export interface INotificationChannel {
    notificationChannelIdentifier: string;
    createdAt: any;
    notifications: any;
}

export class NotificationChannel implements INotificationChannel {
    notificationChannelIdentifier: string;
    createdAt: any;
    notifications: any;


    static createNew(identifier: string): INotificationChannel {
        debugger;
        return <INotificationChannel>{
            notificationChannelIdentifier: identifier,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            notifications: {}
        }
    }
}

export interface IChannelNotification {
    key?: string;
    sender: string;
    receiver: string;
    message: string;
    createdAt?: any;
    read?: boolean;
}

export class ChannelNotification implements IChannelNotification {
    key?: string;
    sender: string;
    receiver: string;
    message: string;
    createdAt?: any;
    read?: boolean;

    constructor(sender: string, receiver: string, message: string) {
        this.sender = sender;
        this.receiver = receiver;
        this.message = message;
        this.createdAt = firebase.database.ServerValue.TIMESTAMP
    }
}


export interface OnChannelNotificationEventArgs {
    direction: ChannelNotificationDirection;
    notificationChannelService: NotificationChannelService;
    channelNotification: ChannelNotification;

}

export declare type ChannelNotificationDirection = 'sent' | 'received';