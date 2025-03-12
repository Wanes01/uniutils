<!DOCTYPE html>
<html lang="it" class="overscroll-none">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/tailwind_output.css">
    <title>UniUtils - <?php echo $params["title"] ?></title>
</head>

<body class="font-inter">
    <header class="fixed w-full bg-white h-14 flex flex-row flex-wrap py-2">
        <img src="assets/imgs/logo_orange.png" alt="UniUtils" class="w-40 ml-3" />
        <!-- navigazione mobile -->
        <nav class="md:hidden flex flex-row flex-1 items-center justify-end gap-4 mr-3" aria-label="notifiche e menú">
            <img src="assets/icons/bell.png" alt="Notifiche" class="w-6 h-6" />
            <img src="assets/icons/menu.png" alt="Menú" class="w-6 h-6" />
        </nav>
        <!-- navigazione a scomparsa -->
        <nav class="hidden bg-white w-full md:flex md:flex-1">
            <ul class="md:flex md:flex-row md:flex-1 md:items-center md:justify-end md:gap-3 mr-3">
                <?php foreach($params["pages"] as $page): ?>
                <li class="w-full py-4 md:py-1 border-solid border-b-2 border-gray-300
                        md:border-0 md:w-auto md:px-2 hover:bg-usky"><a
                        class="flex flex-row gap-1 w-full justify-center items-center font-bold" href="#">
                        <img src="assets/icons/<?php echo strtolower($page)?>.png" alt="" class="w-3 h-3 md:mb-0.5">
                        <?php echo $page?></a></li>
                <?php endforeach; ?>

                <li class="w-full py-1 border-solid border-b-2 border-gray-300
                        md:border-3 md:border-ured text-ured md:px-2 md:w-auto"><a
                        class="flex flex-row gap-1 w-full justify-center items-center font-bold" href="#">
                        <img src="assets/icons/login.png" alt="" class="w-3 h-3 md:mb-0.5">
                        Login</a></li>
            </ul>
        </nav>
    </header>
    <main class="pt-14">

    </main>
    <footer class="flex flex-col gap-2 items-center justify-center mt-5 bg-ublue py-2">
        <img src="assets/imgs/logo_white.png" alt="UniUtils" class="w-36" />
        <a href="#" class="text-white">Informativa sui cookie</a>
    </footer>
    <!-- Script injection -->
    <script src="js/index.js"></script>
</body>

</html>