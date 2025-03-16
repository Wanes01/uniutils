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

/* Fills the main tag with the result of the given function.
See html-templates.js for the specific functions */
async function fillMain(mainFunction) {
    const main = document.querySelector("main");
    main.innerHTML = await mainFunction();
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
        return;
    }
    // The registration was successfull. Redirects the user to the login
    await showDisappearingInfoModal(
        "Registrazione avvenuta con successo! Stai per essere rediretto al login ✅", 5000
    )
    fillMain(mainLogin);
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
        return;
    }
    // The registration was successfull. Redirects the user to the login
    await showDisappearingInfoModal(
        "Login avvenuto con successo. Stai per essere rediretto alla Vetrina ✅", 5000
    )
    fillMain(mainVetrina);
}