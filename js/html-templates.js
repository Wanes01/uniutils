"use strict";

function generateProductPreview(productData, wClass, heading) {
    const DESCRIPTION_PREVIEW_MAX_CHARS = 100;
    const products = [];

    for (let i = 0; i < productData.length; i++) {
        products.push(
        `<article
            aria-labelledby="article-title${productData[i].id}${i}" class="flex flex-row md:flex-col gap-2 border-1 ${wClass} border-gray-400 shadow-md shadow-gray-500 py-2 px-2 rounded-sm">
            <header class="flex items-center justify-center basis-1/3">
                <img class="w-auto md:max-h-40" src="${productData[i].image_name}" alt="${productData[i].title}" />
            </header>
            <div class="flex flex-col w-full grow">
                <section>
                    <!-- id for aria-label -->
                    <${heading} id="article-title${productData[i].id}${i}" class="font-bold">${productData[i].title}</${heading}>
                    <p class="font-semibold">€${productData[i].discount_price ? productData[i].discount_price : productData[i].price} <del class="text-red-800">${
                        productData[i].discount_price != null ? "€" + productData[i].price : ""
                    }</del>${
                        productData[i].discount_price != null
                            ? " (-" + computeDiscount(productData[i].price, productData[i].discount_price) + "%)"
                            : ""
                    }</p>
                    <p class="mt-3">${
                        productData[i].description.length <= DESCRIPTION_PREVIEW_MAX_CHARS
                            ? productData[i].description
                            : productData[i].description.substring(0, DESCRIPTION_PREVIEW_MAX_CHARS) + "..."
                    }</p>
                </section>
                <footer class="flex-1 flex flex-col justify-end">
                    <ul class="flex flex-col justify-end">
                        <li>
                            <a class="flex items-center justify-center gap-2 border-black border-1 w-full py-1 mt-2 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800"
                                href="productSheet#${productData[i].id}">
                                <img class="w-5 h-5 aspect-square" src="assets/icons/info.png" alt="Scheda prodotto" />
                                Scheda prodotto
                            </a>
                        </li>
                        ${(() => {
                            // UPDATE BUTTON. Only the vendor can see it
                            if (USER_INFO.loggedIn && !USER_INFO.user.isCustomer) {
                                return `
                                <li>
                                    <a class="flex items-center justify-center gap-2 border-black border-1 w-full py-1 mt-2 rounded-full
                                    active:inset-shadow-sm active:inset-shadow-gray-800 bg-ulorange"
                                        href="updateProduct#${productData[i].id}">
                                        <img class="w-5 h-5 aspect-square" src="assets/icons/edit.png" alt="Modifica prodotto" />
                                        Modifica prodotto
                                    </a>
                                </li>`;
                            }
                            return "";
                        })()}
                    </ul>
                </footer>
            </div>
        </article>`);
    }
    return products;
}

async function mainVetrina() {
    const userInfo = await getUserInfo();
    return `
    <div class="md:px-10 px-2 mb-7 min-h-[80vh]">
    <section class="md:flex md:flex-row">
        <img class="hidden md:inline md:w-1/4 md:object-cover" src="assets/imgs/girl_studying.png" alt="" />
        <div class="flex flex-col justify-center text-center my-3 mx-2 md:w-1/2">
            <h1 class="text-2xl font-bold">${
                userInfo.loggedIn ? `Bentornato ${userInfo.user.name}! 👋` : "Benvenuto su UniUtils! 🎓" 
            }</h1>
            <p class="text-base/8 mt-2">${
                (!userInfo.loggedIn || userInfo.user.isCustomer)
                    ? `Per te un vasto assortimento per studenti e
                docenti, con articoli che vanno dall'
                <a href="catalogo#1" class="bg-ured p-1 rounded-md underline">hardware</a>
                avanzato agli strumenti di
                <a href="catalogo#5" class="bg-uorange p-1 rounded-md underline">cancelleria</a>,
                fino ai migliori
                <a href="catalogo" class="bg-uyellow p-1 rounded-md underline">prodotti</a>
                per laboratori, progettazione e studio. Consegna rapida nel campus!`
                    : `Gestisci i prodotti in vendita nel
                <a href="catalogo" class="bg-ured p-1 rounded-md underline">catalogo</a>
                e gestisci gli
                <a href="ordini" class="bg-uorange p-1 rounded-md underline">ordini</a>
                avviati dai clienti nelle apposite pagine.`
            }
            </p>
        </div>
        <img class="hidden md:inline md:w-1/4 md:object-cover" src="assets/imgs/boy_studying.png" alt="" />
    </section>
    <!-- Sezione offerte -->
    <section class="mt-3 md:mx-2">
        <h2 class="text-xl font-bold text-center">${
            (!userInfo.loggedIn || userInfo.user.isCustomer)
                ? "Offerte che potrebbero interessarti"
                : "Alcune offerte attive suoi tuoi prodotti"
        }</h2>
        <!-- Product container -->
        <div class="flex flex-col md:flex-row gap-2 mt-2">
            ${await (async () => {
                let previews = "";
                const productData = await apiCaller(
                    "filtered-products.php?minPrice=&maxPrice=&orderBy=random&from=0&howMany=4&onlyOffers="
                );
                generateProductPreview(productData, "md:w-1/4", "h3").forEach(article => previews += article);
                return previews;
            })()}
         </div>
    </section>
    <!-- Sezione prodotti piú venduti -->
    <section class="mt-6 md:mx-2">
        <h2 class="text-xl font-bold text-center">I piú venduti</h2>
        <!-- Product container -->
        <div class="flex flex-col md:flex-row gap-2 mt-2">
            ${await (async () => {
                let previews = "";
                const productData = await apiCaller(
                    "filtered-products.php?minPrice=&maxPrice=&orderBy=popularity&from=0&howMany=4"
                );
                generateProductPreview(productData, "md:w-1/4", "h3").forEach(article => previews += article);
                return previews;
            })()}
        </div>
    </section>
    </div>`;
}

function generateNavItem(linkTitle, active) {
    return `<li class="w-full border-b-3 border-gray-300 md:rounded-sm active:inset-shadow-xs active:inset-shadow-gray-600 ${
        (() => {
            if (linkTitle == "Login") {
                return active == "login"
                    ? "md:last:border-udred text-udred md:w-auto md:bg-ulyellow"
                    : `md:last:border-udred text-udred md:w-auto
                    md:hover:bg-gradient-to-t md:hover:from-ulyellow md:hover:via-white md:hover:via-80% md:hover:to-white`;
            } else {
                //w-3 h-3 md:mb-0.5
                return active == linkTitle.toLowerCase()
                    ? "md:border-b-black md:w-auto md:bg-usky"
                    : `md:hover:border-b-black md:w-auto
                    md:hover:bg-gradient-to-t md:hover:from-usky md:hover:via-white md:hover:via-80% md:hover:to-white`;
            }
        })()}"><a class="flex flex-row gap-1 md:py-1 md:px-2 py-6 w-full justify-center items-center font-bold" href="${linkTitle.toLowerCase()}">
                <img src="assets/icons/${linkTitle.toLowerCase()}.png" alt="${linkTitle}" class="w-3 h-3 md:mb-0.5" />
                <p>${linkTitle} ${(() => {
                    if (linkTitle === "Notifiche") {
                        const numberSpan = document.querySelector("nav ul li a[href='notifiche'] p span");
                        return numberSpan
                            ? numberSpan.outerHTML
                            : `<span class="hidden text-sm py-0.5 px-2 aspect-square rounded-full bg-radial from-uyellow from-10% to-ured shadow shadow-white font-bold"></span>`;
                    }
                    return "";
                })()}</p>
                </a></li>`;
}

function mainLogin() {
    return `        <!-- Background image flex div -->
        <div
            class="flex flex-col justify-center items-center bg-[url(../assets/imgs/login_background.jpg)] bg-cover bg-right md:bg-bottom bg-no-repeat w-full h-[90vh] py-3">
            <!-- Actual card -->
            <div
                class="flex flex-col md:flex-row w-5/6 md:w-2/3 m-3 bg-white shadow-[0px_0px_30px_5px_#6C1100] border-1 border-black rounded-sm">
                <section class="flex flex-col items-center p-3 md:p-6 md:w-1/2">
                    <h1 class="font-bold text-xl">Login</h1>
                    <form action="login" class="flex flex-col w-full px-3 md:mt-4">
                        <fieldset class="flex flex-col min-w-0">
                            <legend class="invisible h-0">Credenziali</legend>
                            <label for="email" class="mt-3 md:mt-6">Email</label>
                            <input type="email" name="email" id="email" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                            <label for="password" class="mt-3 md:mt-6">Password</label>
                            <input type="password" name="password" id="password" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                        </fieldset>
                        <ul aria-live="assertive" tabindex="-1" class="hidden list-disc list-inside mt-6 text-red-700 text-clip md:col-span-2">
                        </ul>
                        <input type="submit" name="login" value="Accedi"
                            class="cursor-pointer border-1 border-black mt-6 md:mt-12 mb-3 py-1 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800" />
                    </form>
                </section>
                <section class="flex flex-col px-2 md:h-full md:w-1/2 justify-center items-center h-40 bg-[#FF6142]">
                    <h2 class="font-bold text-center">Sei nuovo da queste parti?<br/>
                        Unisciti a noi!</h2>
                    <a href="registrazione"
                        class="bg-white px-5 py-2 rounded-full mt-2 border-1 border-black active:inset-shadow-sm active:inset-shadow-gray-800">Registrati</a>
                </section>
            </div>
        </div>`;
}

function mainRegister() {
    return `
     <!-- Background image flex div -->
        <div
            class="flex flex-col justify-center items-center bg-[url(../assets/imgs/login_background.jpg)] bg-cover bg-right md:bg-bottom bg-no-repeat w-full h-[90vh] py-3">
            <!-- Actual card -->
            <div class="flex flex-col items-center justify-center w-5/6 md:w-2/3 lg:w-4/7 m-3 bg-white
                shadow-[0px_0px_30px_5px_#6C1100] border-1 border-black rounded-sm p-3 md:px-5">
                <h1 class="font-bold text-xl">Registrazione</h1>
                <form action="registrazione" class="flex flex-col w-full">
                    <fieldset class="md:grid md:grid-cols-2 md:gap-x-4 min-w-0">
                    <!-- Hidden from visualization but still visible to screen readers -->
                        <legend class="invisible h-0">Anagrafica</legend>
                        <p class="flex flex-col justify-center">
                            <label for="name" class="mt-3 md:mt-6">Nome</label>
                            <input type="text" name="name" id="name" maxlength="100" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                        </p>
                        <p class="flex flex-col justify-center">
                            <label for="surname" class="mt-3 md:mt-6">Cognome</label>
                            <input type="text" name="surname" id="surname" maxlength="100" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                        </p>
                        <p class="flex flex-col justify-center md:col-span-2">
                            <label for="address" class="mt-3 md:mt-6">Indirizzo</label>
                            <input type="text" name="address" id="address" maxlength="100" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                        </p>
                    </fieldset>
                    <fieldset class="md:grid md:grid-cols-2 md:gap-x-4 min-w-0">
                    <!-- Hidden from visualization but still visible to screen readers -->
                        <legend class="invisible h-0">Credenziali</legend>
                        <p class="flex flex-col justify-center">
                            <label for="email" class="mt-3 md:mt-6">Email</label>
                            <input type="email" name="email" id="email" maxlength="100" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                        </p>
                        <p class="flex flex-col justify-center">
                            <label for="username" class="mt-3 md:mt-6">Username</label>
                            <input type="text" name="username" id="username" maxlength="100" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                        </p>
                        <p class="flex flex-col justify-center">
                            <label for="password" class="mt-3 md:mt-6">Password</label>
                            <input type="password" name="password" id="password" minlength="8" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                        </p>
                        <p class="flex flex-col justify-center">
                            <label for="passwordCheck" class="mt-3 md:mt-6">Ripeti la password</label>
                            <input type="password" name="passwordCheck" id="passwordCheck" minlength="8" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                        </p>
                    </fieldset>
                    <ul aria-live="assertive" tabindex="-1" class="hidden list-disc list-inside mt-6 text-red-700 text-clip md:col-span-2">
                    </ul>
                    <input type="submit" name="registrazione" value="Registrati"
                        class="md:col-span-2 cursor-pointer border-1 border-black mt-6 md:mt-12 mb-3 py-1 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800" />
                </form>
            </div>
        </div>`;
}

async function mainCatalogo(
    uriParams = CATALOGO_CONSTANTS.defaultFilterOptions,
    activePage = 1,
    productsPerPage = CATALOGO_CONSTANTS.productsPerPage) {
    return `
        <!-- Div per lo stile del page flow -->
    <h1 class="text-center text-xl font-bold mb-5">Prodotti del catalogo</h1>
    <div class="flex flex-col md:flex-row m-2 md:ml-2 md:mr-5 gap-5">
        <!-- Sidebar con i filtri di ricerca -->
        <aside class="border-gray-400 border-1 md:border-0 rounded-md px-2 py-1 md:w-7/24">
            <!-- can be clicked to expand on mobile viewport -->
            <div id="toggleFilters" role="button" tabindex="0" aria-expanded="false" aria-controls="filtersPanel" class="flex flex-row items-center justify-center gap-3">
                <h2 class="font-semibold text-center md:text-lg">Filtri</h2>
                <img src="assets/icons/down-arrow.png" alt="Apri/chiudi filtri"
                class="w-4 h-4 md:hidden" />
            </div>
            <!-- flex / hidden (hidden in versione mobile) -->
            <form id="filtersPanel" aria-hidden="true" action="filtra" class="px-2 py-1 hidden md:flex flex-col gap-5">
                <fieldset class="border border-solid border-gray-400 p-3 rounded-sm">
                    <legend class="font-medium">Prezzo</legend>
                    <ul class="flex flex-col gap-2">
                        <li class="flex flex-row gap-1">
                            <label for="minPrice">Minimo €</label>
                            <input type="number" name="minPrice" id="minPrice" min="0.01" step=".01"
                                ${(() => {
                                    // regular expression to check if minPrice is used or not
                                    const regex = /minPrice=([^&]*)(?:&|$)/;
                                    const match = uriParams.match(regex);
                                    return match && match[1] ? `value="${match[1]}"` : "";
                                })()}
                                class="border-black border-1 rounded-sm w-24 px-1
                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </li>
                        <li class="flex flex-row gap-1">
                            <label for="maxPrice">Massimo €</label>
                            <input type="number" name="maxPrice" id="maxPrice" min="0.01" step=".01"
                                ${(() => {
                                    // regular expression to check if maxPrice is used or not
                                    const regex = /maxPrice=([^&]*)(?:&|$)/;
                                    const match = uriParams.match(regex);
                                    return match && match[1] ? `value="${match[1]}"` : "";
                                })()}
                                class="border-black border-1 rounded-sm w-24 px-1
                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        </li>
                        <li class="flex flex-row gap-1">
                            <label for="onlyOffers">Mostra solo offerte</label>
                            <input type="checkbox" name="onlyOffers" id="onlyOffers" class="w-4 accent-ured"
                            ${uriParams.includes("onlyOffers") ? `checked` : ""} />
                        </li>
                    </ul>
                </fieldset>
                <fieldset class="border border-solid border-gray-400 p-3 rounded-sm">
                    <legend class="font-medium">Categorie</legend>
                    <ul class="flex flex-col gap-2">
                        ${await (async () => {
                            // the previously used categories id
                            let previewsCategories = [];
                            const match = uriParams.match(/categories=([^&]+)(?:&|$)/);
                            if (match && match[1]) {
                                /*
                                The URI builder separates categories by putting "," between them,
                                encoded as "%2C"
                                */
                                previewsCategories = match[1].split("%2C");
                            } 
                            let categories = "";
                            const categoriesData = await getExistingCategories();
                            categoriesData.forEach(category => {
                                categories +=
                                `
                                <li class="flex flex-row gap-2">
                                    <input type="checkbox" name="${category.id}" id="category${category.id}" class="w-4 accent-ured"
                                     ${previewsCategories.includes((category.id).toString()) ? `checked` : ""} />
                                    <label for="category${category.id}">${category.name}</label>
                                </li>
                                `
                            });
                            return categories;
                        })()}
                    </ul>
                </fieldset>
                <fieldset class="border border-solid border-gray-400 p-3 rounded-sm">
                    <legend class="font-medium">Ordina per</legend>
                    <ul class="flex flex-col gap-y-2">
                        <li>
                            <input type="radio" name="orderBy" id="popularity" value="popularity"
                            ${uriParams.includes("orderBy=popularity") ? `checked` : ""}
                            class="w-4 accent-ured" />
                            <label for="popularity">Popolaritá</label>
                        </li>
                        <li>
                            <input type="radio" name="orderBy" id="decreasingPrice" value="decreasingPrice"
                            ${uriParams.includes("orderBy=decreasingPrice") ? `checked` : ""}
                            class="w-4 accent-ured" />
                            <label for="decreasingPrice">Prezzo decrescente</label>
                        </li>
                        <li>
                            <input type="radio" name="orderBy" id="increasingPrice" value="increasingPrice"
                            ${uriParams.includes("orderBy=increasingPrice") ? `checked` : ""}
                            class="w-4 accent-ured" />
                            <label for="increasingPrice">Prezzo crescente</label>
                        </li>
                        <li>
                            <input type="radio" name="orderBy" id="random" value="random"
                            ${uriParams.includes("orderBy=random") ? `checked` : ""}
                            class="w-4 accent-ured" />
                            <label for="random">Casuale</label>
                        </li>
                    </ul>
                </fieldset>
                <input type="submit" value="Applica filtri"
                    class="cursor-pointer border-1 border-gray-500 bg-ulred py-1 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800" />
                <div class="w-full flex flex-col">
                    <label for="resetFilters" class="invisible h-0 w-0">Reimposta filtri</label>
                    <input id="resetFilters" type="reset" value="Reimposta filtri"
                        class="cursor-pointer border-1 border-gray-500 py-1 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800" />
                </div>
            </form>
        </aside>
        <div class="w-full flex flex-col gap-5">
            <header class="flex flex-col md:flex-row gap-5">
                <form action="cerca" class="flex flex-col md:flex-row md:items-center md:gap-2 md:grow">
                    <label for="search">Cerca per nome/descrizione</label>
                    <div class="flex flex-row flex-1">
                        <input type="search" name="search" id="search" autocomplete="off"
                            ${(() => {
                                const match = uriParams.match(/search=([^&]+)(?:&|$)/);
                                return match && match[1] ? `value="${match[1]}"` : " ";
                            })()}
                            class="w-full rounded-l-full px-3 py-1 border-1 border-r-0 border-gray-400"
                            placeholder="Nome prodotto / descrizione prodotto" />
                        <input type="submit" value="Cerca" class="cursor-pointer rounded-r-full px-4 py-1 border-1 border-l-0 border-ured
                            bg-ured active:inset-shadow-sm active:inset-shadow-gray-800 font-medium" />
                    </div>
                </form>
                ${(() => {
                    // ADD PRODUCT BUTTON (vendor only)
                    // logged in as customer
                    if (USER_INFO.loggedIn && !USER_INFO.user.isCustomer) {
                        return `
                        <a href="CRUDProduct" class="flex flex-row justify-center items-center gap-2
                        font-semibold bg-ugreen py-2 md:px-3 rounded-full text-center active:inset-shadow-sm active:inset-shadow-gray-800">
                            Aggiungi prodotto
                            <img src="assets/icons/add.png" class="w-4 h-4" alt="Aggiungi prodotto" />
                        </a>
                        `
                    }
                    return "";
                })()}
            </header>
            <div class="flex flex-col gap-3 py-5 md:grid md:grid-cols-4 md:grid-rows-2 md:grow">
            ${await (async () => {
                let previews = "";
                const productData = await apiCaller(`filtered-products.php?${uriParams}`);
                generateProductPreview(productData, "", "h2").forEach(article => previews += article);
                return previews;
            })()}
            </div>
            <!-- Multipagina -->
            <footer class="flex flex-row justify-center">
                <ul class="w-auto flex flex-row justify-center border-1 rounded-md">
                ${await (async () => {
                    const totalProducts = (await apiCaller(
                        `filtered-products.php?${uriParams}&count=`
                    ))[0].count;
                    const totalPages = Math.ceil(totalProducts / productsPerPage);
                    let numbers = "";
                    for (let i = 1; i <= totalPages; i++) {
                        numbers += `
                        <li>
                            <a href="productPage#${i}" class="block ${
                            activePage == i ? "bg-ulred" : ""
                            } font-semibold text-xl py-2 px-4 ${
                            i < totalPages ? "border-r-1" : "" }">${i}</a>
                        </li>`;
                    }
                    return numbers;
                })()} 
                </ul>
            </footer>
        </div>
    </div>`;
}

async function mainCRUDProduct(productID = null) {
    // data used to fill the form for product update
    const productData = productID
        ? await apiCaller(`product-by-id.php?id=${productID}`)
        : null;
    return `
            <div class="px-2 py-3 flex flex-col justify-center items-center gap-3">
            <section>
                <form action="CRUDproduct" class="flex flex-col w-full p-3 gap-4 rounded-md">
                    <header class="text-center">
                        <h1 class="font-bold text-xl">${productData && productData.success ? "Modifica prodotto" : "Aggiungi prodotto"}</h1>
                    </header>
                    <fieldset class="border-1 border-gray-400 p-3 rounded-md">
                        <legend class="font-medium">Criteri di ricerca</legend>
                        <ul class="flex flex-col gap-3">
                            <li>
                                <div class="flex flex-row items-center gap-2">
                                    <label for="title">Titolo</label>
                                    <img src="assets/icons/required.png" alt="campo obbligatorio" class="w-4 h-4" />
                                </div>
                                <input type="text" name="title" id="title" required autocomplete="off" maxlength="255"
                                    ${(() => {
                                        return productData && productData.success
                                            ? `value="${productData.product.title}"`
                                            : ""
                                    })()}
                                    class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50 w-full" />
                            </li>
                            <li>
                                <div class="flex flex-row items-center gap-2">
                                    <label for="description">Descrizione</label>
                                    <img src="assets/icons/required.png" alt="campo obbligatorio" class="w-4 h-4" />
                                </div>
                                <textarea name="description" id="description" required autocomplete="off" maxlength="10000"
                                    class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50 resize-none h-100 overscroll-y-contain w-full"
                                    >${(() => {
                                        return productData && productData.success
                                            ? productData.product.description
                                            : ""
                                    })()}</textarea>
                            </li>
                        </ul>
                    </fieldset>
                    <fieldset class="border-1 border-gray-400 p-3 rounded-md">
                        <legend class="font-medium">Prezzo</legend>
                        <ul class="grid grid-cols-2 gap-4">
                            <li>
                                <div class="flex flex-row items-center gap-2">
                                    <label for="price">Prezzo intero in €</label>
                                    <img src="assets/icons/required.png" alt="campo obbligatorio" class="w-4 h-4" />
                                </div>
                                <input type="number" name="price" id="price" required autocomplete="off" min="0.01" max="99999999.99" step=".01" 
                                    ${(() => {
                                        return productData && productData.success
                                            ? `value="${productData.product.price}"`
                                            : ""
                                    })()}
                                    class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50 w-full
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            </li>
                            <li>
                                <label for="discountPrice">Prezzo scontato in €</label>
                                <input type="number" name="discountPrice" id="discountPrice" autocomplete="off" min="0.01" step=".01" max="99999999.99" 
                                    ${(() => {
                                        return productData && productData.success && productData.product.discount_price
                                            ? `value="${productData.product.discount_price}"`
                                            : ""
                                    })()}
                                    class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50 w-full
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            </li>
                        </ul>
                    </fieldset>
                    <fieldset class="flex flex-col gap-2 border-1 border-gray-400 p-3 rounded-md">
                        <legend class="font-medium">Categorie</legend>
                        <div class="grid grid-cols-8 md:grid-cols-2 gap-x-2">
                            <strong class="col-span-7 md:col-span-1">Inserire minimo una categoria tra quelle esistenti
                                e quelle
                                nuove</strong>
                            <img src="assets/icons/required.png" alt="categoria obbligatoria"
                                class="w-4 h-4 self-center md:justify-self-start" />
                        </div>
                        <ul class="grid grid-cols-2 md:grid-cols-3 gap-y-2">
                        ${await (async () => {
                            let categories = "";
                            const categData = await getExistingCategories();
                            categData.forEach(category => {
                                categories +=
                                `
                                <li class="flex flex-row gap-2">
                                    <input type="checkbox" name="${category.id}" id="category${category.id}" 
                                    ${productData && productData.success && (productData.product.category_ids).includes(category.id.toString())
                                        ? 'checked'
                                        : ""} class="w-4 accent-ured" />
                                    <label for="category${category.id}">${category.name}</label>
                                </li>
                                `
                            });
                            return categories;
                        })()}
                        </ul>
                        <label for="newCategories" class="mt-2">Nuove categorie. Se presenti, separarle con degli spazi o delle andate a capo.</label>
                        <textarea name="newCategories" id="newCategories" autocomplete="off" maxlength="500" placeholder="ESEMPIO:Categoria1 Categoria2 Categoria3" class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50 resize-none h-30 overscroll-y-contain w-full"></textarea>
                    </fieldset>
                    <fieldset class="border-1 border-gray-400 p-3 rounded-md">
                        <legend class="font-medium">Dettagli</legend>
                        <ul class="grid grid-cols-2 gap-4">
                            <li>
                                <div class="flex flex-row items-center gap-2">
                                    <label for="quantity">Quantitá</label>
                                    <img src="assets/icons/required.png" alt="campo obbligatorio" class="w-4 h-4" />
                                </div>
                                <input type="number" name="quantity" id="quantity" required autocomplete="off" min="1" max="99999999" step="1" 
                                    ${(() => {
                                        return productData && productData.success
                                            ? `value="${productData.product.quantity_available}"`
                                            : ""
                                    })()}
                                    class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50 w-full
                                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                            </li>
                            <li>
                                <div class="flex flex-row items-center gap-2">
                                    <label for="image">${productData && productData.success ? "Cambia immagine" : "Immagine"}</label>
                                    ${(() => {
                                        // the image is optional on update
                                        return productData && productData.success
                                            ? ""
                                            : `<img src="assets/icons/required.png" alt="campo obbligatorio" class="w-4 h-4" />`
                                    })()}
                                </div>
                                <input type="file" name="image" id="image" ${
                                    productData && productData.success
                                        ? ""
                                        : "required"
                                    } 
                                    class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50 w-full"
                                    accept=".jpg, .jpeg, .png" />
                            </li>
                        </ul>
                    </fieldset>
                    <div class="flex flex-row items-center gap-2">
                        <img src="assets/icons/required.png" alt="campo obbligatorio" class="w-4 h-4" />
                        <strong>= CAMPO OBBLIGATORIO</strong>
                    </div>
                    <ul aria-live="assertive" tabindex="-1" class="hidden list-disc list-inside mt-6 text-red-700 text-clip md:col-span-2">
                    </ul>
                    <footer class="flex flex-col md:flex-row gap-3">
                        ${(() => {
                            // the image is optional on update
                            return productData && productData.success
                                ? `<input type="submit" value="Applica modifiche ☑️" name="updateProduct#${productID}"
                            class="grow cursor-pointer active:inset-shadow-sm active:inset-shadow-gray-800 font-semibold bg-ugreen py-2 md:px-3 rounded-full border-1 border-black mt-3" />
                            <input type="submit" value="Elimina prodotto ❌" name="deleteProduct#${productID}"
                            class="grow cursor-pointer active:inset-shadow-sm active:inset-shadow-gray-800 font-semibold bg-ulred py-2 md:px-3 rounded-full border-1 border-black mt-3" />`
                                : `<input type="submit" value="Aggiungi prodotto ➕" name="addProduct"
                            class="grow cursor-pointer active:inset-shadow-sm active:inset-shadow-gray-800 font-semibold bg-ugreen py-2 md:px-3 rounded-full border-1 border-black mt-3" />`
                        })()}
                    </footer>
                </form>
            </section>
        </div>
    `
}

async function showDisappearingInfoModal(message, time) {
    const div = document.querySelector("main > div");
    div.classList.add("blur-sm");

    const modal = document.createElement("div");
    // aria attributes for accessibility
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-describedby", "popupDesc");

    modal.className = `fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2
    py-8 px-10 text-center rounded-md bg-white border-1 border-gray-400 flex flex-row font-medium
    shadow-xl shadow-gray-800`;
    modal.innerHTML = `<p id="popupDesc" tabindex="-1">${message}</p>`;
    
    document.querySelector("main").appendChild(modal);
    modal.querySelector("p").focus();

    await sleep(time);
    div.classList.remove("blur-sm");
}

async function showConfirmationModal(message, agreeMessage, disagreeMessage) {
    return new Promise((resolve) => {
        const main = document.querySelector("main");
        const div = main.querySelector("div");
        div.classList.add("blur-sm");
    
        // Creazione del modal
        const modal = document.createElement("div");
        // aria attributes for accessibility
        modal.setAttribute("role", "dialog");
        modal.setAttribute("aria-modal", "true");
        modal.setAttribute("aria-describedby", "popupDesc");

        modal.className = `fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2
            py-8 px-10 text-center rounded-md bg-white border-1 border-gray-400 flex flex-col font-medium justify-center items-center
            shadow-xl shadow-gray-800`;
        modal.innerHTML = `<p id="popupDesc" tabindex="-1" class="text-red-700 font-semibold">${message}</p>
            <div class="flex flex-col md:flex-row gap-4 mt-6">
                <button class="cursor-pointer px-6 py-2 border-3 border-green-700 text-green-700 bg-green-100 rounded-full grow 
                active:inset-shadow-sm active:inset-shadow-gray-800">${agreeMessage}</button>
                <button class="cursor-pointer px-6 py-2 border-2 border-red-700 text-red-700 bg-red-100 rounded-full grow 
                active:inset-shadow-sm active:inset-shadow-gray-800">${disagreeMessage}</button>
            </div>`;
            
        main.appendChild(modal);
        modal.querySelector("p").focus();
    
        // AGREE BUTTON HANDLER
        document.querySelector("button:nth-child(1)").addEventListener('click', function() {
            closeModal();
            resolve(true);
        });
    
        // DISAGREE BUTTON HANDLER
        document.querySelector("button:nth-child(2)").addEventListener('click', function() {
            closeModal();
            resolve(false);
        });
    
        function closeModal() {
            modal.remove();
            div.classList.remove("blur-sm");
        }
    });
}

async function mainProductSheet(productID) {
    const product = (await apiCaller(`product-by-id.php?id=${productID}`)).product;
    return `
    <div class="w-full">
    <article class="flex flex-col gap-3 m-2 p-4 rounded-lg md:min-h-[80vh]">
        <header>
            <h1 class="font-bold text-xl text-center">${product.title}</h1>
        </header>
        <div class="flex flex-col justify-center mt-6">
            <div class="flex flex-col md:flex-row md:items-center justify-center gap-5 md:gap-30">
                <!-- image -->
                <img src="assets/prod/${product.image_name}" alt="${product.title}"
                    class="max-h-96 max-w-full object-contain text-center" />
                <!-- description -->
                <div class="flex flex-col gap-5 md:gap-10">
                    <section class="flex flex-col gap-2 p-2 md:px-4 md:py-10 border-1 border-gray-400 shadow-md rounded-md">
                        <h2 class="font-bold text-center underline">Descrizione</h2>
                        <p>
                        ${product.description}
                        </p>
                    </section>
                    <section class="flex flex-col gap-3 p-2 md:py-10 border-1 border-gray-400 shadow-md rounded-md">
                        <h2 class="font-bold text-center underline">Informazioni commerciali</h2>
                        <ul class="flex flex-col gap-2 text-center">
                            <li class="flex flex-col">
                                <p><strong>Prezzo:</strong> ${product.discount_price ? `<del class="text-red-800">€${product.price}</del>` : product.price}</p>
                            </li>
                            ${(() => {
                                if (product.discount_price) {
                                    return `
                                    <li class="flex flex-col">
                                        <p><strong>Prezzo scontato:</strong> €${product.discount_price}</p>
                                    </li>`;
                                }
                                return "";
                            })()}
                            <li class="flex flex-col">
                                <p><strong>Quantitá disponibile:</strong> ${product.quantity_available}</p>
                            </li>
                        </ul>
                    </section>
                    <div class="${USER_INFO.loggedIn ? "flex" : "hidden"} flex-col md:flex-row justify-center items-center flex-1">
                    ${(() => {
                        if (USER_INFO.loggedIn && USER_INFO.user.isCustomer) {
                            return `<form action="CRUDcart"
                                class="w-full flex flex-col gap-4 justify-center items-center border-4 border-double p-4 rounded-md bg-linear-to-b from-white to-amber-100">
                                <fieldset class="flex flex-row gap-2 justify-center items-center">
                                    <legend class="h-0 invisible">Dettagli d'acquisto</legend>
                                    <label for="purchaseQuantity">Quantitá d'acquisto</label>
                                    <input type="number" name="purchaseQuantity" id="purchaseQuantity" min="1" max="${product.quantity_available}" value="1" onchange="changePreviewCartPrice(this.value, ${product.discount_price ? product.discount_price : product.price})"
                                        class="border-1 border-black px-1 w-20 rounded-md bg-white" />
                                </fieldset>
                                <p>Prezzo bloccato nel carrello: €${product.discount_price ? product.discount_price : product.price}</p>
                                <input type="submit" value="Aggiungi al carrello" name="add#${product.id}"
                                    class="cursor-pointer px-4 py-2 border-2 border-black rounded-full bg-white font-medium active:inset-shadow-sm active:inset-shadow-gray-800" />
                            </form>`;
                        } else if (USER_INFO.loggedIn && !USER_INFO.isCustomer) {
                        return `<a class="flex items-center justify-center gap-2 border-black border-1 w-full py-1 mt-2 rounded-full
                                    active:inset-shadow-sm active:inset-shadow-gray-800 bg-ulorange"
                                        href="updateProduct#${productID}">
                                        <img class="w-5 h-5 aspect-square" src="assets/icons/edit.png" alt="Modifica prodotto" />
                                        Modifica prodotto
                                    </a>`;
                        }
                        return "";
                    })()}
                    </div>
                </div>
            </div>
        </div>
    </article>
    </div>`;
}

async function mainCarrello() {
    const DESCRIPTION_PREVIEW_MAX_CHARS = 100;
    const cart = await apiCaller(`cart-info.php`);
    const products = await Promise.all(
        cart.map(async (entry) => {
            const prod = (await apiCaller(`product-by-id.php?id=${entry.product_id}`)).product;
            prod.inCart = entry.quantity;
            return prod;
        })
    );
    const totalPrice = products.reduce((sum, prod) => {
        return sum + (parseFloat(prod.price) * parseInt(prod.inCart))
    }, 0);
    const totalDiscountPrice = products.reduce((sum, prod) => {
        return sum + (parseFloat(prod.discount_price ? prod.discount_price : prod.price) * parseInt(prod.inCart));
    }, 0);

    return `<div class="m-2">
            <header class="flex flex-row justify-center">
                <h1 class="font-bold text-xl">Il tuo carrello</h1>
            </header>
            <div class="flex flex-col md:flex-row gap-3 mt-6 min-h-[80vh]">
                <aside class="${totalPrice == 0 ? "hidden" : "flex"} flex-col items-center gap-2 border-1 border-black rounded-md md:min-w-7/24">
                    <h2
                        class="bg-usky p-2 font-bold bg-gradient-to-t border-b-1 rounded-b-3xl border-black w-full text-center">
                        Pagamento</h2>
                    <ul class="flex flex-col justify-center items-center p-2 md:p-4">
                        <li class="p-2 ${totalDiscountPrice != totalPrice ? "" : "border-b-2"}">
                            <p><strong>Prezzo intero:</strong> €${totalPrice.toFixed(2)}</p>
                        </li>
                        ${(() => {
                            if (totalDiscountPrice != totalPrice) {
                                return `<li class="p-2 border-b-2">
                                    <p><strong>Risparmio:</strong> €${(totalPrice - totalDiscountPrice).toFixed(2)} (-${computeDiscount(totalPrice, totalDiscountPrice)}%)</p>
                                </li>`;
                            }
                            return "";
                        })()}
                        <li class="p-2">
                            <p><strong>Totale pagamento:</strong> €${totalDiscountPrice.toFixed(2)}</p>
                        </li>
                        <li class="p-2 mt-3">
                            <a href="completeOrder"
                                class="text-nowrap border-1 px-4 py-2 rounded-full bg-ugreen active:inset-shadow-sm active:inset-shadow-gray-800">Paga
                                e avvia l'ordine</a>
                        </li>
                    </ul>
                </aside>
                <section class="flex flex-col items-center gap-2 border-t-1 border-black rounded-md md:grow">
                    <h2
                        class="bg-ulorange p-2 font-bold bg-gradient-to-t border-b-1 rounded-b-3xl border-black w-full text-center">
                        Prodotti nel tuo carrello</h2>
                    <div class="flex flex-col ${cart.length != 0 ? "md:grid md:grid-cols-3" : ""} gap-3 w-full p-2">
                    ${(() => {
                        let shownProducts = "";

                        if (cart.length == 0) {
                            return `<p class="place-self-center mt-10 text-2xl">Non c'é nulla nel tuo carrello 😄</p>`;
                        }
                        products.forEach(product => {
                            shownProducts +=
                            `
                            <article class="border-1 border-gray-400 shadow-md shadow-gray-500 py-2 px-2 rounded-sm">
                                <div class="flex flex-row md:flex-col gap-3">
                                    <header class="flex items-center justify-center basis-1/3 p-1">
                                        <img class="min-w-20 w-auto md:max-h-40" src="assets/prod/${product.image_name}" alt="${product.title}" />
                                    </header>
                                    <section class="flex flex-col px-1 gap-3">
                                        <h3 class="font-semibold">${product.title}</h3>
                                        <p>${shortenDescription(product.description)}</p>
                                        <p class="mt-3">
                                        <strong>Prezzo totale:</strong> €${(product.inCart * (product.discount_price ? product.discount_price : product.price)).toFixed(2)}<br/>
                                        ➡️ ${product.inCart} x €${product.discount_price ? product.discount_price : product.price} ${product.discount_price ? `<del class="text-red-800">${product.price}</del>` : ""}
                                        </p>
                                    </section>
                                </div>
                                <footer class="mt-3 flex flex-row justify-center items-end grow">
                                    <ul class="flex flex-col gap-1 justify-center items-center w-full">
                                        <li class="flex flex-row w-full">
                                            <a class="grow flex items-center justify-center gap-2 border-black border-1 w-full py-1 px-2 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800"
                                                href="productSheet#${product.id}">
                                                <img class="w-5 h-5 aspect-square" src="assets/icons/info.png" alt="Scheda prodotto" />
                                                Scheda prodotto
                                            </a>
                                        <li>
                                        <li class="flex flex-row w-full">
                                            <a class="grow flex items-center justify-center gap-2 border-red-700 text-red-700 border-1 w-full py-1 px-2 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800"
                                                href="deleteFromCart#${product.id}">
                                                <img class="w-5 h-5 aspect-square" src="assets/icons/remove.png" alt="Rimuovi dal carrello" />
                                                Rimuovi dal carrello
                                            </a>
                                        <li>
                                    </ul>
                                </footer>            
                            </article>
                            `;
                        });
                        return shownProducts;
                    })()}
                    </div>
                </section>
            </div>
        </div>`;
}

async function mainCompleteOrder() {
    return `<!-- Background image flex div -->
        <div
            class="flex flex-col justify-center items-center bg-[url(../assets/imgs/login_background.jpg)] bg-cover bg-right md:bg-bottom bg-no-repeat w-full h-[110vh] md:h-[90vh] py-3">
            <!-- Actual card -->
            <div class="flex flex-col items-center justify-center w-6/7 md:w-2/3 lg:w-4/7 m-3 bg-white
                shadow-[0px_0px_30px_5px_#6C1100] border-1 border-black rounded-sm p-3 md:px-5">
                <h1 class="text-lg font-bold text-center">Conferma dati di spedizione e pagamento</h1>
                <form action="confirmOrder" class="flex flex-col gap-3 p-2 w-full">
                    <fieldset disabled="disabled" class="border-1 border-gray-400 p-4 rounded-md flex flex-col min-w-0">
                        <legend class="font-semibold">Dati di spedizione</legend>
                        <ul class="flex flex-col w-full gap-3">
                            <li class="flex flex-col gap-3 md:flex-row">
                                <div class="flex flex-col md:w-1/2">
                                    <label for="name">Nome acquirente</label>
                                    <input type="text" name="name" id="name" required="true" max-length="255" value="${USER_INFO.user.name}"
                                        class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                                </div>
                                <div class="flex flex-col md:w-1/2">
                                    <label for="surname">Cognome acquirente</label>
                                    <input type="text" name="surname" id="surname" required="true" max-length="255" value="${USER_INFO.user.surname}"
                                        class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                                </div>
                            </li>
                            <li class="flex flex-col md:basis-full">
                                <label for="address">Indirizzo di spedizione</label>
                                <input type="text" name="address" id="address" required="true" max-length="255" value="${USER_INFO.user.address}"
                                    class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                            </li>
                        </ul>
                    </fieldset>
                    <fieldset disabled="disabled"
                        class="border-1 border-gray-400 p-4 rounded-md flex flex-col min-w-0 bg-gray-200 text-gray-500">
                        <legend class="font-semibold">Dati di pagamento</legend>
                        <ul class="flex flex-col w-full gap-3">
                            <li class="flex flex-col gap-3 md:flex-row">
                                <div class="flex flex-col md:w-1/2">
                                    <label for="pName">Nome sulla carta</label>
                                    <input type="text" name="pName" id="pName" value="${USER_INFO.user.name}"
                                        class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                                </div>
                                <div class="flex flex-col md:w-1/2">
                                    <label for="pSurname">Cognome sulla carta</label>
                                    <input type="text" name="pSurname" id="pSurname" value="${USER_INFO.user.surname}"
                                        class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                                </div>
                            </li>
                            <li class="flex flex-col gap-3 md:flex-row">
                                <div class="flex flex-col md:w-5/6">
                                    <label for="creditCard">Carta di credito</label>
                                    <input type="number" name="creditCard" id="creditCard" value="1234123412341234"
                                        class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                </div>
                                <div class="flex flex-col md:w-1/6">
                                    <label for="cvv">CVV</label>
                                    <input type="number" name="cvv" id="cvv" value="123"
                                        class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                </div>
                            </li>
                        </ul>
                    </fieldset>
                    <input type="submit" value="Ordina e paga"
                        class="cursor-pointer font-semibold px-3 py-2 border-1 border-black bg-ugreen rounded-full mt-5 active:inset-shadow-sm active:inset-shadow-gray-800" />
                </form>
            </div>
        </div>`;
}

async function mainOrdini() {
    const ORDER_ITEMS_COLS = 4;
    const orders = await apiCaller("orders-info.php");
    return `<div class="flex flex-col gap-3 my-2 mx-3 md:mx-15 min-h-[80vh]">
            <header>
                <h1 class="font-bold text-xl text-center">${USER_INFO.loggedIn && !USER_INFO.user.isCustomer ? "Ordini dei clienti" : "I tuoi ordini"}</h1>
            </header>
            <!-- Ordini -->
            <div class="flex flex-col w-full gap-5">
            ${await (async () => {
                if (orders.length == 0) {
                    return `<p class="text-2xl text-center mt-6">Non hai ancora effettuato nessun ordine 😄</p>`;
                }
                // Creates an article for each order
                let orderHtml = "";
                for (let ordNum = 0; ordNum < orders.length; ordNum++) {
                    const order = orders[ordNum];
                    const orderItems = await apiCaller(`order-items-info.php?id=${order.id}`);
                    orderHtml += `<article class="flex flex-col border-4 border-double border-black rounded-md overflow-hidden odd:bg-orange-300 even:bg-blue-300">
                    <header class="flex flex-row">
                        <ul
                            class="grid grid-cols-2 grid-rows-2 content-center justify-items-center items-center border-r-1 gap-1 bg-white px-2 py-1">
                            ${(()=> {
                                let prevImgs = "";
                                for (let i = 0; i < 4 && i < orderItems.length; i++) {
                                    prevImgs += `<li class="max-w-10 max-h-10">
                                        <img src="assets/prod/${orderItems[i].image_name}" alt="${orderItems[i].title}" />
                                    </li>`;
                                }
                                return prevImgs;
                            })()}
                        </ul>
                        <div class="p-2 flex flex-col md:flex-row gap-2 w-full justify-between">
                            <ul class="flex flex-col">
                                <li>
                                    <h2 class="font-bold underline underline-offset-4">Ordine n. ${order.id}</h2>
                                </li>
                                <li>
                                    <p><strong>Stato ordine:</strong> ${order.status}</p>
                                </li>
                                ${order.delivery_date
                                ? `<li>
                                    <p><strong>Data di consegna stimata:</strong> ${formatMySQLTimestamp(order.delivery_date)}</p>
                                </li>`
                                : ""}
                            </ul>
                            <a href="expandDetails" id="toggleOrder${order.id}" aria-expanded="false" aria-controls="orderDetails${order.id}"
                                class="text-black self-center h-10 flex flex-row justify-center items-center gap-2 px-10 py-2 border-2 border-black bg-white rounded-full w-full md:w-auto">
                                <p class="text-nowrap">Apri/Chiudi dettagli</p>
                                <img src="assets/icons/down-arrow.png" alt="Apri/Chiudi dettagli" class="w-4 h-4" />
                            </a>
                        </div>
                    </header>
                    <!-- expandable details -->
                    <div id="orderDetails${order.id}" aria-hidden="true" class="hidden animate-open flex-col gap-4 ${ordNum % 2 == 0 ? "bg-orange-100" : "bg-blue-100"} md:px-10 md:py-4 px-3 py-5 border-t-3 border-dashed">
                        <section class="flex flex-col gap-3 border-1 border-black p-2 bg-white rounded-md">
                            <h3 class="font-bold underline text-center">Dettagli</h3>
                            <ul>
                                ${USER_INFO.loggedIn && !USER_INFO.user.isCustomer
                                    ? `<li>
                                        <p><strong>Acquirente:</strong> ${order.last_name} ${order.first_name} [${order.username}]</p>
                                    </li>`
                                    : ""}
                                <li>
                                    <p><strong>Indirizzo di consegna:</strong> ${order.address}</p>
                                </li>
                                <li>
                                    <p><strong>Data d'acquisto:</strong> ${formatMySQLTimestamp(order.purchase_date)}</p>
                                </li>
                                <li>
                                    <p><strong>Prezzo pagato:</strong> €${order.total_price}</p>
                                </li>
                                <li>
                                    <p><strong>Codice ordine:</strong> ${order.id}</p>
                                </li>
                            </ul>
                        </section>
                        <section class="flex flex-col gap-3 border-1 border-black rounded-md bg-white p-2">
                            <h3 class="font-bold underline text-center">Articoli inclusi nell'ordine</h3>
                            <div class="flex flex-col gap-3 md:gap-0 md:grid md:grid-cols-${ORDER_ITEMS_COLS}">
                            <!-- Product injection -->
                            ${(() => {
                                let productPreview = "";
                                let i = 0;
                                orderItems.forEach(product => {
                                    productPreview += `<article
                                    class="py-2 px-2 bg-white border-t-1 md:border-t-0 ${(() => {
                                        let border = "";
                                        border += i <= orderItems.length - ORDER_ITEMS_COLS + 1 ? "md:border-b-1 " : "";
                                        border += (i + 1) % ORDER_ITEMS_COLS != 0 ? "md:border-r-1" : "";
                                        return border;
                                        })()} border-gray-600">
                                    <div class="flex flex-row md:flex-col gap-3">
                                        <header class="flex items-center justify-center basis-1/3 p-1">
                                            <img class="min-w-20 w-auto md:max-h-40"
                                                src="assets/prod/${product.image_name}" alt="${product.title}" />
                                        </header>
                                        <section class="flex flex-col px-1 gap-3">
                                            <h4 class="font-semibold">${product.title}</h4>
                                                    <p>${shortenDescription(product.description)}</p>
                                                    <p class="mt-3">
                                                        <strong>Prezzo totale:</strong> €${(product.quantity * product.price_per_unit).toFixed(2)}<br />
                                                        ➡️ ${product.quantity} x ${product.price_per_unit}
                                                    </p>
                                        </section>
                                    </div>
                                    <footer class="mt-3 flex flex-row justify-center items-end grow">
                                        <ul class="flex flex-col gap-1 justify-center items-center w-full">
                                            <li class="flex flex-row w-full">
                                                <a class="grow flex items-center justify-center gap-2 border-black border-1 w-full py-1 px-2 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800"
                                                    href="productSheet#${product.id}">
                                                    <img class="w-5 h-5 aspect-square" src="assets/icons/info.png"
                                                        alt="Scheda prodotto" />
                                                    Scheda prodotto
                                                </a>
                                            </li>
                                        </ul>
                                    </footer>
                                </article>`;
                                i++;
                                });
                                return productPreview;
                            })()}
                            </div>
                        </section>
                        ${(() => {
                            if (USER_INFO.loggedIn && !USER_INFO.user.isCustomer) {
                                return `<footer class="flex flex-col gap-3 border-1 border-black p-2 bg-white rounded-md">
                                    <h3 class="font-bold underline text-center">Modifica stato e data di consegna</h3>
                                    <form action="updateOrder" class="flex flex-col gap-3">
                                        <fieldset class="border-1 border-gray-400 rounded-md px-3 py-2">
                                            <legend>Stato dell'ordine e data di consegna</legend>
                                            <ul class="flex flex-col gap-2">
                                                <li class="flex flex-row gap-2">
                                                    <input type="radio" id="avviato#${order.id}" name="status#${order.id}" value="avviato" class="w-4 accent-ured" ${order.status == "avviato" ? "checked" : ""} />
                                                    <label for="avviato#${order.id}">Avviato</label>
                                                </li>
                                                <li class="flex flex-row gap-2">
                                                    <input type="radio" id="spedito#${order.id}" name="status#${order.id}" value="spedito" class="w-4 accent-ured" ${order.status == "spedito" ? "checked" : ""} />
                                                    <label for="spedito#${order.id}">Spedito</label>
                                                </li>
                                                <li class="flex flex-row gap-2">
                                                    <input type="radio" id="ricevuto#${order.id}" name="status#${order.id}" value="ricevuto" class="w-4 accent-ured" ${order.status == "ricevuto" ? "checked" : ""}/>
                                                    <label for="ricevuto#${order.id}">Ricevuto</label>
                                                </li>
                                                <li class="flex flex-row gap-2">
                                                    <input type="radio" id="annullato#${order.id}" name="status#${order.id}" value="annullato" class="w-4 accent-ured" ${order.status == "annullato" ? "checked" : ""} />
                                                    <label for="annullato#${order.id}">Annullato</label>
                                                </li>
                                                <li class="flex flex-row gap-2 items-center">
                                                    <input type="date" name="deliveryDate#${order.id}" id="deliveryDate#${order.id}" onchange="italianDateFormat(this.value, ${order.id})" min="${(() => {
                                                        let today = new Date();
                                                        today = new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0];
                                                        return today;
                                                        })()}" value="${order.delivery_date ? order.delivery_date.split(" ")[0] : ""}"
                                                        class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50 w-8" />
                                                    <label for="deliveryDate#${order.id}">Data di consegna: ${order.delivery_date ? formatMySQLTimestamp(order.delivery_date) : "Non impostata."}</label>
                                                    <!-- <label for="deliveryDate#${order.id}">${order.delivery_date ? formatMySQLTimestamp(order.delivery_date) : ""}</label> -->
                                                </li>
                                            </ul>
                                        </fieldset>
                                        <div class="flex flex-col md:flex-row gap-3">
                                            <input type="submit" value="Cambia stato e data di consegna" name="${order.id}" class="p-2 border-1 border-black bg-ugreen rounded-full grow active:inset-shadow-sm active:inset-shadow-gray-800 cursor-pointer text-center" />
                                            <div class="flex flex-col grow">
                                                <label for="resetOrderState${order.id}" class="invisible h-0 w-0">Reimposta stato e data di consegna</label>
                                                <input id="resetOrderState${order.id}" type="reset" value="Reimposta stato e data di consegna" class="p-2 border-1 border-black bg-ulred rounded-full active:inset-shadow-sm active:inset-shadow-gray-800 cursor-pointer text-center" />
                                            </div>
                                        </div>
                                    </form>
                                </footer>`
                            }
                            return "";
                        })()}
                    </div>
                </article>`;
                }
                return orderHtml;
            })()}
            </div>
        </div>`;
}

async function mainNotifiche() {
    const notifications = await apiCaller("notifications-info.php");
    return `        <div class="m-2 md:mx-10 md:my-6 flex flex-col gap-5 min-h-[80vh]">
            <div class="flex flex-col md:flex-row gap-3 md:justify-between md:items-center">
                <h1 class="text-2xl font-bold text-center">Le tue notifiche</h1>
                <div class="flex flex-col md:flex-row items-center gap-4 md:gap-2 text-nowrap">
                    <a href="deleteAllNotifications"
                        class="px-4 py-1 rounded-full border-2 font-semibold border-red-800 text-red-800 w-full text-center bg-red-100 active:inset-shadow-sm active:inset-shadow-gray-800">Elimina
                        tutte le
                        notifiche</a>
                    <a href="readAllNotifications"
                        class="px-4 py-1 rounded-full border-2 font-semibold border-sky-800 text-sky-800 w-full text-center bg-sky-100 active:inset-shadow-sm active:inset-shadow-gray-800">Segna
                        tutte come
                        lette</a>
                </div>
            </div>
            <!-- Actual notifications -->
            <div class="border-1 border-gray-500 shadow-lg rounded-md overflow-hidden">
                <ul class="flex flex-col divide-y-2 divide-dashed">
                ${(() => {
                    if (notifications.length == 0) {
                        return `<p class="text-2xl text-center my-6">Non hai alcuna notifica 📩</p>`;
                    }

                    let notificationsHTML = "";
                    notifications.forEach(notification => {
                        notificationsHTML += `<li class="pt-3 bg-gradient-to-b ${notification.is_read ? "from-gray-400 to-40% to-gray-100" : "from-orange-200 to-40% to-amber-100"}">
                        <article class="p-3 flex flex-col gap-3">
                            <header class="flex flex-col gap-2 bg-white/20 px-2 py-1 rounded-md">
                                <div class="flex flex-row justify-between items-center">
                                    <h2 class="font-bold underline underline-offset-3">${notification.title}</h2>
                                    <img src="assets/icons/${notification.is_read ? "read" : "unread"}.png" alt="${notification.is_read ? "Notifica giá letta" : "Notifica non ancora letta"}" class="w-7" />
                                </div>
                                <p class="text-sm font-medium">Ricevuta il ${formatMySQLTimestampWithTime(notification.created_at)}</p>
                            </header>
                            <p class="bg-white/20 px-2 py-1 rounded-md">${notification.message}</p>
                            <footer class="flex flex-row gap-2 justify-end">
                                <a href="deleteNotification#${notification.id}"
                                    class="px-2 py-1 rounded-full border-2 font-semibold border-red-800 text-red-800 basis-1/2 text-center md:basis-1/5 bg-white active:inset-shadow-sm active:inset-shadow-gray-800">Elimina
                                    notifica</a>
                                ${notification.is_read
                                    ? ""
                                    : `<a href="markNotificationAsRead#${notification.id}"
                                    class="px-2 py-1 rounded-full border-2 font-semibold border-sky-800 text-sky-800 basis-1/2 text-center md:basis-1/5 bg-white active:inset-shadow-sm active:inset-shadow-gray-800">Segna
                                    come
                                    letta</a>`}
                            </footer>
                        </article>
                    </li>`;
                    });
                    return notificationsHTML;
                })()}
                </ul>
            </div>
        </div>`;
}

async function mainContatti() {
    const vendorEmail = (await apiCaller("get-vendor-email.php")).email;
    return `<div class="gap-3 m-2 min-h-[80vh] flex flex-row justify-center">
            <section class="leading-7 flex flex-col gap-3 md:w-[60%]">
                <h1 class="font-bold text-xl text-center">${USER_INFO.loggedIn && !USER_INFO.user.isCustomer ? "Notifica i tuoi clienti" : "Contatta il venditore"}</h1>
                ${USER_INFO.loggedIn && !USER_INFO.user.isCustomer
                    ? ""
                    : `<p class="text-center">
                        Per poter comunicare con noi potete scrivere una mail al seguente indirizzo: <a
                            href="mailto:${vendorEmail}"
                            class="text-sky-700 underline underline-offset-2">${vendorEmail}</a>. Cercheremo di
                        ricontattarvi il prima possibile
                    </p>
                    <p class="text-center">
                        <strong>Solo per gli utenti registrati:</strong> potete contattarci inviandoci una notifica
                        compilando il seguente form
                    </p>`
                }
                ${await (async () => {
                    if (!USER_INFO.loggedIn) {
                        return `<div class="my-6 md:my-10 p-5 flex flex-col gap-4 border-1 border-black rounded-md justify-center items-center">
                            <p class="text-center"><strong>Form contatti riservato agli utenti registrati.</strong><br/>Non sei ancora registrato? Clicca il bottone per registrarti</p>
                            <a href="registrazione" class="px-2 md:px-5 py-1 w-3/4 rounded-full border-2 border-red-700 text-center font-semibold text-red-700 bg-red-50 active:inset-shadow-sm active:inset-shadow-gray-800">Registrati</a>
                        </div>`;
                    }
                    return `<form action="sendNotification" class="my-6 md:my-10 flex flex-col">
                    <fieldset
                        class="flex flex-col border-solid border-2 border-orange-900 rounded-md px-5 py-4 bg-orange-100">
                        <legend
                            class="ml-auto mr-auto px-2 font-semibold rounded-md bg-white border-2 border-solid border-orange-900 text-center text-lg">
                            Contenuto
                            della
                            notifica
                        </legend>
                        <ul class="flex flex-col gap-2">
                            <li class="${USER_INFO.loggedIn && !USER_INFO.user.isCustomer ? "flex" : "hidden"} flex-col gap-1">
                                <label for="user" class="font-semibold">Utente da contattare</label>
                                <select name="user" id="user" ${USER_INFO.loggedIn && !USER_INFO.user.isCustomer ? "required" : ""} 
                                    class="text-center bg-white border-1 border-orange-900 px-1 py-2 rounded-sm focus:outline-2 focus:outline-orange-900">
                                    <option value="" disabled> ---- Seleziona il destinatario della notifica ---- </option>
                                    <option value="all" selected>Tutti i clienti</option>
                                    ${await (async () => {
                                        // loads customers data only if its the vendor (its also checked server side)
                                        if (USER_INFO.loggedIn && !USER_INFO.user.isCustomer) {
                                            const customersData = await apiCaller("customers-info.php");
                                            let options = "";
                                            customersData.forEach(customer => {
                                                options += `<option value="${customer.id}">[${customer.username}] ${customer.last_name} ${customer.first_name} | ID: ${customer.id}</option>
                                                `;
                                            });
                                            return options;
                                        }
                                        return "";
                                    })()}
                                </select>
                            </li>
                            <li class="flex flex-col gap-1">
                                <label for="title" class="font-semibold">Titolo del messaggio</label>
                                <input type="text" name="title" id="title" required maxlength="255" autocomplete="off" 
                                    class="bg-white border-1 border-sky-900 p-1 rounded-sm focus:outline-2 focus:outline-orange-900" />
                            </li>
                            <li class="flex flex-col gap-1">
                                <label for="message" class="font-semibold">Messaggio</label>
                                <textarea name="message" id="message" required maxlength="5000" autocomplete="off" 
                                    class="bg-white h-80 resize-none border-1 border-sky-900 p-1 rounded-sm focus:outline-2 focus:outline-orange-900"></textarea>
                            </li>
                        </ul>
                    </fieldset>
                    <ul aria-live="assertive" tabindex="-1" class="hidden list-disc list-inside mt-6 text-red-800 text-clip md:col-span-2">
                    </ul>
                    <input type="submit" value="Manda notifica"
                        class="cursor-pointer mt-6 py-1 px-2 border-2 border-orange-900 border-solid rounded-md text-orange-900 font-semibold active:inset-shadow-sm active:inset-shadow-gray-800 bg-orange-100" />
                </form>`;
                })()}
            </section>
        </div>`;
}