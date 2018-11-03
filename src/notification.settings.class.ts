

export class NotificationSettings {
    /*Application Core*/
    //var firebaseScriptUrl = 'https://www.gstatic.com/firebasejs/5.5.3/firebase.js';
    static firebaseAppScriptUrl = 'https://www.gstatic.com/firebasejs/5.5.5/firebase-app.js';
    static firebaseMessagingScriptUrl = 'https://www.gstatic.com/firebasejs/5.5.5/firebase-messaging.js';
    static firebaseDatabaseScriptUrl = 'https://www.gstatic.com/firebasejs/5.5.5/firebase-database.js';
    static firebaseFunctionsScriptUrl = 'https://www.gstatic.com/firebasejs/5.5.5/firebase-functions.js';
    static fontawesomeJsUrl = 'https://use.fontawesome.com/d0aafd5830.js';

    static styleUrl = 'https://localhost:5001/widget/styles/app.css';

    /*Firebase Configuration*/
    static firebaseLocalApplicationName = 'HIPALANET_NOTIFICATIONS';
    static firebaseUrl = 'https://focus-notifications.firebaseio.com';
    static firebaseDatabaseUrl = NotificationSettings.firebaseUrl;
    static firebasePresenceUrl = `${NotificationSettings.firebaseUrl}/presence/`;
    static firebaseSelfPresenceCallbackUrl = `${NotificationSettings.firebaseUrl}/.info/connected`;
}
