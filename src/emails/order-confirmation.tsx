import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';
import { OrderEmailData } from '@/lib/email';

export default function OrderConfirmationEmail(data: OrderEmailData) {
  const { orderNumber, customerName, items, subtotal, shippingCost, total, paymentMethod, deliveryMethod, deliveryAddress, city, novaPoshtaWarehouse, trackingNumber, createdAt } = data;

  const formattedDate = new Date(createdAt).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Html>
      <Head />
      <Preview>Ваш заказ #{orderNumber} успешно оформлен</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Sanduta Art</Heading>
          </Section>

          {/* Success Message */}
          <Section style={successBox}>
            <Text style={successIcon}>✓</Text>
            <Heading style={h2}>Спасибо за ваш заказ!</Heading>
            <Text style={paragraph}>
              Заказ <strong>#{orderNumber}</strong> успешно оформлен
            </Text>
            <Text style={dateText}>{formattedDate}</Text>
          </Section>

          {/* Customer Info */}
          <Section style={infoSection}>
            <Heading style={h3}>Информация о получателе</Heading>
            <Text style={infoText}>
              <strong>Имя:</strong> {customerName}
            </Text>
          </Section>

          {/* Order Items */}
          <Section style={itemsSection}>
            <Heading style={h3}>Состав заказа</Heading>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={itemImageCol}>
                  {item.image_url && (
                    <Img
                      src={item.image_url}
                      alt={item.name}
                      width="80"
                      height="80"
                      style={itemImage}
                    />
                  )}
                </Column>
                <Column style={itemDetailsCol}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemQuantity}>Количество: {item.quantity}</Text>
                </Column>
                <Column style={itemPriceCol}>
                  <Text style={itemPrice}>{item.price * item.quantity} грн</Text>
                </Column>
              </Row>
            ))}
            <Hr style={divider} />
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Стоимость товаров:</Text>
              </Column>
              <Column>
                <Text style={totalValue}>{subtotal} грн</Text>
              </Column>
            </Row>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Доставка:</Text>
              </Column>
              <Column>
                <Text style={totalValue}>{shippingCost > 0 ? `${shippingCost} грн` : 'Бесплатно'}</Text>
              </Column>
            </Row>
            <Hr style={divider} />
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabelBold}>Итого:</Text>
              </Column>
              <Column>
                <Text style={totalValueBold}>{total} грн</Text>
              </Column>
            </Row>
          </Section>

          {/* Payment and Delivery */}
          <Section style={infoSection}>
            <Heading style={h3}>Оплата и доставка</Heading>
            <Text style={infoText}>
              <strong>Способ оплаты:</strong> {paymentMethod === 'card' ? 'Оплата картой' : 'Наложенный платеж'}
            </Text>
            <Text style={infoText}>
              <strong>Способ доставки:</strong>{' '}
              {deliveryMethod === 'novaposhta' ? 'Новая Почта' : deliveryMethod === 'courier' ? 'Курьер' : 'Самовывоз'}
            </Text>
            {city && (
              <Text style={infoText}>
                <strong>Город:</strong> {city}
              </Text>
            )}
            {novaPoshtaWarehouse && (
              <Text style={infoText}>
                <strong>Отделение:</strong> {novaPoshtaWarehouse}
              </Text>
            )}
            {deliveryAddress && (
              <Text style={infoText}>
                <strong>Адрес:</strong> {deliveryAddress}
              </Text>
            )}
            {trackingNumber && (
              <Text style={infoText}>
                <strong>Номер ТТН:</strong> {trackingNumber}
              </Text>
            )}
          </Section>

          {/* Next Steps */}
          <Section style={stepsSection}>
            <Heading style={h3}>Что дальше?</Heading>
            <Text style={stepText}>1. Мы получили ваш заказ и начали его обработку</Text>
            <Text style={stepText}>2. В течение 1-2 рабочих дней подготовим товары к отправке</Text>
            <Text style={stepText}>3. Отправим посылку и пришлем вам трек-номер для отслеживания</Text>
            <Text style={stepText}>4. Доставка займет 1-3 рабочих дня</Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Link
              style={button}
              href={`${process.env.NEXTAUTH_URL}/account/orders/${data.orderId}`}
            >
              Посмотреть заказ
            </Link>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              Если у вас есть вопросы, свяжитесь с нами:
            </Text>
            <Text style={footerText}>
              <Link href="mailto:support@sanduta.art" style={link}>
                support@sanduta.art
              </Link>
            </Text>
            <Text style={footerTextSmall}>
              © 2026 Sanduta Art. Все права защищены.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#2563eb',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const successBox = {
  padding: '32px 24px',
  textAlign: 'center' as const,
};

const successIcon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
  color: '#10b981',
};

const h2 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 8px 0',
};

const h3 = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px 0',
};

const dateText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const infoSection = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  marginBottom: '16px',
};

const infoText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px 0',
};

const itemsSection = {
  padding: '24px',
};

const itemRow = {
  marginBottom: '16px',
};

const itemImageCol = {
  width: '80px',
  paddingRight: '16px',
  verticalAlign: 'top' as const,
};

const itemImage = {
  borderRadius: '8px',
  objectFit: 'cover' as const,
};

const itemDetailsCol = {
  verticalAlign: 'top' as const,
};

const itemName = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const itemQuantity = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '0',
};

const itemPriceCol = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
};

const itemPrice = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
};

const totalRow = {
  marginBottom: '8px',
};

const totalLabel = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '0',
};

const totalValue = {
  color: '#1f2937',
  fontSize: '14px',
  textAlign: 'right' as const,
  margin: '0',
};

const totalLabelBold = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0',
};

const totalValueBold = {
  color: '#2563eb',
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
  margin: '0',
};

const stepsSection = {
  padding: '24px',
  backgroundColor: '#eff6ff',
  marginBottom: '16px',
};

const stepText = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 8px 0',
};

const buttonSection = {
  padding: '0 24px 24px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const footer = {
  padding: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px 0',
};

const footerTextSmall = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '16px 0 0 0',
};

const link = {
  color: '#2563eb',
  textDecoration: 'underline',
};
