"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var chat_service_1 = require("./chat.service");
var rxjs_1 = require("rxjs");
var ChatGroupService = /** @class */ (function () {
    function ChatGroupService(notification, defaultChatGroupKey, database, options) {
        this.notification = notification;
        this.database = database;
        // Events
        this.onClientConnected = new rxjs_1.Subject();
        this._chatGroupKey = defaultChatGroupKey;
        this.chats = [];
        var defaultOptions = {
            actorType: 'subscriber',
        };
        this.options = __assign({}, defaultOptions, options);
        if (this.options.actorType == 'subscriber') {
            this.createChat();
        }
        //this.createWidgetShell();
    }
    Object.defineProperty(ChatGroupService.prototype, "chatGroupKey", {
        get: function () {
            return this._chatGroupKey;
        },
        enumerable: true,
        configurable: true
    });
    ChatGroupService.prototype.connectToGroup = function () {
        var connectedRef;
        if (!this.currentSessionId) {
            connectedRef = this.database.ref("connected/" + this.chatGroupKey).push();
            this.currentSessionId = connectedRef.key;
        }
        else {
            connectedRef = this.database.ref("connected/" + this.chatGroupKey + "/" + this.currentSessionId);
        }
        connectedRef.onDisconnect().remove();
        connectedRef.set(true);
    };
    ChatGroupService.prototype.initializeWatchConnected = function () {
        var _this = this;
        this.database.ref("connected/" + this.chatGroupKey).on('child_added', function (snapshot) {
            _this.onClientConnected.next(snapshot.value());
            _this.onClientConnected.complete();
        });
    };
    ChatGroupService.prototype.createChat = function () {
        var chat = new chat_service_1.ChatService(this, this.options.actorType, this.database);
    };
    ChatGroupService.prototype.processRemoteMessage = function (message) {
        var chatId = message.chatId;
        var chats = this.chats.filter(function (o) { return o.chatId == chatId; });
        if (chats.length > 0) {
            chats[0].processRemoteMessage(message);
        }
    };
    return ChatGroupService;
}());
exports.ChatGroupService = ChatGroupService;
//# sourceMappingURL=chatGroup.service.js.map