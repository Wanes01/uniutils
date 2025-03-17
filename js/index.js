"use strict";

/*
POPUP HANDLERS
*/
const popupMenuIcon = document.querySelector("body header nav img:last-child");
const popupMenu = document.querySelector("body header nav:last-child");

popupMenuIcon.addEventListener('click', () => {
    if(popupMenu.classList.contains("hidden")) { // menú is closed
        popupMenu.classList.remove("hidden");
        popupMenu.classList.add("animate-open");
        popupMenuIcon.src = "assets/icons/close.png";
    } else {
        popupMenu.classList.add("hidden");
        popupMenuIcon.src = "assets/icons/menu.png";
    }
});

popupMenu.addEventListener('click', () => {
    popupMenu.classList.add("hidden");
    popupMenuIcon.src = "assets/icons/menu.png";
});

/* 
LINK HANDLERS 
*/

/* Associates the href value to the function used to fill the main tag */
const HREF_TO_MAINFUNCTION = {
    'vetrina' : mainVetrina,
    'login' : mainLogin,
    'registrazione' : mainRegister,
}

const ACTION_TO_FORMSUBMITTER = {
    'registrazione' : registerSubmitter,
    'login' : loginSubmitter,
}

/* All links in the main are generated dynamically, which means that you cannot attach
an event handler to them when the page loads. The function below performs an action by
delegating to the body when a click on a link is detected or a form is submitted. */
document.body.addEventListener('click', async function(e) {
    e.preventDefault();
    /* closest ensures that the click occurred anywhere inside
    the target element or is the target element itself */
    const link = e.target.closest("a");
    const submit = e.target.closest("form input[type='submit']");

    /* Do an action only if its a valid link or a submitted form */
    if (link == null && submit == null) {
        return;
    }

    /* User clicked on a link */
    if (link != null) {
        const hrefValue = extractLastName(link.href);
        /* The link may not exist */
        if (hrefValue && hrefValue != "logout") {
            document.title = `UniUtils - ${capitalizeFirstLetter(hrefValue)}`;
            fillMain(HREF_TO_MAINFUNCTION[hrefValue]);
        } else {
            await logoutUser();
        }
        return;
    }

    /* User submitted a form */
    if (submit != null) {
        const form = e.target.closest("form");
        /* the form's default behavior is overridden by preventDefault
        but the native field check it's still usefull */
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        const action = extractLastName(form.action);
        const errorList = form.querySelector("ul:last-of-type")
        await ACTION_TO_FORMSUBMITTER[action](new FormData(form), errorList);
    }
});

fillMain(mainVetrina);
fillNavigation();
