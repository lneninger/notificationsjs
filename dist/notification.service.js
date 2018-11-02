"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chathtml_1 = require("./html-elements/chathtml");
var html_1 = require("./helpers/html");
var NotificationService = /** @class */ (function () {
    function NotificationService(notificationGroupService, actorType, database) {
        this.notificationGroupService = notificationGroupService;
        this.actorType = actorType;
        this.database = database;
        this.chatTableRef = database.ref(NotificationService.chatTableName);
    }
    Object.defineProperty(NotificationService.prototype, "chatRefPath", {
        get: function () {
            return NotificationService.chatTableName + "/" + this.chatId;
        },
        enumerable: true,
        configurable: true
    });
    NotificationService.prototype.processRemoteMessage = function (arg0) {
        throw new Error("Method not implemented.");
    };
    NotificationService.prototype.createWidgetShell = function (instanceData) {
        // Configure Wrapper
        var result = new chathtml_1.ChatHtml();
        // Configure instance
        var instance = document.createElement("notification-chat");
        instance.className = '';
        instance.setAttribute(NotificationService.chatAttributeName, this.chatId);
        html_1.HtmlHelpers.addEvent(instance, 'click', this.headerClick.bind(this));
        result.header = instance;
        result.wrapper.appendChild(instance);
        // Header
        var header = document.createElement("notification-header");
        header.className = '';
        html_1.HtmlHelpers.addEvent(header, 'click', this.headerClick.bind(this));
        result.header = header;
        result.wrapper.appendChild(header);
        //Header Title
        var headerTitle = document.createElement("title");
        headerTitle.className = '';
        headerTitle.innerText = 'Send Message';
        result.headerTitle = headerTitle;
        header.appendChild(headerTitle);
        // Body
        var body = document.createElement("notification-body");
        body.className = '';
        result.body = body;
        result.wrapper.appendChild(body);
        // Body Historic Area
        var historicArea = document.createElement('historic-area');
        historicArea.className = '';
        result.bodyHistoricArea = historicArea;
        result.body.appendChild(historicArea);
        var historicAreaContent = document.createElement('span');
        historicAreaContent.className = '';
        //historicAreaContent.innerText = 'Historic Area';
        result.bodyHistoricArea.appendChild(historicAreaContent);
        // Body Input Area
        var inputArea = document.createElement('input-area');
        inputArea.className = '';
        result.bodyInputArea = inputArea;
        result.body.appendChild(inputArea);
        var inputElement = document.createElement('input-element');
        inputElement.setAttribute('contenteditable', 'true');
        result.bodyInputElement = inputElement;
        result.bodyInputArea.appendChild(inputElement);
        var inputSend = document.createElement('input-send');
        result.bodyInputSend = inputSend;
        result.bodyInputArea.appendChild(inputSend);
        html_1.HtmlHelpers.addEvent(inputElement, 'keydown', this.inputKeyDown.bind(this));
    };
    NotificationService.prototype.createChat = function () {
        var _this = this;
        console.log('Firebase: ', firebase);
        this.chatId = this.chatTableRef.push().key;
        console.log("chat url: " + this.chatRefPath);
        this.chatTableRef.child(this.chatId).set({
            date: this.database.ServerValue.TIMESTAMP
        });
        // pending chat
        this.database
            .ref(NotificationService.pendingChatTableName).push({
            chatId: this.chatId,
            chatGroupKey: this.notificationGroupService.notificationGroupKey,
            date: this.database.ServerValue.TIMESTAMP
        });
        //this.chatRef = this.database
        //    .ref().child(this.chatRefPath);
        console.log('Chat reference', this.chatTableRef);
        //debugger;
        var childAddedEvent = this.chatTableRef.on('child_added', function (snapshot, prevChildName) {
            console.log('remote message elements', snapshot, 0);
            _this.processRemoteMessage(snapshot);
        });
        console.log("childAddedEvent: ", childAddedEvent);
    };
    NotificationService.prototype.headerClick = function ($event) {
    };
    NotificationService.prototype.inputKeyDown = function ($event) {
        //debugger;
        console.log('keydown: ', $event);
        if ($event.keyCode == 13) {
            var message = $event.target.innerText;
            console.log('Enter message -> ', message);
            this.sendMessage(message);
        }
    };
    NotificationService.prototype.sendMessage = function (message) {
        if (!this.chatId) {
            this.createChat();
        }
        var messageId = this.chatTableRef.child(this.chatId).push().key;
        this.chatTableRef.child(this.chatId).child(messageId).set({
            message: message,
            as: this.actorType
        });
    };
    NotificationService.chatAttributeName = 'chat';
    NotificationService.chatTableName = 'chats';
    NotificationService.pendingChatTableName = 'pending-chats';
    return NotificationService;
}());
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map