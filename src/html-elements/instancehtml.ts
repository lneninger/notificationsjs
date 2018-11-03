import { ChatHtml } from './chathtml';
import { HtmlHelpers } from '../helpers/html';
import { Subject } from 'rxjs';
import { NotificationGroupService } from '../notificationgroup.service';


export class InstanceHtml {
    static InstanceNameAttributeName = 'instance';
    static createWidgetShell(notificationGroupService: NotificationGroupService) {
        // Configure Wrapper
        let result = new InstanceHtml();

        //HtmlHelpers.addClass(this.elements.wrapper, this.collapsedClass);


        // Configure instance
        let instanceElement = document.createElement("notification-instance");
        instanceElement.className = '';
        instanceElement.setAttribute(InstanceHtml.InstanceNameAttributeName, notificationGroupService.notification.accountKey);
        HtmlHelpers.addEvent(instanceElement, 'click', ($event: Event) => { result.headerClick.next({ $event: $event }) });
        result.wrapper = instanceElement;


        let header = document.createElement("notification-header");
        header.className = '';
        result.header = header;
        result.wrapper.appendChild(header);

        return result;
    }

    headerClick: Subject<IInstanceEventParams>;
    constructor() {
        this.headerClick = new Subject<IInstanceEventParams>();
    }

    static getINotificationGroupByElement(element: Element, notificationGroups: NotificationGroupService[]) {
        let loopElement: Node = element;
        let selector = 'notification-instance';

        let instanceElement = HtmlHelpers.getParent(element, selector);
        if (instanceElement != null) {

            let instanceAttr = (<Element>loopElement).getAttribute(InstanceHtml.InstanceNameAttributeName);
            let matchInstances = notificationGroups.filter(group => group.notification.accountKey);
            if (matchInstances.length > 0) {
                return matchInstances[0];
            }
        }


        return null;;
    }

    wrapper: Element;
    header: HTMLElement;
    headerTitle: HTMLElement;

    body: HTMLElement;

    chats: ChatHtml[];
}

export interface IInstanceEventParams {
    $event: Event,
    notificationGroupService?: NotificationGroupService,
    instanceHtml?: InstanceHtml
}
