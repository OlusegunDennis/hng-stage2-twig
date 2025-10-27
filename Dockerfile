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