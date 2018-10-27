var NotificationModule = require("../dist/notificationmodule");
const util = require('util');
var Jasmine = require("jasmine");
var $ = require("jquery");


describe("Notification Module instanciation", function () {
    var notificationModule = null;
    beforeAll(function (done) {
        console.log('Executing beforeAll');
        var deferred = $.Deferred();
        notificationModule = new NotificationModule.NotificationModule('123456789');

        console.log('Executing beforeAll: Subscribing to resolve the async call');
        var intervalSetupScriptsDone = setInterval(function () {
            console.log('Executing beforeAll: wait to load script done...');
            console.log(util.inspect({ 'test': 123 }, false, null, true /* enable colors */))
            if (notificationModule.setupScriptsDone == true) {
                console.log('Executing beforeAll: Resolving async call');
                clearInterval(intervalSetupScriptsDone);
                deferred.resolve();
            }
        }, 300);



        deferred.done(function () {
            console.log('Executing beforeAll: Marking it as Done');
            console.log(util.inspect({ 'test': 123 }, false, null, true /* enable colors */))
            done();
        });
    });


    it("Notification module must be not null", function () {
        expect(notificationModule).not.toBeNull();
        expect(notificationModule).not.toBeUndefined();
    });

    it("NotificationModule.firebase property must be not null", function () {
        expect(notificationModule.firebase).not.toBeNull();
        expect(notificationModule.firebase).not.toBeUndefined();
    });

    it("NotificationModule.firebase's application must be 'HIPALANET-NOTIFICATIONS'", function () {
        expect(notificationModule.firebase.name).toBe('HIPALANET-NOTIFICATIONS');
    });

    it("NotificationModule.database property must be not null", function () {
        expect(notificationModule.database).not.toBeNull();
        expect(notificationModule.database).not.toBeUndefined();
    });

    it("NotificationModule.options.actorType property must be 'subscriber'", function () {
        expect(notificationModule.options.actorType).not.toBeNull();
        expect(notificationModule.options.actorType).not.toBeUndefined();
        expect(notificationModule.options.actorType).toBe('subscriber');
    });

});


