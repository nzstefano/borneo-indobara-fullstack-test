api-laravel

composer install

cp .env.example .env && php artisan key:generate

Use SQLite: set DB_CONNECTION=sqlite & DB_DATABASE=database/database.sqlite, then:

mkdir -p database && touch database/database.sqlite

php artisan migrate --seed

php artisan serve --port=8081

Test: GET http://127.0.0.1:8081/api/users?per_page=5&page=1
