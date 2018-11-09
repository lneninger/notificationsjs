"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var models_1 = require("./models");
var NotificationChannelService = /** @class */ (function () {
    function NotificationChannelService(notificationGroupService, client) {
        this.notificationGroupService = notificationGroupService;
        this.channelNotifications = [];
        //this.notificationChannelTableRef = this.database.ref(NotificationChannelService.notificationChannelTableName);
        this._client = client;
    }
    Object.defineProperty(NotificationChannelService.prototype, "client", {
        get: function () {
            return this._client;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationChannelService.prototype, "notificationChannelRefPath", {
        get: function () {
            return NotificationChannelService.notificationChannelTableName + "/" + this.notificationChannelId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationChannelService.prototype, "notificationChannelDetailsRefPath", {
        get: function () {
            return this.notificationChannelRefPath + "/details";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationChannelService.prototype, "notificationChannelNotificationsRefPath", {
        get: function () {
            return this.notificationChannelRefPath + "/notifications";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NotificationChannelService.prototype, "database", {
        get: function () {
            return this.notificationGroupService.notification.database;
        },
        enumerable: true,
        configurable: true
    });
    NotificationChannelService.prototype.processRemoteMessage = function (arg0) {
        throw new Error("Method not implemented.");
    };
    NotificationChannelService.create = function (client, notificationGroup) {
        var resultObj = new NotificationChannelService(notificationGroup, client);
        return resultObj.createFirebaseChannel();
    };
    NotificationChannelService.prototype.createFirebaseChannel = function () {
        var _this = this;
        var observable = rxjs_1.of(this.client)
            .pipe(operators_1.mergeMap(function (client) {
            //debugger
            return rxjs_1.Observable.create(function (observer) {
                _this.referenceNotificationChannelForClient(client).subscribe(function (ref) {
                    _this.initializeNotificationWatch();
                    return rxjs_1.of(true);
                    //let result = { connected: client, notificationChannelRef: ref };
                    //observer.next(result);
                    //observer.complete();
                });
            });
        }));
        //.pipe(mergeMap<>(connectedAdRef => {
        //    return of(true);
        //    //debugger;
        //    //let client = (<any>connectedAdRef).client;
        //    //let channelRef = (<any>connectedAdRef).notificationChannelRef;
        //    //return Observable.create(observer => {
        //    //    //debugger;
        //    //    //client.channelRef = channelRef;
        //    //    //connected.channelRef.$connected = connected;
        //    //});
        //}));
        return observable;
    };
    NotificationChannelService.prototype.referenceNotificationChannelForClient = function (client) {
        var _this = this;
        var channelUserIds = [this.notificationGroupService.notification.options.userId, client.clientId].sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; });
        var notificationChannelIdentifier = channelUserIds.join('|');
        var pipeObservable = rxjs_1.Observable.create(function (observer) {
            //let notificationChannelKey: string;
            _this.database.ref("" + NotificationChannelService.notificationChannelTableName).orderByChild('notificationChannelIdentifier').equalTo(notificationChannelIdentifier).once('value', function (snapshot) {
                var notificationChannel = snapshot.val();
                if (notificationChannel) {
                    _this.notificationChannelId = snapshot.key;
                }
                else {
                    _this.notificationChannelId = _this.database.ref(NotificationChannelService.notificationChannelTableName).push().key;
                    var notificationChannel_1 = models_1.NotificationChannel.createNew(notificationChannelIdentifier);
                    _this.database.ref(_this.notificationChannelDetailsRefPath).set(notificationChannel_1);
                }
                _this.notificationChannelDetailsRef = _this.database.ref("" + _this.notificationChannelDetailsRefPath);
                _this.notificationChannelRef.on('value', function (snapshot) {
                    debugger;
                    _this.channelDetails = snapshot.val();
                });
                observer.next(true);
                observer.complete();
            });
        });
        return pipeObservable;
    };
    NotificationChannelService.prototype.initializeNotificationWatch = function () {
        var _this = this;
        this.database.ref("" + this.notificationChannelNotificationsRefPath).once('value', function (snapshot) {
            _this.channelNotifications.push(snapshot.val().map(function (res) {
                var result = [];
                var notificationKeys = Object.getOwnPropertyNames(res);
                for (var _i = 0, notificationKeys_1 = notificationKeys; _i < notificationKeys_1.length; _i++) {
                    var notificationKey = notificationKeys_1[_i];
                    result.push(new Notification(notificationKey, res[notificationKey]));
                }
            }));
        });
        this.database.ref("" + this.notificationChannelNotificationsRefPath).on('child_added', function (snapshot) {
            _this.channelNotifications.push(snapshot.val());
        });
    };
    //createWidgetShell(instanceData: any) {
    //    // Configure Wrapper
    //    let result = new ChatHtml();
    //    // Configure instance
    //    let instance = document.createElement("notification-chat");
    //    instance.className = '';
    //    instance.setAttribute(NotificationService.chatAttributeName, this.chatId);
    //    HtmlHelpers.addEvent(instance, 'click', this.headerClick.bind(this));
    //    result.header = instance;
    //    result.wrapper.appendChild(instance);
    //    // Header
    //    let header = document.createElement("notification-header");
    //    header.className = '';
    //    HtmlHelpers.addEvent(header, 'click', this.headerClick.bind(this));
    //    result.header = header;
    //    result.wrapper.appendChild(header);
    //    //Header Title
    //    let headerTitle = document.createElement("title");
    //    headerTitle.className = '';
    //    headerTitle.innerText = 'Send Message';
    //    result.headerTitle = headerTitle;
    //    header.appendChild(headerTitle);
    //    // Body
    //    let body = document.createElement("notification-body");
    //    body.className = '';
    //    result.body = body;
    //    result.wrapper.appendChild(body);
    //    // Body Historic Area
    //    let historicArea = document.createElement('historic-area');
    //    historicArea.className = '';
    //    result.bodyHistoricArea = historicArea;
    //    result.body.appendChild(historicArea);
    //    let historicAreaContent = document.createElement('span');
    //    historicAreaContent.className = '';
    //    //historicAreaContent.innerText = 'Historic Area';
    //    result.bodyHistoricArea.appendChild(historicAreaContent);
    //    // Body Input Area
    //    let inputArea = document.createElement('input-area');
    //    inputArea.className = '';
    //    result.bodyInputArea = inputArea;
    //    result.body.appendChild(inputArea);
    //    let inputElement = document.createElement('input-element');
    //    inputElement.setAttribute('contenteditable', 'true');
    //    result.bodyInputElement = inputElement;
    //    result.bodyInputArea.appendChild(inputElement);
    //    let inputSend = document.createElement('input-send');
    //    result.bodyInputSend = inputSend;
    //    result.bodyInputArea.appendChild(inputSend);
    //    HtmlHelpers.addEvent(inputElement, 'keydown', this.inputKeyDown.bind(this));
    //}
    //createChat() {
    //    console.log('Firebase: ', firebase);
    //    this.chatId = this.chatTableRef.push().key;
    //    console.log(`chat url: ${this.chatRefPath}`);
    //    this.chatTableRef.child(this.chatId).set({
    //        date: this.database.ServerValue.TIMESTAMP
    //    });
    //    // pending chat
    //    this.database
    //        .ref(NotificationService.pendingChatTableName).push({
    //            chatId: this.chatId,
    //            chatGroupKey: this.notificationGroupService.notificationGroupKey,
    //            date: this.database.ServerValue.TIMESTAMP
    //        });
    //    //this.chatRef = this.database
    //    //    .ref().child(this.chatRefPath);
    //    console.log('Chat reference', this.chatTableRef);
    //    //debugger;
    //    let childAddedEvent = this.chatTableRef.on('child_added', (snapshot, prevChildName) => {
    //        console.log('remote message elements', snapshot, 0);
    //        this.processRemoteMessage(snapshot);
    //    });
    //    console.log(`childAddedEvent: `, childAddedEvent);
    //}
    //headerClick($event) {
    //}
    //inputKeyDown($event) {
    //    //debugger;
    //    console.log('keydown: ', $event);
    //    if ($event.keyCode == 13) {
    //        let message = $event.target.innerText;
    //        console.log('Enter message -> ', message);
    //        this.sendMessage(message);
    //    }
    //}
    NotificationChannelService.prototype.sendMessage = function (message) {
        //if (!this.chatId) {
        //    this.createChat();
        //}
        var channelNotification = new models_1.ChannelNotification(this.client.clientId, message);
        var messageId = this.notificationChannelNotificationsRef.push(channelNotification);
    };
    NotificationChannelService.chatAttributeName = 'chat';
    NotificationChannelService.notificationChannelTableName = 'notification-channel';
    NotificationChannelService.pendingNotificationChannelTableName = 'pending-channels';
    return NotificationChannelService;
}());
exports.NotificationChannelService = NotificationChannelService;
//# sourceMappingURL=notificationchannel.service.js.map