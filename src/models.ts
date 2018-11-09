import { NotificationGroupService } from "./notificationgroup.service";


declare var firebase: any;

export interface INotificationGroupOptions {
    actorType: ActorType;
}

export interface INotificationGroupDetails {
}


export interface INotificationGroupClient {
    clientId: string;
    sessionId: string;
    channelRef?: any;
    channel: INotificationChannel;
    notifications: INotification[];
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
    message: string;
}

export class ChannelNotification implements IChannelNotification{
    sender: string;
    message: string;

    constructor(sender: string, message: string) {
        this.sender = sender;
        this.message = message;
    }
}