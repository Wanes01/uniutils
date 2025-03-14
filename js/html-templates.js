"use strict";

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
    <div class="md:px-10 px-2 mb-7">
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

function mainLogin() {
    return `
    <!-- Background image flex div -->
        <div
            class="flex flex-col justify-center items-center bg-[url(../assets/imgs/login_background.jpg)] bg-cover bg-right md:bg-bottom bg-no-repeat w-full h-[90vh] py-3">
            <!-- Actual card -->
            <div
                class="flex flex-col md:flex-row w-5/6 md:w-2/3 m-3 bg-white shadow-[0px_0px_30px_5px_#6C1100] border-1 border-black rounded-sm">
                <section class="flex flex-col items-center p-3 md:p-6 md:w-1/2">
                    <h1 class="font-bold text-xl">Login</h1>
                    <form action="#" class="flex flex-col w-full px-3 md:mt-4">
                        <label for="email" class="mt-3 md:mt-6">Email</label>
                        <input type="email" name="email" id="email"
                            class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                        <label for="password" class="mt-3 md:mt-6">Password</label>
                        <input type="password" name="password" id="password"
                            class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                        <!-- Error text -->
                        <p class="hidden mt-6 font-medium text-red-700 text-clip">
                            Errore!
                        </p>
                        <input type="submit" value="Accedi"
                            class="cursor-pointer border-1 border-black mt-6 md:mt-12 mb-3 py-1 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800" />
                    </form>
                </section>
                <section class="flex flex-col px-2 md:h-full md:w-1/2 justify-center items-center h-40 bg-[#FF6142]">
                    <h2 class="font-bold text-center">Sei nuovo da queste parti?<br />
                        Unisciti a noi!</h2>
                    <a href="register"
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
                <form action="#" class="flex flex-col md:grid md:grid-cols-2 md:gap-x-4 w-full">
                    <p class="flex flex-col justify-center">
                        <label for="name" class="mt-3 md:mt-6">Nome</label>
                        <input type="text" name="name" id="name"
                            class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                    </p>
                    <p class="flex flex-col justify-center">
                        <label for="surname" class="mt-3 md:mt-6">Cognome</label>
                        <input type="text" name="surname" id="surname"
                            class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                    </p>
                    <p class="flex flex-col justify-center md:col-span-2">
                        <label for="address" class="mt-3 md:mt-6">Indirizzo</label>
                        <input type="text" name="address" id="address"
                            class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                    </p>
                    <p class="flex flex-col justify-center">
                        <label for="email" class="mt-3 md:mt-6">Email</label>
                        <input type="email" name="email" id="email"
                            class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                    </p>
                    <p class="flex flex-col justify-center">
                        <label for="username" class="mt-3 md:mt-6">Username</label>
                        <input type="text" name="username" id="username"
                            class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                    </p>
                    <p class="flex flex-col justify-center">
                        <label for="password" class="mt-3 md:mt-6">Password</label>
                        <input type="password" name="password" id="password"
                            class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                    </p>
                    <p class="flex flex-col justify-center">
                        <label for="passwordCheck" class="mt-3 md:mt-6">Ripeti la password</label>
                        <input type="password" name="passwordCheck" id="passwordCheck"
                            class="border-1 border-black p-1 rounded-sm focus:outline-2 focus:outline-sky-700 focus:bg-sky-50" />
                    </p>
                    <p class="hidden mt-6 font-medium text-red-700 text-clip md:col-span-2">
                        Errore!
                    </p>
                    <input type="submit" value="Registrati"
                        class="md:col-span-2 cursor-pointer border-1 border-black mt-6 md:mt-12 mb-3 py-1 rounded-full active:inset-shadow-sm active:inset-shadow-gray-800" />
                </form>
            </div>
        </div>`;
}