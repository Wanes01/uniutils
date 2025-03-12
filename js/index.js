"use strict";

async function apiCaller(apiName) {
    const API_PATH = "./api/";
    const api = API_PATH + apiName;
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

function getDiscount(original, offer) {
    return ((1 - (offer / original)) * 100).toFixed(2);
}

function generateProductPreview(productData) {
    const DESCRIPTION_MAX_CHARS = 40;
    const products = [];

    for (let i = 0; i < productData.length; i++) {
        products.push(
        `<article
            class="flex flex-row md:flex-col gap-2 border-1 border-gray-400 shadow-md shadow-gray-500 py-2 px-2 md:w-1/4">
            <header class="flex items-center justify-center basis-1/3">
                <img class="w-auto md:max-h-40" src="${productData[i].image_name}" alt="${productData[i].title}" />
            </header>
            <div class="flex flex-col w-full h-full">
                <section>
                    <h3 class="font-bold">${productData[i].title}</h3>
                    <p class="font-semibold">€${productData[i].price} <del class="text-red-800">${
                        productData[i].discount_price != null ? "€" + productData[i].discount_price : ""
                    }</del>${
                        productData[i].discount_price != null
                            ? " (-" + getDiscount(productData[i].price, productData[i].discount_price) + "%)"
                            : ""
                    }</p>
                    <p class="mt-3">${
                        productData[i].description.length <= DESCRIPTION_MAX_CHARS
                            ? productData[i].description
                            : productData[i].description.substring(0, DESCRIPTION_MAX_CHARS) + "..."
                    }</p>
                </section>
                <footer class="flex flex-col flex-1 justify-end">
                    <a class="flex items-center justify-center gap-2 border-black border-1 w-full py-1 mt-2 rounded-full"
                        href="#">
                        <img class="w-5 h-5 aspect-square" src="assets/icons/info.png" alt="">
                        Scheda prodotto
                    </a>
                </footer>
            </div>
        </article>`);
    }
    return products;
}

async function mainVetrina() {
    const welcome = `
    <div class="md:px-10 px-2">
    <section class="md:flex md:flex-row">
        <img class="hidden md:inline md:w-1/4 md:object-cover" src="assets/imgs/girl_studying.png" alt="" />
        <div class="flex flex-col justify-center text-center my-3 mx-2 md:w-1/2">
            <h1 class="text-2xl font-bold">Benvenuto su UniUtils! 🎓</h1>
            <p class="text-base/8 mt-2">Un vasto assortimento per studenti e
                docenti, con articoli che vanno dall'
                <a href="#" class="bg-ured p-1 rounded-md">hardware</a>
                avanzato agli strumenti di
                <a href="#" class="bg-uorange p-1 rounded-md">cancelleria</a>,
                fino ai migliori
                <a href="#" class="bg-uyellow p-1 rounded-md">prodotti</a>
                per laboratori, progettazione e studio. Consegna rapida nel campus!
            </p>
        </div>
        <img class="hidden md:inline md:w-1/4 md:object-cover" src="assets/imgs/boy_studying.png" alt="" />
    </section>`;

    let offers = `<!-- Sezione offerte -->
    <section class="mt-3 md:mx-2">
        <h2 class="text-xl font-bold text-center">Offerte che potrebbero interessarti</h2>
        <!-- Product container -->
        <div class="flex flex-col md:flex-row gap-2 mt-2">`;
        
    generateProductPreview(await apiCaller("random-offers.php")).forEach(article => offers += article);
    offers +=     `</div>
    </section>`;

    let mostPurchased = `<!-- Sezione prodotti piú venduti -->
    <section class="mt-6 md:mx-2">
        <h2 class="text-xl font-bold text-center">I piú venduti</h2>
        <!-- Product container -->
        <div class="flex flex-col md:flex-row gap-2 mt-2">`;

    generateProductPreview(await apiCaller("most-purchased.php")).forEach(article => mostPurchased += article);
    mostPurchased +=     `</div>
    </section>
    </div>`;
    return welcome + offers + mostPurchased;
}

async function mainFiller() {
    const main = document.querySelector("main");
    main.innerHTML = await mainVetrina();
}

mainFiller();

/* POPUP HANDLER */
const popupMenuIcon = document.querySelector("body header nav img:last-child");

popupMenuIcon.addEventListener('click', () => {
    const popupMenu = document.querySelector("body header nav:last-child");
    if(popupMenu.classList.contains("hidden")) { // menú is closed
        popupMenu.classList.remove("hidden");
        popupMenu.classList.add("animate-open");
        popupMenuIcon.src = "assets/icons/close.png";
    } else {
        popupMenu.classList.add("hidden");
        popupMenuIcon.src = "assets/icons/menu.png";
    }
});