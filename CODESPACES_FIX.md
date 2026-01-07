# GitHub Codespaces Login Fix

## Проблема
При попытке входа в систему появлялась ошибка 401 Unauthorized из-за неправильного NEXTAUTH_URL.

## Решение
NextAuth требует правильный URL для работы callback endpoints в GitHub Codespaces.

### Обновите .env файл:
```env
NEXTAUTH_URL="https://[YOUR_CODESPACE_NAME]-3000.app.github.dev"
```

Замените `[YOUR_CODESPACE_NAME]` на имя вашего кодспейса.

Чтобы узнать имя кодспейса:
```bash
echo $CODESPACE_NAME
```

### Текущий кодспейс:
```
NEXTAUTH_URL="https://opulent-guide-55vg94v9gvxc7v94-3000.app.github.dev"
```

## Данные для входа
- **Email:** admin@sanduta.art
- **Password:** admin123

## После изменения .env
Перезапустите dev сервер:
```bash
pkill -f "next dev"
npm run dev
```

## Также исправлено
- Обновлен middleware для правильной работы с getToken
- Упрощен AdminLayout (middleware теперь обрабатывает авторизацию)
- Удалены ненужные редиректы из next.config.ts
- Исправлена валидация в validation.ts
