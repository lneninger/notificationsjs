var jsdom = require("jsdom");
const { JSDOM } = jsdom;
var defaultDocumentFeatures = {
    FetchExternalResources: ['script'],
    ProcessExternalResources: ['script'],
    MutationEvents: '2.0',
    QuerySelector: false
};

const options = {
    resources: 'usable',
    runScripts: 'dangerously',
};

var html = `<html><head></head><body><div id="rondavu_container"></div></body></html>`;

const dom = new JSDOM(html, options);


window = dom.window;

if (Object.keys(window).length === 0) {
    // this hapens if contextify, one of jsdom's dependencies doesn't install correctly
    // (it installs different code depending on the OS, so it cannot get checked in.);
    throw "jsdom failed to create a usable environment, try uninstalling and reinstalling it";
}

global.window = window;

global.document = window.document;