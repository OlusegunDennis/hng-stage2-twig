Task: Fix the blank white screen issue on the deployed Twig app hosted at https://hng-stage2-twig-1.onrender.com
.

Objective: Ensure the app renders a proper homepage using Twig.

Steps to Follow:

Confirm there is an index.php file at the project root.

This file must load Twig, render the index.html.twig template, and output content.

Example code:

<?php
require_once __DIR__ . '/vendor/autoload.php';
use Twig\Environment;
use Twig\Loader\FilesystemLoader;

$loader = new FilesystemLoader(__DIR__ . '/templates');
$twig = new Environment($loader);

echo $twig->render('index.html.twig', [
    'title' => 'Ticket App - Twig Version',
    'message' => 'Welcome to your HNG Stage 2 Twig App!'
]);


Create a templates folder (if not existing) and add:

templates/index.html.twig

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{ title }}</title>
</head>
<body>
  <h1>{{ message }}</h1>
  <p>This page is rendered using Twig 🎉</p>
</body>
</html>


Add a composer.json file to the project root:

{
  "require": {
    "twig/twig": "^3.0"
  }
}


Update the Dockerfile to include Composer installation:

FROM php:8.2-apache
RUN apt-get update && apt-get install -y git unzip \
    && docker-php-ext-install pdo pdo_mysql
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html/
COPY . .
RUN composer install --no-dev --optimize-autoloader
RUN a2enmod rewrite
EXPOSE 80
CMD ["apache2-foreground"]


Commit and push all changes to GitHub.
Render will redeploy automatically.
After deployment, the URL should display the rendered Twig homepage instead of a blank screen.