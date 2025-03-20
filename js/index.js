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
    'catalogo' : mainCatalogo,
}

const ACTION_TO_FORMSUBMITTER = {
    'registrazione' : registerSubmitter,
    'login' : loginSubmitter,
    'filtra' : productFilterSubmitter,
    'cerca' : productFilterSubmitter,
}

/* All links in the main are generated dynamically, which means that you cannot attach
an event handler to them when the page loads. The function below performs an action by
delegating to the body when a click on a link is detected or a form is submitted. */
document.body.addEventListener('click', async function(e) {
    /* Mantain the default behavior for all elements except
    submit inputs and links */
    if (e.target.closest("a")
    || e.target.closest("form input[type='submit']")
    || e.target.closest("form[action='filtra'] input[type='reset']")) {
        e.preventDefault();
    }

    // special behavior for the reset button of the Catalogo forms
    if (e.target.closest("form[action='filtra'] input[type='reset']")) {
        await fillMain(async () => {
            return await HREF_TO_MAINFUNCTION["catalogo"](
                "minPrice=&maxPrice=&orderBy=popularity&from=0&howMany=8", 8, 1
            );
        });
        return;
    }

    /* closest ensures that the click occurred anywhere inside
    the target element or is the target element itself */
    const link = e.target.closest("a");
    const submit = e.target.closest("form input[type='submit']");

    /* Do an action only if its a link or a submitted form */
    if (link == null && submit == null) {
        return;
    }

    /* User clicked on a link */
    if (link != null) {
        const hrefValue = extractLastName(link.href);
        if (!hrefValue || hrefValue == "#") {
            return;
        }

        // Jumps into the category page with a category already selected
        if (hrefValue.match(/^catalogo#([0-9])+$/)) {
            const categoryID = hrefValue.match(/^catalogo#([0-9])+$/)[1];
            await fillMain(async () => {
                return await HREF_TO_MAINFUNCTION["catalogo"](
                    `minPrice=&maxPrice=&orderBy=popularity&from=0&howMany=8&categories=${categoryID}`, 8, 1
                );
            });
            return;
        }

        switch (hrefValue) {
            case "logout":
                await logoutUser();
                break;
            case "catalogo":
                await fillMain(async () => {
                    return await HREF_TO_MAINFUNCTION[hrefValue](
                        "minPrice=&maxPrice=&orderBy=popularity&from=0&howMany=8", 8, 1
                    );
                });
                break;
            default:
                await fillMain(HREF_TO_MAINFUNCTION[hrefValue]);
            }
        return;
    }

    /* User submitted a form */
    const form = e.target.closest("form");
    /* the form's default behavior is overridden by preventDefault
    but the native field check it's still usefull */
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    const action = extractLastName(form.action);

    switch (action) {
        case 'login':
        case 'registrazione':
            // login and register form have a list to display input errors
            const errorList = form.querySelector("ul:last-of-type")
            await ACTION_TO_FORMSUBMITTER[action](new FormData(form), errorList);
            break;
        case 'filtra':
        case 'cerca':
            // on submit the data of both the filters and the search bar is sent to the server
            const [filters, searchBar] = document.querySelectorAll("form");
            await ACTION_TO_FORMSUBMITTER[action](new FormData(filters), new FormData(searchBar));
    }
});

fillMain(mainVetrina);
fillNavigation();