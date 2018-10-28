


export class HtmlHelpers {
    static addScript(url, onLoadFn?, onErrorFn?) {
        console.log('loading url: ', url);
        let urls = [];

        console.log(`typeof ${url} = string: `, (typeof (url) == 'string'));
        if (typeof(url) === 'string') {
            urls.push(url)
        }
        else {
            urls = url;
        }

        let checkCounters = (loadCounter, errorCounter, urls, onLoadFn?, onErrorFn?) => {
            console.log(`loadCounter:${loadCounter}, errorCounter: ${errorCounter}`);
            if (loadCounter + errorCounter == urls.length) {
                if (errorCounter > 0) {
                    if (onErrorFn != null) onErrorFn();
                }
                else if (onLoadFn != null) onLoadFn();
            }
        }

        console.log('Creating script tags');
        let loadCounter = 0;
        let errorCounter = 0;
        for (let urlIndex = 0; urlIndex < urls.length; urlIndex++) {
            console.log('new script tag', urls[urlIndex]);

            let newScript = document.createElement("script");
            newScript.onload = () => { loadCounter++; checkCounters(loadCounter, errorCounter, urls, onLoadFn, onErrorFn) };
            newScript.onerror = () => { errorCounter++; checkCounters(loadCounter, errorCounter, urls, onLoadFn, onErrorFn) };
            document.head.appendChild(newScript);

            newScript.src = urls[urlIndex];
        }

    }

    static getParent(element: Element, selector: string) {
        let loopElement: Node = element;

        for (; loopElement && loopElement !== document; loopElement = loopElement.parentNode) {
            if ((<Element>loopElement).matches(selector)) {
                return loopElement;
            }
        }

        return null;;
    }


    static addStyle(url, onLoadFn, onErrorFn) {
        let linkElement: HTMLLinkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'stylesheet');
        linkElement.setAttribute('type', 'text/css');

        document.head.appendChild(linkElement);
        linkElement.setAttribute('href', url);
        console.log('Adding style', linkElement);

    }

    static createButton(text): HTMLElement {
        let btn = document.createElement("BUTTON");
        var t = document.createTextNode(text);       // Create a text node
        btn.appendChild(t);
        return btn;
    }

    static hasClass(element: Element, className: string) {
        return (element.className.indexOf(className) != -1)
    }

    static addClass(element: Element, className) {
        let split = className.split(' ');
        for (let i = 0; i < split.length; i++) {
            if (this.hasClass(element, split[i])) continue;
            element.className = element.className + (element.className.length > 0 ? ' ' : '') + split[i];
        }
    }

    static removeClass(element: Element, className) {
        let split = className.split(' ');
        for (let i = 0; i < split.length; i++) {
            element.className = element.className.replace(split[i], '');
        }
    }

    static addEvent(element: Element, eventName: EventName, eventFn: (event: Event) => void) {
        element.addEventListener(eventName, eventFn);
    }

    static setCookie(name: string, val: string, expiresInMinutes: number) {
        const date = new Date();
        const value = val;

        // Set it expire in 7 days
        date.setTime(date.getTime() + (/*7 * 24 * */(expiresInMinutes / 60) * 60 * 1000));

        // Set it
        document.cookie = name + "=" + value + "; expires=" + date.toUTCString() + "; path=/";
    }

    static getCookie(name: string) {
        const value = "; " + document.cookie;
        const parts = value.split("; " + name + "=");

        if (parts.length == 2) {
            return parts.pop().split(";").shift();
        }
    }

    static deleteCookie(name: string) {
        const date = new Date();

        // Set it expire in -1 days
        date.setTime(date.getTime() + (-1 * 24 * 60 * 60 * 1000));

        // Set it
        document.cookie = name + "=; expires=" + date.toUTCString() + "; path=/";
    }
}

 export declare type EventName = 'click' | 'keydown';
