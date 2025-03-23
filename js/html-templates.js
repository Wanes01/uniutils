"use strict";

function generateProductPreview(productData, wClass, heading) {
    const DESCRIPTION_PREVIEW_MAX_CHARS = 100;
    const products = [];

    for (let i = 0; i < productData.length; i++) {
        products.push(
        `<article
            class="flex flex-row md:flex-col gap-2 border-1 ${wClass} border-gray-400 shadow-md shadow-gray-500 py-2 px-2 rounded-sm">
            <header class="flex items-center justify-center basis-1/3">
                <img class="w-auto md:max-h-40" src="${productData[i].image_name}" alt="${productData[i].title}" />
            </header>
            <div class="flex flex-col w-full grow">
                <section>
                    <${heading} class="font-bold">${productData[i].title}</${heading}>
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
                                <img class="w-5 h-5 aspect-square" src="assets/icons/info.png" alt="">
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
                                        <img class="w-5 h-5 aspect-square" src="assets/icons/edit.png" alt="">
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
    <div class="md:px-10 px-2 mb-7">
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
                return active == linkTitle.toLowerCase()
                    ? "md:border-b-black md:w-auto md:bg-usky"
                    : `md:hover:border-b-black md:w-auto
                    md:hover:bg-gradient-to-t md:hover:from-usky md:hover:via-white md:hover:via-80% md:hover:to-white`;
            }
        })()
        } ${
            linkTitle == "Notifiche" ? "hidden md:block" : ""
        }"><a class="flex flex-row gap-1 md:py-1 md:px-2 py-6 w-full justify-center items-center font-bold" href="${linkTitle.toLowerCase()}">
            <img src="assets/icons/${linkTitle.toLowerCase()}.png" alt="" class="w-3 h-3 md:mb-0.5" />
            ${linkTitle}</a></li>`
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
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50">
                            <label for="password" class="mt-3 md:mt-6">Password</label>
                            <input type="password" name="password" id="password" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50">
                        </fieldset>
                        <ul class="hidden list-disc list-inside mt-6 text-red-700 text-clip md:col-span-2">
                        </ul>
                        <input type="submit" name="login" value="Accedi"
                            class="cursor-pointer border-1 border-black mt-6 md:mt-12 mb-3 py-1 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800">
                    </form>
                </section>
                <section class="flex flex-col px-2 md:h-full md:w-1/2 justify-center items-center h-40 bg-[#FF6142]">
                    <h2 class="font-bold text-center">Sei nuovo da queste parti?<br>
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
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50">
                        </p>
                        <p class="flex flex-col justify-center">
                            <label for="surname" class="mt-3 md:mt-6">Cognome</label>
                            <input type="text" name="surname" id="surname" maxlength="100" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50">
                        </p>
                        <p class="flex flex-col justify-center md:col-span-2">
                            <label for="address" class="mt-3 md:mt-6">Indirizzo</label>
                            <input type="text" name="address" id="address" maxlength="100" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50">
                        </p>
                    </fieldset>
                    <fieldset class="md:grid md:grid-cols-2 md:gap-x-4 min-w-0">
                    <!-- Hidden from visualization but still visible to screen readers -->
                        <legend class="invisible h-0">Credenziali</legend>
                        <p class="flex flex-col justify-center">
                            <label for="email" class="mt-3 md:mt-6">Email</label>
                            <input type="email" name="email" id="email" maxlength="100" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50">
                        </p>
                        <p class="flex flex-col justify-center">
                            <label for="username" class="mt-3 md:mt-6">Username</label>
                            <input type="text" name="username" id="username" maxlength="100" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50">
                        </p>
                        <p class="flex flex-col justify-center">
                            <label for="password" class="mt-3 md:mt-6">Password</label>
                            <input type="password" name="password" id="password" minlength="8" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50">
                        </p>
                        <p class="flex flex-col justify-center">
                            <label for="passwordCheck" class="mt-3 md:mt-6">Ripeti la password</label>
                            <input type="password" name="passwordCheck" id="passwordCheck" minlength="8" required autocomplete="off"
                                class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50">
                        </p>
                    </fieldset>
                    <ul class="hidden list-disc list-inside mt-6 text-red-700 text-clip md:col-span-2">
                    </ul>
                    <input type="submit" name="registrazione" value="Registrati"
                        class="md:col-span-2 cursor-pointer border-1 border-black mt-6 md:mt-12 mb-3 py-1 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800">
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
            <div class="flex flex-row items-center justify-center gap-3">
                <h2 class="font-semibold text-center md:text-lg">Filtri</h2>
                <img src="assets/icons/down-arrow.png" alt="Apri/chiudi filtri"
                class="w-4 h-4 md:hidden transition duration-300 z-10" />
            </div>
            <!-- flex / hidden (hidden in versione mobile) -->
            <form action="filtra" class="px-2 py-1 hidden md:flex flex-col gap-5">
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
                                })()}"
                                class="border-black border-1 rounded-sm w-24 px-1
                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
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
                                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none">
                        </li>
                        <li class="flex flex-row gap-1">
                            <label for="onlyOffers">Mostra solo offerte</label>
                            <input type="checkbox" name="onlyOffers" id="onlyOffers" class="w-4 accent-ured"
                            ${uriParams.includes("onlyOffers") ? `checked="true"` : ""}>
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
                                     ${previewsCategories.includes((category.id).toString()) ? `checked="true"` : ""}>
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
                            ${uriParams.includes("orderBy=popularity") ? `checked="true"` : ""}
                            class="w-4 accent-ured">
                            <label for="popularity">Popolaritá</label>
                        </li>
                        <li>
                            <input type="radio" name="orderBy" id="decreasingPrice" value="decreasingPrice"
                            ${uriParams.includes("orderBy=decreasingPrice") ? `checked="true"` : ""}
                            class="w-4 accent-ured">
                            <label for="decreasingPrice">Prezzo decrescente</label>
                        </li>
                        <li>
                            <input type="radio" name="orderBy" id="increasingPrice" value="increasingPrice"
                            ${uriParams.includes("orderBy=increasingPrice") ? `checked="true"` : ""}
                            class="w-4 accent-ured">
                            <label for="increasingPrice">Prezzo crescente</label>
                        </li>
                        <li>
                            <input type="radio" name="orderBy" id="random" value="random"
                            ${uriParams.includes("orderBy=random") ? `checked="true"` : ""}
                            class="w-4 accent-ured">
                            <label for="random">Casuale</label>
                        </li>
                    </ul>
                </fieldset>
                <input type="submit" value="Applica filtri"
                    class="cursor-pointer border-1 border-gray-500 bg-ulred py-1 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800">
                <input type="reset" value="Reimposta filtri"
                    class="cursor-pointer border-1 border-gray-500 py-1 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800">
            </form>
        </aside>
        <!-- Sezione ricerca a visualizzazione multipagina prodotti -->
        <section class="w-full flex flex-col gap-5">
            <header class="flex flex-col md:flex-row gap-5">
                <form action="cerca" class="flex flex-col md:flex-row md:items-center md:gap-2 md:grow">
                    <label for="search">Cerca per nome/descrizione</label>
                    <div class="flex flex-row flex-1">
                        <input type="search" name="search" id="search" autocomplete="off"
                            ${(() => {
                                const match = uriParams.match(/search=([^&]+)(?:&|$)/);
                                return match && match[1] ? `value="${match[1]}"` : "";
                            })()}
                            class="w-full rounded-l-full px-3 py-1 border-1 border-r-0 border-gray-400"
                            placeholder="Nome prodotto / descrizione prodotto" />
                        <input type="submit" value="Cerca" class="cursor-pointer rounded-r-full px-4 py-1 border-1 border-l-0 border-ured
                            bg-ured active:inset-shadow-sm active:inset-shadow-gray-800 font-medium">
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
                            <img src="assets/icons/add.png" class="w-4 h-4">
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
                        <li>`;
                    }
                    return numbers;
                })()} 
                </ul>
            </footer>
        </section>
    </div>`;
}

async function showDisappearingInfoModal(message, time) {
    const div = document.querySelector("main > div");
    div.classList.add("blur-sm");
    document.querySelector("main").innerHTML +=
    `
    <div class="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2
    py-8 px-10 text-center rounded-md bg-white border-1 border-gray-400 flex flex-row font-medium
    shadow-xl shadow-gray-800">
        <p>${message}</p>
    </div>
    `
    await sleep(time);
    //div.classList.remove("blur-sm");
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
                                    <img src="assets/icons/required.png" alt="campo obbligatorio" class="w-4 h-4">
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
                                    <img src="assets/icons/required.png" alt="campo obbligatorio" class="w-4 h-4">
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
                                    <img src="assets/icons/required.png" alt="campo obbligatorio" class="w-4 h-4">
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
                                class="w-4 h-4 self-center md:justify-self-start">
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
                                        ? 'checked="true"'
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
                                    <img src="assets/icons/required.png" alt="campo obbligatorio" class="w-4 h-4">
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
                                    } autocomplete="off" maxlength="255" 
                                    class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50 w-full"
                                    accept=".jpg, .jpeg, .png" />
                            </li>
                        </ul>
                    </fieldset>
                    <div class="flex flex-row items-center gap-2">
                        <img src="assets/icons/required.png" alt="campo obbligatorio" class="w-4 h-4">
                        <strong>= CAMPO OBBLIGATORIO</strong>
                    </div>
                    <ul class="hidden list-disc list-inside mt-6 text-red-700 text-clip md:col-span-2">
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

async function showConfirmationModal(message, agreeMessage, disagreeMessage) {
    return new Promise((resolve) => {
        const main = document.querySelector("main");
        const div = main.querySelector("div");
        div.classList.add("blur-sm");
    
        // Creazione del modal
        const modal = document.createElement("div");
        modal.className = `fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2
            py-8 px-10 text-center rounded-md bg-white border-1 border-gray-400 flex flex-col font-medium justify-center items-center
            shadow-xl shadow-gray-800`;
        modal.innerHTML = `<p class="text-red-700 font-semibold">${message}</p>
            <div class="flex flex-col md:flex-row gap-4 mt-6">
                <button class="cursor-pointer px-4 py-2 border-3 border-red-700 text-red-700 bg-red-100 rounded-full grow 
                active:inset-shadow-sm active:inset-shadow-gray-800">${agreeMessage}</button>
                <button class="cursor-pointer px-4 py-2 border-2 border-green-700 text-green-700 bg-green-100 rounded-full grow 
                active:inset-shadow-sm active:inset-shadow-gray-800">${disagreeMessage}</button>
            </div>`;
            
        main.appendChild(modal);
    
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
            modal.remove(); // Rimuove il modal
            div.classList.remove("blur-sm"); // Rimuove l'effetto sfocato
        }
    });
}

async function mainProductSheet(productID) {
    const product = (await apiCaller(`product-by-id.php?id=${productID}`)).product;
    console.log(product, product.title);
    return `
    <article class="flex flex-col gap-3 border-1 border-black m-2 p-4 rounded-lg md:min-h-[80vh]">
        <header>
            <h1 class="font-bold text-lg text-center">${product.title}</h1>
        </header>
        <!-- informative section about the product -->
        <section class="flex flex-col justify-center">
            <div class="flex flex-col md:flex-row md:items-center justify-center gap-5">
                <!-- image -->
                <img src="assets/prod/${product.image_name}" alt="${product.title}"
                    class="max-h-96 max-w-full object-contain text-center" />
                <!-- description -->
                <div class="flex flex-col gap-2 md:gap-10">
                    <section class="flex flex-col gap-2 p-2 md:py-10 border-b-2 border-red-800">
                        <h2 class="font-bold">Descrizione</h2>
                        <p>
                        ${product.description}
                        </p>
                    </section>
                    <section class="flex flex-col gap-3 p-2 md:py-10">
                        <h2 class="font-bold">Informazioni</h2>
                        <ul class="flex flex-col gap-2">
                            <li class="flex flex-col">
                                <p><strong>Prezzo:</strong> ${product.discount_price ? `<del class="text-red-800">${product.price}</del>` : product.price}</p>
                            </li>
                            ${(() => {
                                if (product.discount_price) {
                                    return `
                                    <li class="flex flex-col">
                                        <p><strong>Prezzo scontato:</strong> ${product.discount_price}</p>
                                    </li>`;
                                }
                                return "";
                            })()}
                            <li class="flex flex-col">
                                <p><strong>Quantitá disponibile:</strong> ${product.quantity_available}</p>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </section>
        <footer class="${USER_INFO.loggedIn ? "flex" : "hidden"} flex-col md:flex-row justify-center items-center">
        ${(() => {
            if (USER_INFO.loggedIn && USER_INFO.user.isCustomer) {
                return `<form action="#"
                    class="md:w-2/3 w-full flex flex-col gap-4 border-1 justify-center items-center border-black p-4 rounded-md mt-6 bg-ulyellow">
                    <fieldset class="flex flex-row gap-2 justify-center items-center">
                        <legend class="h-0 invisible">Dettagli d'acquisto</legend>
                        <label for="purchaseQuantity" class="font-medium">Quantitá d'acquisto</label>
                        <input type="number" name="purchaseQuantity" id="purchaseQuantity" min="1" max="${product.quantity_available}" value="1"
                            class="border-1 border-black px-1 w-20 rounded-md bg-white">
                    </fieldset>
                    <input type="submit" value="Aggiungi al carrello"
                        class="cursor-pointer px-4 py-2 border-2 border-black rounded-full bg-white font-medium active:inset-shadow-sm active:inset-shadow-gray-800">
                </form>`;
            }
            return "";
        })()}
        </footer>
    </article>`;
}