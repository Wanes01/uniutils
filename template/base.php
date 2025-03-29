<!DOCTYPE html>
<html lang="it" class="overscroll-none">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="css/tailwind_output.css">
    <title>UniUtils - Vetrina</title>
</head>

<body class="font-inter">
    <header class="fixed w-full bg-white h-14 flex flex-row flex-wrap py-2">
        <a href="vetrina">
            <img src="assets/imgs/logo_orange.png" alt="UniUtils" class="w-40 ml-3" />
        </a>
        <!-- navigazione mobile -->
        <nav class="md:hidden flex flex-row flex-1 items-center justify-end gap-4 mr-3" aria-label="notifiche e menú">
            <!-- Menú ad hamburger -->
            <img src="assets/icons/menu.png" alt="Menú" class="w-6 h-6 cursor-pointer" />
        </nav>
        <!-- navigazione a scomparsa -->
        <nav class="hidden bg-white w-full md:flex md:flex-1">
            <ul class="md:flex md:flex-row md:flex-1 md:items-center md:justify-end md:gap-3 md:mr-3 z-50">
                
            </ul>
        </nav>
    </header>
    <main class="pt-14">

    </main>
    <footer class="flex flex-col gap-2 items-center justify-center bg-ublue py-6">
        <img src="assets/imgs/logo_white.png" alt="UniUtils" class="w-36" />
    </footer>
    <!-- Script injection -->
    <?php foreach ($params["scripts"] as $script): ?>
    <script src="js/<?php echo $script ?>"></script>
    <?php endforeach; ?>
</body>

</html>