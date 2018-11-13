import { NotificationGroupService } from "./notificationgroup.service";
import { NotificationChannelService } from ".";


declare var firebase: any;


export interface IFocusNotificationOptions {
    defaultActorType: ActorType,
    currentUserCookieName?: string;
    currentSessionCookieName?: string;
    currentSessionCookieExpiresInMinutes?: number;
    clientId?: string;
}

export interface INotificationGroupOptions {
    actorType: ActorType;
}

export interface IConnected {
    clientId: string;
    sessionId: string;
}

export interface INotificationGroupClient {
    clientId: string;
    sessionId: string;
    channelRef?: any;
    channel: INotificationChannel;
    notifications: IChannelNotification[];
}

export class NotificationGroupClient implements INotificationGroupClient {
    clientId: string;
    sessionId: string;
    channelRef?: any;
    channel: INotificationChannel;
    notifications: IChannelNotification[];

    // returns clientId otherwise the currentSessionId
    get clientIdentifier() {
        return this.clientId || this.sessionId;
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
    sender: string;
    receiver: string;
    message: string;
    createdAt?: any;
}

export class ChannelNotification implements IChannelNotification {
    key?: string;
    sender: string;
    receiver: string;
    message: string;
    createdAt?: any;

    constructor(sender: string, receiver: string, message: string) {
        this.sender = sender;
        this.receiver = receiver;
        this.message = message;
        this.createdAt = firebase.database.ServerValue.TIMESTAMP
    }
}


export interface OnChannelNotificationEventArgs {
    notificationChannelService: NotificationChannelService;
    channelNotification: ChannelNotification;

}