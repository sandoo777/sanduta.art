/**
 * Email Templates Multilingual
 * Template-uri de email pentru fiecare limbă
 */

import type { Locale } from '@/i18n/config';

export interface EmailTemplate {
  subject: string;
  preheader: string;
  greeting: string;
  body: string;
  cta?: string;
  footer: string;
}

export const emailTemplates: Record<string, Record<Locale, EmailTemplate>> = {
  // Confirmare comandă
  orderConfirmation: {
    ro: {
      subject: 'Comanda #{orderId} confirmată',
      preheader: 'Mulțumim pentru comandă! Procesăm comanda ta.',
      greeting: 'Bună {customerName},',
      body: `
        <p>Mulțumim pentru comanda ta!</p>
        <p>Am primit comanda <strong>#{orderId}</strong> și o procesăm în cel mai scurt timp.</p>
        <h3>Detalii comandă:</h3>
        <p>Total: <strong>{total} RON</strong></p>
        <p>Status: <strong>{status}</strong></p>
        <p>Timp estimat producție: <strong>{productionTime} zile lucrătoare</strong></p>
      `,
      cta: 'Vezi comanda',
      footer: 'Dacă ai întrebări, contactează-ne la support@sanduta.art',
    },
    en: {
      subject: 'Order #{orderId} confirmed',
      preheader: 'Thank you for your order! We are processing it.',
      greeting: 'Hello {customerName},',
      body: `
        <p>Thank you for your order!</p>
        <p>We received your order <strong>#{orderId}</strong> and are processing it.</p>
        <h3>Order Details:</h3>
        <p>Total: <strong>{total} RON</strong></p>
        <p>Status: <strong>{status}</strong></p>
        <p>Estimated production time: <strong>{productionTime} business days</strong></p>
      `,
      cta: 'View Order',
      footer: 'If you have questions, contact us at support@sanduta.art',
    },
    ru: {
      subject: 'Заказ #{orderId} подтвержден',
      preheader: 'Спасибо за ваш заказ! Мы обрабатываем его.',
      greeting: 'Здравствуйте {customerName},',
      body: `
        <p>Спасибо за ваш заказ!</p>
        <p>Мы получили заказ <strong>#{orderId}</strong> и обрабатываем его.</p>
        <h3>Детали заказа:</h3>
        <p>Итого: <strong>{total} RON</strong></p>
        <p>Статус: <strong>{status}</strong></p>
        <p>Ориентировочное время производства: <strong>{productionTime} рабочих дней</strong></p>
      `,
      cta: 'Просмотреть заказ',
      footer: 'По вопросам обращайтесь: support@sanduta.art',
    },
  },

  // Comandă expediată
  orderShipped: {
    ro: {
      subject: 'Comanda #{orderId} a fost expediată',
      preheader: 'Comanda ta este pe drum!',
      greeting: 'Bună {customerName},',
      body: `
        <p>Comanda ta <strong>#{orderId}</strong> a fost expediată!</p>
        <h3>Informații livrare:</h3>
        <p>Curier: <strong>{courier}</strong></p>
        <p>AWB: <strong>{trackingNumber}</strong></p>
        <p>Estimare livrare: <strong>{estimatedDelivery}</strong></p>
      `,
      cta: 'Urmărește coletul',
      footer: 'Dacă ai întrebări, contactează-ne la support@sanduta.art',
    },
    en: {
      subject: 'Order #{orderId} has been shipped',
      preheader: 'Your order is on the way!',
      greeting: 'Hello {customerName},',
      body: `
        <p>Your order <strong>#{orderId}</strong> has been shipped!</p>
        <h3>Delivery Information:</h3>
        <p>Courier: <strong>{courier}</strong></p>
        <p>Tracking: <strong>{trackingNumber}</strong></p>
        <p>Estimated delivery: <strong>{estimatedDelivery}</strong></p>
      `,
      cta: 'Track Package',
      footer: 'If you have questions, contact us at support@sanduta.art',
    },
    ru: {
      subject: 'Заказ #{orderId} отправлен',
      preheader: 'Ваш заказ в пути!',
      greeting: 'Здравствуйте {customerName},',
      body: `
        <p>Ваш заказ <strong>#{orderId}</strong> отправлен!</p>
        <h3>Информация о доставке:</h3>
        <p>Курьер: <strong>{courier}</strong></p>
        <p>Трекинг: <strong>{trackingNumber}</strong></p>
        <p>Ориентировочная доставка: <strong>{estimatedDelivery}</strong></p>
      `,
      cta: 'Отследить посылку',
      footer: 'По вопросам обращайтесь: support@sanduta.art',
    },
  },

  // Comandă livrată
  orderDelivered: {
    ro: {
      subject: 'Comanda #{orderId} a fost livrată',
      preheader: 'Sperăm că îți place produsul!',
      greeting: 'Bună {customerName},',
      body: `
        <p>Comanda ta <strong>#{orderId}</strong> a fost livrată cu succes!</p>
        <p>Sperăm că îți place produsul nostru!</p>
        <p>Dacă ai orice problemă, te rugăm să ne contactezi.</p>
      `,
      cta: 'Lasă o recenzie',
      footer: 'Mulțumim că ai ales Sanduta.art!',
    },
    en: {
      subject: 'Order #{orderId} has been delivered',
      preheader: 'We hope you love your product!',
      greeting: 'Hello {customerName},',
      body: `
        <p>Your order <strong>#{orderId}</strong> has been successfully delivered!</p>
        <p>We hope you love our product!</p>
        <p>If you have any issues, please contact us.</p>
      `,
      cta: 'Leave a Review',
      footer: 'Thank you for choosing Sanduta.art!',
    },
    ru: {
      subject: 'Заказ #{orderId} доставлен',
      preheader: 'Надеемся, вам понравится продукт!',
      greeting: 'Здравствуйте {customerName},',
      body: `
        <p>Ваш заказ <strong>#{orderId}</strong> успешно доставлен!</p>
        <p>Надеемся, вам понравится наш продукт!</p>
        <p>При возникновении проблем, свяжитесь с нами.</p>
      `,
      cta: 'Оставить отзыв',
      footer: 'Спасибо, что выбрали Sanduta.art!',
    },
  },

  // Resetare parolă
  passwordReset: {
    ro: {
      subject: 'Resetare parolă',
      preheader: 'Ai solicitat resetarea parolei',
      greeting: 'Bună {customerName},',
      body: `
        <p>Am primit o solicitare de resetare a parolei pentru contul tău.</p>
        <p>Dacă nu ai făcut această solicitare, ignoră acest email.</p>
        <p>Link-ul este valabil 1 oră.</p>
      `,
      cta: 'Resetează parola',
      footer: 'Pentru securitatea contului tău, nu împărtăși acest link.',
    },
    en: {
      subject: 'Password Reset',
      preheader: 'You requested a password reset',
      greeting: 'Hello {customerName},',
      body: `
        <p>We received a password reset request for your account.</p>
        <p>If you didn't make this request, ignore this email.</p>
        <p>The link is valid for 1 hour.</p>
      `,
      cta: 'Reset Password',
      footer: 'For your account security, do not share this link.',
    },
    ru: {
      subject: 'Сброс пароля',
      preheader: 'Вы запросили сброс пароля',
      greeting: 'Здравствуйте {customerName},',
      body: `
        <p>Мы получили запрос на сброс пароля для вашего аккаунта.</p>
        <p>Если вы не делали этот запрос, игнорируйте это письмо.</p>
        <p>Ссылка действительна 1 час.</p>
      `,
      cta: 'Сбросить пароль',
      footer: 'Для безопасности аккаунта не делитесь этой ссылкой.',
    },
  },
};

/**
 * Obține template de email pentru o limbă
 */
export function getEmailTemplate(
  type: string,
  locale: Locale
): EmailTemplate | null {
  return emailTemplates[type]?.[locale] || null;
}

/**
 * Interpolează variabile în template
 */
export function interpolateEmailTemplate(
  template: EmailTemplate,
  variables: Record<string, string>
): EmailTemplate {
  const interpolate = (text: string) => {
    return text.replace(/\{(\w+)\}/g, (_, key) => variables[key] || `{${key}}`);
  };

  return {
    subject: interpolate(template.subject),
    preheader: interpolate(template.preheader),
    greeting: interpolate(template.greeting),
    body: interpolate(template.body),
    cta: template.cta ? interpolate(template.cta) : undefined,
    footer: interpolate(template.footer),
  };
}
