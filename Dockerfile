FROM php:8.3-cli-alpine

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install dev libraries needed for PHP extensions
RUN apk add --no-cache postgresql-dev icu-dev linux-headers \
    libpng-dev libjpeg-turbo-dev freetype-dev libzip-dev

# Install build tools
RUN apk add --no-cache autoconf g++ make

# Configure and build PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_pgsql pgsql intl gd zip

# Build Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Clean up build deps (keep runtime libs)
RUN apk del autoconf g++ make

WORKDIR /var/www/html

EXPOSE 8000

# Default command: run Laravel dev server
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
