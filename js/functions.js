"use strict";

/* Generic API call */
async function apiCaller(apiName, requestType = "GET", formData = null) {
    const api = "./api/" + apiName;
    try {
        const response = formData === null
            ? await fetch(api, { method: requestType })
            : await fetch(api, {
                method: requestType,
                body : formData
            })

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        return json;
    } catch (error) {
        console.error(error.message);
    }
}

/* Computes the discount percentage */
function computeDiscount(original, offer) {
    return ((1 - (offer / original)) * 100).toFixed(2);
}

/* Extracts the last name in a path */
function extractLastName(path) {
    return path.match(/([^\/]*)\/*$/)[1];
}

async function getUserInfo() {
    const info = await apiCaller("session-info.php");
    return info;
}

/* Fills the main tag with the result of the given function.
See html-templates.js for the specific functions */
async function fillMain(mainFunction) {
    const main = document.querySelector("main");
    main.innerHTML = await mainFunction();
}

async function fillNavigation(active) {
    const linkList = document.querySelector("body > header > nav:last-of-type > ul");
    const links = USER_INFO.navigation;
    linkList.innerHTML = "";
    links.forEach(link => {
        linkList.innerHTML += generateNavItem(link, active);
    });
}

/* Manages the user registration.
Returns an array with all the errors on the input fields
Returns an empty array if no errors occured */

async function registerSubmitter(formData, errorList) {
    // Attempts to register the user.
    const errors = await apiCaller("register-user.php", "POST", formData);
    /* If any error occurs the user don't get registered
    and all the form errors are shown */
    if (errors.length > 0) {
        errorList.classList.remove("hidden");
        errorList.innerHTML = "";
        errors.forEach(err => {
            const errLine = document.createElement("li");
            errLine.innerText = err;
            errorList.appendChild(errLine);
        });
        errorList.focus();
        return;
    }
    // The registration was successfull. Redirects the user to the login
    await showDisappearingInfoModal(
        "Registrazione avvenuta con successo! Stai per essere rediretto al login ✅", 2500
    )
    fillMain(mainLogin);
    fillNavigation("login");
}

/* Utility function to delay the execution of following code */
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function loginSubmitter(formData, errorList) {
    const response = await apiCaller("login-user.php", "POST", formData);
    // Login failed
    if (!response.success) {
        errorList.classList.remove("hidden");
        errorList.innerHTML = "";
        const errLine = document.createElement("li");
        errLine.innerText = response.message;
        errorList.appendChild(errLine);
        errorList.focus();
        return;
    }
    USER_INFO = await getUserInfo();
    // The registration was successfull. Redirects the user to the login
    await showDisappearingInfoModal(
        "Login avvenuto con successo. Stai per essere rediretto alla Vetrina ✅", 2500
    )
    await fillMain(mainVetrina);
    // the navigation menú changes on login or logout
    await fillNavigation("vetrina");
}

/* Logs the user out. Tells the server to close the session
and resets the interface if succesfull */
async function logoutUser() {
    const response = await apiCaller("logout.php");
    if (response.success) {
        USER_INFO = await getUserInfo();
        await showDisappearingInfoModal("Bye bye! 👋", 2500);
        await fillMain(mainVetrina);
        await fillNavigation("vetrina");
    }
}

function capitalizeFirstLetter(word) {
    return String(word).charAt(0).toUpperCase() + String(word).slice(1);
}

// the filters do not consider the search query 
function productsURIParmsBuilder(formData, page, productsPerPage) {
    const minPrice = Number(formData.get("minPrice"));
    const maxPrice = Number(formData.get("maxPrice"));

    // do nothing if user set a minimum price higher than the max price
    if (minPrice > maxPrice && formData.get("maxPrice") != "") {
        return;
    }

    const categories = []; // group categories id
    formData.keys().forEach(key => {
        if (/^[0-9]\d*$/.test(key)) {
            categories.push(key);
        }
    });

    // mandatory fields
    const fields = {
        minPrice: formData.get("minPrice"),
        maxPrice: formData.get("maxPrice"),
        orderBy: formData.get("orderBy"),
        from: ((page - 1) * productsPerPage),
        howMany: productsPerPage
    };

    // optional fields
    if (formData.has("onlyOffers")) {
        fields.onlyOffers = ""; // this value has no special meaning, onlyOffers just has to be in the object
    }
    if (formData.has("search")) {
        fields.search = formData.get("search");
    }
    if (categories.length > 0) {
        fields.categories = categories;
    }

    return new URLSearchParams(fields).toString();
}

async function productFilterSubmitter(
    filtersData,
    searchData,
    page = 1,
    productsPerPage = CATALOGO_CONSTANTS.productsPerPage) {
    filtersData.append("search", searchData.get("search"));
    const uriParams = productsURIParmsBuilder(filtersData, page, productsPerPage);
    //console.log(uriParams);
    await fillMain(async () => {
        return await mainCatalogo(uriParams, page, productsPerPage);
    });
}

async function getExistingCategories() {
    const categories = await apiCaller("categories-info.php");
    return categories;
}

async function productCRUDSubmitter(formData, errorList, CRUDAction) {
    // updates the formdata in a format easier to handler server side
    const updatedFormData = new FormData();

    // User wants to delete the product. No need to send the remaining form data
    if (CRUDAction.match(/^deleteProduct#([0-9]+)$/)) {
        const productID = Number(CRUDAction.match(/^deleteProduct#([0-9]+)$/)[1]);
        updatedFormData.append("CRUDAction", "deleteProduct");
        updatedFormData.append("id", productID);
        const confirm = await showConfirmationModal("Sei sicuro di voler eliminare questo prodotto?", "⭕ Elimina", "❌ Ci ho ripensato");
        if (confirm) {
            await apiCaller("product-crud.php", "POST", updatedFormData);
            await showDisappearingInfoModal("Operazione avvenuta con successo!", 500);
            await fillMain(mainCatalogo);
        }
        return;
    }

    const categories = []; // group categories id
    formData.keys().forEach(key => {
        if (/^[0-9]\d*$/.test(key)) {
            categories.push(key);
        } else if (key == "newCategories") {
            /* splits new categories by all non digits/letters */
            const newCategories = formData.get(key).match(/\w+/g);
            updatedFormData.append(key, newCategories ? newCategories : "");
        } else {
            updatedFormData.append(key, formData.get(key));
        }
    });
    updatedFormData.append("existingCategories", categories);

    // user is updating a product
    if (CRUDAction.match(/^updateProduct#([0-9]+)$/)) {
        const productID = Number(CRUDAction.match(/^updateProduct#([0-9]+)$/)[1]);
        updatedFormData.append("id", productID);
        updatedFormData.append("CRUDAction", "updateProduct");
        if (updatedFormData.get("image").name == "") {
            updatedFormData.delete("image");
        }
    // user is adding a product
    } else {
        updatedFormData.append("CRUDAction", CRUDAction);
    }

    const errors = await apiCaller("product-crud.php", "POST", updatedFormData);
    
    if (errors.length > 0) {
        errorList.classList.remove("hidden");
        errorList.innerHTML = "";
        errors.forEach(err => {
            const errLine = document.createElement("li");
            errLine.innerText = err;
            errorList.appendChild(errLine);
        });
        errorList.focus();
        return;
    }

    // the crud action was successfull, redirect the user to Catalogo
    await showDisappearingInfoModal("Operazione avvenuta con successo!", 500);
    await fillMain(mainCatalogo);
}

async function cartCRUDSubmitter(formData, submitName) {
    const [, action ,productID] = submitName.match(/^([a-zA-Z_-]+)#([0-9]+)$/);
    formData.append("productID", productID);
    formData.append("action", action);
    const result = await apiCaller("cart-crud.php", "POST", formData);
    if (action == "deleteFromCart") {
        await fillMain(mainCarrello);
    } else if (result.success) {
        await showDisappearingInfoModal("Prodotto aggiunto al carrello. Continua a fare acquisti!", 1000);
        await fillMain(mainCatalogo);
        await fillNavigation("catalogo");
    }
}

async function orderSubmitter(formData) {
    const confirm = await showConfirmationModal("Vuoi pagare e confermare l'ordine?", "Si", "No");
    if (!confirm) {
        await fillMain(mainCarrello);
        await fillNavigation("carrello");
        return;
    }
    const result = await apiCaller("place-order.php", "POST", formData);
    await showDisappearingInfoModal(
        result.success ? "✅ Ordine ricevuto! Controlla lo stato del tuo ordine" : "Si é verificato un errore ❌",
        2000);
    fillMain(mainOrdini);
    fillNavigation("ordini");
}

function formatMySQLTimestamp(timestamp) {
    const frag = timestamp.split(/[- :]/);
    return `${frag[2]}/${frag[1]}/${frag[0]}`;
}

function formatMySQLTimestampWithTime(timestamp) {
    const frag = timestamp.split(/[- :]/);
    return `${frag[2]}/${frag[1]}/${frag[0]} alle ${frag[3]}:${frag[4]}`;
}

function shortenDescription(description) {
    const DESCRIPTION_PREVIEW_MAX_CHARS = 100;
    return description.length <= DESCRIPTION_PREVIEW_MAX_CHARS
        ? description
        : description.substring(0, DESCRIPTION_PREVIEW_MAX_CHARS) + "...";
}

function italianDateFormat(isoDate, orderID) {
    if (!isoDate) {
        return;
    };
    const date = new Date(isoDate);
    const itFormat = date.toLocaleDateString("it-IT"); // DD/MM/YYYY date format
    const dateDisplayer = document.getElementById(`deliveryDate#${orderID}`).nextElementSibling;
    dateDisplayer.innerHTML = "Data di consegna: " + itFormat;
}

async function updateOrderSubmitter(formData) {
    const updatedFormData = new FormData();
    for (const [key, value] of formData) {
        const [, param ,id] = key.match(/^([a-zA-Z_-]+)#([0-9]+)$/);
        updatedFormData.append(param, value);
        if (!updatedFormData.has("orderID")) {
            updatedFormData.append("orderID", id);
        }
    }
    
    const response = await apiCaller("update-order.php", "POST", updatedFormData);

    if (response.success) {
        await fillMain(mainOrdini);
    }
}

async function markNotificationAsRead(notificationID) {
    const result = await apiCaller(`mark-as-read.php?id=${notificationID}`);
    if (result.success) {
        await fillMain(mainNotifiche);
    }
}

async function deleteNotification(notificationID) {
    const result = await apiCaller(`delete-notification.php?id=${notificationID}`);
    if (result.success) {
        await fillMain(mainNotifiche);
    }
}

async function bulkNotificationOp(operation) {
    const confirm = await showConfirmationModal(
        `Sei sicuro di voler ${operation == "readAllNotifications" ? "leggere" : "cancellare"} tutte le notifiche?`,
        "Si, voglio procedere.",
        "No, ci ho ripensato"
    );
    
    if (!confirm) {
        return;
    }

    const result = await apiCaller(`bulk-notifications.php?op=${operation == "readAllNotifications" ? "read" : "delete"}`);
    if (result.success) {
        await fillMain(mainNotifiche);
    }
}

async function sendNotificationSubmitter(formData, errorList) {
    // Confirms the vendor choise of sending a notification to all customers
    if (USER_INFO.loggedIn && !USER_INFO.user.isCustomer && formData.get("user") === "all") {
        const confirm = await showConfirmationModal(
            "⚠️ ATTENZIONE! La notifica verrá ricevuta da tutti i clienti. Sei sicuro della scelta del destinatario?",
            "Si, mandala a tutti.",
            "No, ci ho ripensato."
        );
        if (!confirm) {
            return;
        }
    }

    const errors = await apiCaller("send-notification.php", "POST", formData);
    
    if (errors.length > 0) {
        errorList.classList.remove("hidden");
        errorList.innerHTML = "";
        errors.forEach(err => {
            const errLine = document.createElement("li");
            errLine.innerText = err;
            errorList.appendChild(errLine);
        });
        errorList.focus();
        return;
    }

    await showDisappearingInfoModal("✅ La notifica é stata correttamente inviata!", 2000);
    fillMain(mainContatti);
}

/* Swaps the two classes if the specified DOM element.
Returns true if the firstClass was set, false otherwise */
function swapElementClasses(element, firstClass, secondClass) {
    if (element.classList.contains(firstClass)) {
        element.classList.remove(firstClass);
        element.classList.add(secondClass);
        return true;
    }
    element.classList.remove(secondClass);
    element.classList.add(firstClass);
    return false;
}

function changePreviewCartPrice(quantity, price) {
    const preview = document.querySelector("div form p");
    preview.innerHTML = `Prezzo bloccato nel carrello: €${(quantity * price).toFixed(2)}`;
}