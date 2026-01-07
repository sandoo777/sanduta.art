# Image Upload System

## Overview
Система загрузки изображений через Cloudinary с локальным fallback для разработки.

## 🚀 Quick Setup - Cloudinary (Рекомендуется)

### Шаг 1: Создание бесплатного аккаунта Cloudinary

1. **Регистрация**: Перейдите на [cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
   - Бесплатный план: 25 GB хранилища + 25 GB трафика/месяц
   - Без кредитной карты

2. **После регистрации** вы попадете на Dashboard

### Шаг 2: Получение Credentials

На главной странице Dashboard найдите секцию **"Account Details"**:

```
Cloud name: dxxxxxx
API Key: 123456789012345
API Secret: AbCdEfGhIjKlMnOpQrStUvWxYz
```

### Шаг 3: Настройка Environment Variables

#### Вариант 1: Прямой URL (Самый простой)
```env
CLOUDINARY_URL="cloudinary://123456789012345:AbCdEfGhIjKlMnOpQrStUvWxYz@dxxxxxx"
```

#### Вариант 2: Отдельные переменные
```env
CLOUDINARY_CLOUD_NAME="dxxxxxx"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="AbCdEfGhIjKlMnOpQrStUvWxYz"
```

### Шаг 4: Тестирование

Запустите скрипт проверки:
```bash
npm run test:cloudinary
# или
npx tsx scripts/test-cloudinary.ts
```

## Как работает

### 🌐 Cloudinary (Production & Development)
Если `CLOUDINARY_URL` настроен правильно:
- ✅ Изображения загружаются в облако
- ✅ Автоматическая оптимизация
- ✅ CDN для быстрой загрузки
- ✅ Трансформации (resize, crop, format)
- ✅ Работает на всех платформах (Vercel, Railway, etc.)

### 💾 Локальное хранилище (Fallback)
Если Cloudinary не настроен:
- ⚠️ Изображения сохраняются в `/public/uploads/products/`
- ⚠️ Только для локальной разработки
- ⚠️ Не работает на serverless платформах
- ⚠️ Файлы не в git (см. `.gitignore`)

## 📝 Пошаговая инструкция с скриншотами

## 📝 Пошаговая инструкция с скриншотами

### Где найти credentials на Cloudinary Dashboard:

1. **Cloud Name**: В верхней части страницы, под логотипом
2. **API Key & Secret**: В разделе "Account Details" → "API Keys"
3. **Environment Variable**: Готовая строка "API Environment variable"

### Пример правильного .env:

```env
# Production-ready Cloudinary configuration
CLOUDINARY_URL="cloudinary://123456789012345:AbCdEfGhIjKlMnOpQrStUvWxYz@dxxxxxx"

# Или отдельные переменные:
CLOUDINARY_CLOUD_NAME="dxxxxxx"
CLOUDINARY_API_KEY="123456789012345"
CLOUDINARY_API_SECRET="AbCdEfGhIjKlMnOpQrStUvWxYz"
```

### После настройки:

1. **Перезапустите dev сервер**:
   ```bash
   npm run dev
   ```

2. **Проверьте upload**:
   - Откройте: `/admin/products`
   - Нажмите "Add New Product"
   - Загрузите изображение
   - Должна появиться Cloudinary URL вида: `https://res.cloudinary.com/dxxxxxx/...`

## 🔧 API Reference

### POST `/api/upload`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: FormData с полем `file`

**Response Success (200):**
```json
{
  "url": "https://res.cloudinary.com/dxxxxxx/image/upload/v1234567890/sanduta-products/image.jpg"
}
```

**Response Error (400):**
```json
{
  "error": "No file provided"
}
```

**Response Error (500):**
```json
{
  "error": "Upload failed",
  "details": "Error message"
}
```

## 📊 Upload Settings

- **Folder**: `sanduta-products`
- **Max file size**: 5MB (проверяется на клиенте)
- **Supported formats**: Все image/* типы
- **Auto-optimization**: Да (Cloudinary)
- **CDN**: Да (Cloudinary)

## ⚙️ Advanced Configuration

### Настройка трансформаций

Обновите upload API для автоматических трансформаций:

```typescript
cloudinary.uploader.upload_stream({
  folder: "sanduta-products",
  transformation: [
    { width: 1200, height: 1200, crop: "limit" },
    { quality: "auto" },
    { fetch_format: "auto" }
  ]
})
```

### Upload Presets

Создайте Upload Preset в Cloudinary Dashboard:
1. Settings → Upload → Upload presets
2. Add upload preset
3. Настройте transformations
4. Используйте в коде: `upload_preset: "your_preset_name"`

## 🔍 Troubleshooting

## 🔍 Troubleshooting

### ❌ Ошибка: "Unknown API key"
**Причина**: Неправильные Cloudinary credentials

**Решение**:
1. Проверьте `.env` файл
2. Убедитесь, что нет пробелов в URL
3. Перезапустите dev сервер
4. Проверьте credentials на Cloudinary Dashboard

### ❌ Изображения не отображаются после деплоя
**Причина**: Используется локальное хранилище

**Решение**:
- Настройте Cloudinary на production
- Добавьте `CLOUDINARY_URL` в environment variables на Vercel/Railway

### ❌ Upload timeout
**Причина**: Медленное соединение или большой файл

**Решение**:
1. Сожмите изображение перед загрузкой
2. Увеличьте timeout в API route
3. Используйте прогресс-бар для UX

### ✅ Проверка настроек

Запустите тест:
```bash
npm run test:cloudinary
```

Ожидаемый результат:
```
✅ Cloudinary configured
✅ Cloud name: dxxxxxx
✅ API key: 123456789012345
✅ Upload test: SUCCESS
```

## 🌟 Best Practices

### 1. Безопасность
- ✅ Никогда не коммитьте `.env` в git
- ✅ Используйте environment variables на production
- ✅ Регулярно обновляйте API secrets

### 2. Оптимизация
- ✅ Используйте Cloudinary transformations
- ✅ Включите auto-format и auto-quality
- ✅ Настройте lazy loading на frontend

### 3. Организация
- ✅ Используйте папки: `sanduta-products/`, `sanduta-users/`, etc.
- ✅ Добавляйте metadata к изображениям
- ✅ Настройте auto-backup в Cloudinary

## 📚 Дополнительные ресурсы

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Upload Widget](https://cloudinary.com/documentation/upload_widget)
- [Transformations Guide](https://cloudinary.com/documentation/image_transformations)

## 💡 Next Steps

1. ✅ Зарегистрируйтесь на Cloudinary (5 минут)
2. ✅ Обновите `.env` с вашими credentials
3. ✅ Перезапустите dev сервер
4. ✅ Протестируйте upload
5. ✅ Добавьте `CLOUDINARY_URL` на production (Vercel/Railway)

---

**Нужна помощь?** Откройте issue на GitHub или проверьте логи в консоли браузера и сервера.
