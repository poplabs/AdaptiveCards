// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Constants } from "./constants";
import * as Utils from "../utils";

export abstract class PopupControl {
    private _isOpen: boolean = false;
    private _overlayElement: HTMLElement;
    private _popupElement: HTMLElement;

    protected abstract renderContent(): HTMLElement;

    onClose: (popupControl: PopupControl, wasCancelled: boolean) => void;

    keyDown(e: KeyboardEvent) {
        switch (e.key) {
            case Constants.keys.escape:
                this.closePopup(true);

                break;
        }
    }

    render(rootElementBounds: ClientRect): HTMLElement {
        let element = document.createElement("div");
        element.tabIndex = 0;
        element.className = "ac-ctrl ac-ctrl-popup-container";
        element.setAttribute("role", "dialog");
        element.setAttribute("aria-modal", "true");
        element.onkeydown = (e) => {
            this.keyDown(e);

            return !e.cancelBubble;
        };

        element.appendChild(this.renderContent());

        return element;
    }

    focus() {
        if (this._popupElement) {
            (<HTMLElement>this._popupElement.firstElementChild).focus();
        }
    }

    popup(rootElement: HTMLElement) {
        if (!this._isOpen) {
            this._overlayElement = document.createElement("div");
            this._overlayElement.className = "ac-ctrl-overlay";
            this._overlayElement.tabIndex = 0;
            this._overlayElement.style.width = document.documentElement.scrollWidth + "px";
            this._overlayElement.style.height = document.documentElement.scrollHeight + "px";
            this._overlayElement.onfocus = (e) => { this.closePopup(true); };

            document.body.appendChild(this._overlayElement);

            var rootElementBounds = rootElement.getBoundingClientRect();

            this._popupElement = this.render(rootElementBounds);
            this._popupElement.classList.remove(
                "ac-ctrl-slide",
                "ac-ctrl-slideLeftToRight",
                "ac-ctrl-slideRightToLeft",
                "ac-ctrl-slideTopToBottom",
                "ac-ctrl-slideRightToLeft");

            window.addEventListener("resize", (e) => { this.closePopup(true); });

            const rootElementLabel = rootElement.getAttribute("aria-label");
            if (rootElementLabel) {
                this._popupElement.setAttribute("aria-label", rootElementLabel);
            }

            this._overlayElement.appendChild(this._popupElement);

            var popupElementBounds = this._popupElement.getBoundingClientRect();

            var availableSpaceBelow = window.innerHeight - rootElementBounds.bottom;
            var availableSpaceAbove = rootElementBounds.top;
            var availableSpaceRight = window.innerWidth - rootElementBounds.left;
            var availableSpaceRight = window.innerWidth - rootElementBounds.right;
            var availableSpaceLeft = rootElementBounds.left;

            var left = rootElementBounds.left + Utils.getScrollX();
            var top;

            if (availableSpaceAbove < popupElementBounds.height && availableSpaceBelow < popupElementBounds.height) {
                // Not enough space above or below root element
                var actualPopupHeight = Math.min(popupElementBounds.height, window.innerHeight);

                this._popupElement.style.maxHeight = actualPopupHeight + "px";

                if (actualPopupHeight < popupElementBounds.height) {
                    top = Utils.getScrollY();
                }
                else {
                    top = Utils.getScrollY() + rootElementBounds.top + (rootElementBounds.height - actualPopupHeight) /2;
                }

                if (availableSpaceLeft < popupElementBounds.width && availableSpaceRight < popupElementBounds.width) {
                    // Not enough space left or right of root element
                    var actualPopupWidth = Math.min(popupElementBounds.width, window.innerWidth);

                    this._popupElement.style.maxWidth = actualPopupWidth + "px";

                    if (actualPopupWidth < popupElementBounds.width) {
                        left = Utils.getScrollX();
                    }
                    else {
                        left = Utils.getScrollX() + rootElementBounds.left + (rootElementBounds.width - actualPopupWidth) /2;
                    }
                }
                else {
                    // Enough space on the left or right of the root element
                    if (availableSpaceRight >= popupElementBounds.width) {
                        left = Utils.getScrollX() + rootElementBounds.right;

                        this._popupElement.classList.add("ac-ctrl-slide", "ac-ctrl-slideLeftToRight");
                    }
                    else {
                        left = Utils.getScrollX() + rootElementBounds.left - popupElementBounds.width;

                        this._popupElement.classList.add("ac-ctrl-slide", "ac-ctrl-slideRightToLeft");
                    }
                }
            }
            else {
                // Enough space above or below root element
                if (availableSpaceBelow >= popupElementBounds.height) {
                    top = Utils.getScrollY() + rootElementBounds.bottom;

                    this._popupElement.classList.add("ac-ctrl-slide", "ac-ctrl-slideTopToBottom");
                }
                else {
                    top = Utils.getScrollY() + rootElementBounds.top - popupElementBounds.height

                    this._popupElement.classList.add("ac-ctrl-slide", "ac-ctrl-slideBottomToTop");
                }

                if (availableSpaceRight < popupElementBounds.width) {
                    left = Utils.getScrollX() + rootElementBounds.right - popupElementBounds.width;
                }
            }

            this._popupElement.style.left = left + "px";
            this._popupElement.style.top = top + "px";

            this._popupElement.focus();

            this._isOpen = true;
        }
    }

    closePopup(wasCancelled: boolean) {
        if (this._isOpen) {
            document.body.removeChild(this._overlayElement);

            this._isOpen = false;

            if (this.onClose) {
                this.onClose(this, wasCancelled);
            }
        }
    }

    get isOpen(): boolean {
        return this._isOpen;
    }
}
