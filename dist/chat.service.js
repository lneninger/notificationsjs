"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chathtml_1 = require("./html-elements/chathtml");
var html_1 = require("./helpers/html");
var ChatService = /** @class */ (function () {
    function ChatService(chatGroupService, actorType, database) {
        this.chatGroupService = chatGroupService;
        this.actorType = actorType;
        this.database = database;
        this.chatTableRef = database.ref(ChatService.chatTableName);
    }
    Object.defineProperty(ChatService.prototype, "chatRefPath", {
        get: function () {
            return ChatService.chatTableName + "/" + this.chatId;
        },
        enumerable: true,
        configurable: true
    });
    ChatService.prototype.processRemoteMessage = function (arg0) {
        throw new Error("Method not implemented.");
    };
    ChatService.prototype.createWidgetShell = function (instanceData) {
        // Configure Wrapper
        var result = new chathtml_1.ChatHtml();
        // Configure instance
        var instance = document.createElement("notification-chat");
        instance.className = '';
        instance.setAttribute(ChatService.chatAttributeName, this.chatId);
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
    ChatService.prototype.createChat = function () {
        var _this = this;
        console.log('Firebase: ', firebase);
        this.chatId = this.chatTableRef.push().key;
        console.log("chat url: " + this.chatRefPath);
        this.chatTableRef.child(this.chatId).set({
            date: this.database.ServerValue.TIMESTAMP
        });
        // pending chat
        this.database
            .ref(ChatService.pendingChatTableName).push({
            chatId: this.chatId,
            chatGroupKey: this.chatGroupService.chatGroupKey,
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
    ChatService.prototype.headerClick = function ($event) {
    };
    ChatService.prototype.inputKeyDown = function ($event) {
        //debugger;
        console.log('keydown: ', $event);
        if ($event.keyCode == 13) {
            var message = $event.target.innerText;
            console.log('Enter message -> ', message);
            this.sendMessage(message);
        }
    };
    ChatService.prototype.sendMessage = function (message) {
        if (!this.chatId) {
            this.createChat();
        }
        var messageId = this.chatTableRef.child(this.chatId).push().key;
        this.chatTableRef.child(this.chatId).child(messageId).set({
            message: message,
            as: this.actorType
        });
    };
    ChatService.chatAttributeName = 'chat';
    ChatService.chatTableName = 'chats';
    ChatService.pendingChatTableName = 'pending-chats';
    return ChatService;
}());
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map