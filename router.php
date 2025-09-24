<?php
// router.php

// Remove os parâmetros da query string para obter o caminho do arquivo.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Constrói o caminho para o arquivo solicitado.
$filePath = __DIR__ . $path;

if (file_exists($filePath) && is_file($filePath)) {
    // Se o arquivo existir, inclua-o.
    require_once $filePath;
}