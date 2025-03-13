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

/* Closes the popup window on main change */
document.querySelectorAll("body header nav:last-child ul li").forEach(popupMenuItem => {
    popupMenuItem.addEventListener('click', () => {
        popupMenu.classList.add("hidden");
        popupMenuIcon.src = "assets/icons/menu.png";
    });
});


/* 
LINK HANDLERS 
*/

/* Associates the href value to the function used to fill the main tag */
const HREF_TO_MAINFUNCTION = {
    'vetrina' : mainVetrina,
    'login' : mainLogin,
    'register' : mainRegister,
}

/* All links in the main are generated dynamically, which means that you cannot attach
an event handler to them when the page loads. The function below performs an action by
delegating to the body when a click on a link is detected. Actions are distinguished by
the href attribute of links */
document.body.addEventListener('click', function(e) {
    e.preventDefault();
    /* closest ensures that the click occurred anywhere inside
    the target element or is the target element itself */
    const link = e.target.closest("a");
    /* Associate the link only if its a clickable a tag */
    if (link != null) {
        const hrefValue = link.href.match(/([^\/]*)\/*$/)[1];
        /* The link may not exist (yet) */
        if (hrefValue && hrefValue != "#") {
            mainFiller(HREF_TO_MAINFUNCTION[hrefValue]);
        }
    }
});

mainFiller(mainVetrina);
