import {InstanceHtml } from './instancehtml';
import { HtmlHelpers } from '../helpers/html';



export class NotificationHtml {
    static expandedClass = 'expanded';
    static collapsedClass = 'collapsed';

    wrapper: Element;
    header: HTMLElement;
    headerTitle: HTMLElement;

    body: HTMLElement;

    instances: InstanceHtml[];

    get expanded() {
        return HtmlHelpers.hasClass(this.wrapper, NotificationHtml.expandedClass);
    }
}