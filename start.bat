@echo off
SETLOCAL EnableDelayedExpansion

echo ======================================================
echo   IT Sklad - Запуск проекту на новому пристрої
echo ======================================================

:: Перевірка наявності Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js не знайдено! Будь ласка, встановіть Node.js з https://nodejs.org/
    pause
    exit /b 1
)

:: Встановлення залежностей, якщо папка node_modules відсутня
if not exist "node_modules\" (
    echo [INFO] Встановлення залежностей (npm install)...
    call npm install
)

:: Генерація Prisma Client
echo [INFO] Генерація Prisma Client...
call npx prisma generate

:: Синхронізація бази даних
:: Примітка: це створить dev.db, якщо його ще немає
echo [INFO] Синхронізація бази даних...
call npx prisma db push --accept-data-loss

:: Створення дефолтного адміна (admin/admin), якщо база порожня
if exist "seed.cjs" (
    echo [INFO] Створення адміністратора за замовчуванням...
    node seed.cjs
) else (
    echo [WARNING] Файл seed.cjs не знайдено. Адміністратор може бути не створений.
)

:: Запуск проекту
echo [SUCCESS] Проект готовий до роботи!
echo [INFO] Сервер запускається на http://localhost:3000
echo [INFO] Доступ по мережі: http://0.0.0.0:3000
echo ======================================================

call npm run dev -- -H 0.0.0.0

pause
