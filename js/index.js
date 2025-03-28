"use strict";

/*
GLOBAL VARIABLES AND DECLARATIONS
*/

/* User information.
Changes during login and logout */
let USER_INFO = null;

/* Associates the href value to the function used to fill the main */
const HREF_TO_MAINFUNCTION = {
    'vetrina' : mainVetrina,
    'login' : mainLogin,
    'registrazione' : mainRegister,
    'catalogo' : mainCatalogo,
    'CRUDProduct' : mainCRUDProduct,
    'productSheet' : mainProductSheet,
    'carrello' : mainCarrello,
    'completeOrder' : mainCompleteOrder,
    'ordini' : mainOrdini,
    'notifiche' : mainNotifiche,
}

/* Associates the form action to the function to call */
const ACTION_TO_FORMSUBMITTER = {
    'registrazione' : registerSubmitter,
    'login' : loginSubmitter,
    'filtra' : productFilterSubmitter,
    'cerca' : productFilterSubmitter,
    'CRUDproduct' : productCRUDSubmitter,
    'CRUDcart' : cartCRUDSubmitter,
    'confirmOrder' : orderSubmitter,
    'updateOrder' : updateOrderSubmitter
}

/* How many products to display in catalogo and the default
URI parameters to get the default catalogo products */
const CATALOGO_CONSTANTS = {
    productsPerPage : 8,
    get defaultFilterOptions() {
        return "minPrice=&maxPrice=&orderBy=popularity&from=0&howMany=" + this.productsPerPage;
    }
}

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
        await fillMain(HREF_TO_MAINFUNCTION["catalogo"]);
        return;
    } else if (e.target.closest("form[action='updateOrder'] input[type='reset']")) {
        const form = e.target.closest("form[action='updateOrder']");
        const datePicker = form.querySelector("input[type='date']");
        datePicker.removeAttribute("value");
        const dateLabel = datePicker.nextElementSibling;
        dateLabel.innerHTML = "";
        return;
    }

    /* closest ensures that the click occurred anywhere inside
    the target element or is the target element itself */
    const link = e.target.closest("a");
    const submit = e.target.closest("form input[type='submit']");

    if (e.target.closest("a[href='expandDetails']")) {
        const detailsBox = (e.target.closest("a[href='expandDetails']").parentNode.parentNode).nextSibling.nextElementSibling;
        const downArrow = (e.target.closest("a[href='expandDetails']")).children[1];
        if (detailsBox.classList.contains("hidden")) {
            downArrow.src = "assets/icons/up-arrow.png";
            detailsBox.classList.remove("hidden");
            detailsBox.classList.add("flex");
        } else {
            downArrow.src = "assets/icons/down-arrow.png";
            detailsBox.classList.remove("flex");
            detailsBox.classList.add("hidden");
        }
        return;
    }

    /* filter box in catalogo can be opened/closed if
    the viewport matches a mobile device (Tailwind uses 768px
    for the "md" breakpoint, matching devices larger than tablets */
    if (e.target.closest("div aside div")
    && document.documentElement.clientWidth < 768) {
        const filterForm = document.querySelector("form");
        const arrowIcon = document.querySelector("div aside div img");
        filterForm.classList.add("animate-open");
        // opens the filter menu
        if (filterForm.classList.contains("hidden")) {
            filterForm.classList.remove("hidden");
            filterForm.classList.add("flex");
            arrowIcon.classList.add("rotate-180");
        // closes the filter menu
        } else {
            filterForm.classList.remove("flex");
            filterForm.classList.add("hidden");
            arrowIcon.classList.remove("rotate-180");
        }
        return;
    } else if (e.target.closest("div aside div")
        && document.documentElement.clientWidth >= 768) {
            filterForm.classList.remove("animate-open");
        return;
    }

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

        document.querySelector("head title").innerHTML = "UniUtils - " + String(hrefValue).charAt(0).toUpperCase() + String(hrefValue).slice(1);
        // Jumps into the catalogo with a category already selected
        if (hrefValue.match(/^catalogo#([0-9]+)$/)) {
            const categoryID = hrefValue.match(/^catalogo#([0-9]+)$/)[1];
            await fillMain(async () => {
                return await HREF_TO_MAINFUNCTION["catalogo"](
                    `${CATALOGO_CONSTANTS.defaultFilterOptions}&categories=${categoryID}`,
                );
            });
            await fillNavigation("catalogo");
        // Jumps into the catalogo at the specified products page
        } else if (hrefValue.match(/^productPage#([0-9]+)$/)) {
            const pageNumber = Number(hrefValue.match(/^productPage#([0-9]+)$/)[1]);
            // user may be changing product page AFTER applying filters
            const [filters, searchBar] = document.querySelectorAll("form");
            await ACTION_TO_FORMSUBMITTER["filtra"](
                new FormData(filters),
                new FormData(searchBar),
                pageNumber
            );
        // User wants to update the product informations
        } else if (hrefValue.match(/^updateProduct#([0-9]+)$/)) {
            const productID = Number(hrefValue.match(/^updateProduct#([0-9]+)$/)[1]);
            await fillMain(async () => {
                return await HREF_TO_MAINFUNCTION["CRUDProduct"](productID);
            });
        } else if (hrefValue.match(/^deleteFromCart#([0-9]+)$/)) {
            await ACTION_TO_FORMSUBMITTER["CRUDcart"](new FormData(), hrefValue);
        } else if (hrefValue.match(/^markNotificationAsRead#([0-9]+)$/)) {
            const notID = Number(hrefValue.match(/^markNotificationAsRead#([0-9]+)$/)[1]);
            await markNotificationAsRead(notID);
        } else if (hrefValue.match(/^deleteNotification#([0-9]+)$/)) {
            const notID = Number(hrefValue.match(/^deleteNotification#([0-9]+)$/)[1]);
            await deleteNotification(notID);
        } else if (hrefValue == "readAllNotifications" || hrefValue == "deleteAllNotifications") {
            await bulkNotificationOp(hrefValue);
        // Links in the format "actionToPerform#selectedID"
        } else if (hrefValue.match(/^([a-zA-Z_-]+)#([0-9]+)$/)) {
            const [, command ,id] = hrefValue.match(/^([a-zA-Z_-]+)#([0-9]+)$/);
            await fillMain(async () => {
                return await HREF_TO_MAINFUNCTION[command](id);
            });  
        // Logs out the user
        } else if (hrefValue == "logout") {
            await logoutUser();
        // Execute the main filler function associated with the link href value
        } else {
            await fillMain(HREF_TO_MAINFUNCTION[hrefValue]);
            await fillNavigation(hrefValue);
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
        case 'CRUDproduct':
            // login, register and the crud product forms have a list to display input errors
            const errorList = document.querySelector("form > ul:last-of-type");
            await action != 'CRUDproduct'
                ? ACTION_TO_FORMSUBMITTER[action](new FormData(form), errorList)
                : ACTION_TO_FORMSUBMITTER[action](new FormData(form), errorList, submit.name);
            break;
        case 'filtra':
        case 'cerca':
            // on submit the data of both the filters and the search bar is sent to the server
            const [filters, searchBar] = document.querySelectorAll("form");
            await ACTION_TO_FORMSUBMITTER[action](
                new FormData(filters),
                new FormData(searchBar),
            );
            break;
        case 'CRUDcart':
            await ACTION_TO_FORMSUBMITTER[action](new FormData(form), submit.name);
            break;
        default:
            await ACTION_TO_FORMSUBMITTER[action](new FormData(form));
    }
});

// FIRST THING TO EXECUTE ON PAGE LOAD
(async () => {
    USER_INFO = await getUserInfo();
    await fillMain(mainVetrina);
    await fillNavigation("vetrina");
})();