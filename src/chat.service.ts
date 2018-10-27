declare var Firebase: any;
declare var firebase: any;
declare var messaging: any;

import { ChatHtml } from './html-elements/chathtml';
import { HtmlHelpers } from './helpers/html';







export class ChatService {

    static chatAttributeName = 'chat';

    chatTableRef: any;
    static chatTableName = 'chats';
    static pendingChatTableName = 'pending-chats';

    get chatRefPath() {
        return `${ChatService.chatTableName}/${this.chatId}`;
    }

    constructor(private instance, private actorType: ActorType, private database: any) {
        this.chatTableRef = database.ref(ChatService.chatTableName);
    }

    processRemoteMessage(arg0: any): any {
        throw new Error("Method not implemented.");
    }

    chatId: string;

    createWidgetShell(instanceData: any) {
        // Configure Wrapper
        let result = new ChatHtml();

        // Configure instance
        let instance = document.createElement("notification-chat");
        instance.className = '';
        instance.setAttribute(ChatService.chatAttributeName, this.chatId);
        HtmlHelpers.addEvent(instance, 'click', this.headerClick.bind(this));
        result.header = instance;
        result.wrapper.appendChild(instance);

        // Header
        let header = document.createElement("notification-header");
        header.className = '';
        HtmlHelpers.addEvent(header, 'click', this.headerClick.bind(this));
        result.header = header;
        result.wrapper.appendChild(header);

        //Header Title
        let headerTitle = document.createElement("title");
        headerTitle.className = '';
        headerTitle.innerText = 'Send Message';
        result.headerTitle = headerTitle;
        header.appendChild(headerTitle);


        // Body
        let body = document.createElement("notification-body");
        body.className = '';
        result.body = body;
        result.wrapper.appendChild(body);

        // Body Historic Area
        let historicArea = document.createElement('historic-area');
        historicArea.className = '';
        result.bodyHistoricArea = historicArea;
        result.body.appendChild(historicArea);
        let historicAreaContent = document.createElement('span');
        historicAreaContent.className = '';
        //historicAreaContent.innerText = 'Historic Area';
        result.bodyHistoricArea.appendChild(historicAreaContent);

        // Body Input Area
        let inputArea = document.createElement('input-area');
        inputArea.className = '';
        result.bodyInputArea = inputArea;
        result.body.appendChild(inputArea);
        let inputElement = document.createElement('input-element');
        inputElement.setAttribute('contenteditable', 'true');
        result.bodyInputElement = inputElement;
        result.bodyInputArea.appendChild(inputElement);

        let inputSend = document.createElement('input-send');
        result.bodyInputSend = inputSend;
        result.bodyInputArea.appendChild(inputSend);
        HtmlHelpers.addEvent(inputElement, 'keydown', this.inputKeyDown.bind(this));
    }

    createChat() {
        console.log('Firebase: ', firebase);
        this.chatId = this.chatTableRef.push().key;
        console.log(`chat url: ${this.chatRefPath}`);

        this.chatTableRef.child(this.chatId).set({
            date: this.database.ServerValue.TIMESTAMP
        });

        // pending chat
        this.database
            .ref(ChatService.pendingChatTableName).push({
                chatId: this.chatId,
                accessKey: this.instance.key,
                date: this.database.ServerValue.TIMESTAMP
            });

        //this.chatRef = this.database
        //    .ref().child(this.chatRefPath);

        console.log('Chat reference', this.chatTableRef);
        //debugger;
        let childAddedEvent = this.chatTableRef.on('child_added', (snapshot, prevChildName) => {
            console.log('remote message elements', snapshot, 0);
            this.processRemoteMessage(snapshot);
        });

        console.log(`childAddedEvent: `, childAddedEvent);

    }

    headerClick($event) {

    }

    inputKeyDown($event) {
        //debugger;
        console.log('keydown: ', $event);
        if ($event.keyCode == 13) {
            let message = $event.target.innerText;
            console.log('Enter message -> ', message);
            this.sendMessage(message);
        }
    }

    sendMessage(message) {
        if (!this.chatId) {
            this.createChat();
        }

        let messageId = this.chatTableRef.child(this.chatId).push().key;
        this.chatTableRef.child(this.chatId).child(messageId).set({
            message: message,
            as: this.actorType
        });
    }
}



