"use strict";

/* Generic API call */
async function apiCaller(apiName) {
    const api = "./api/" + apiName;
    try {
        const response = await fetch(api);
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
function getDiscount(original, offer) {
    return ((1 - (offer / original)) * 100).toFixed(2);
}

/* Fills the main tag with the result of the given function.
See html-templates.js for the specific functions */
async function mainFiller(mainFunction) {
    const main = document.querySelector("main");
    main.innerHTML = await mainFunction();
}