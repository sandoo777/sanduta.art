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

export default function AdminNewOrderEmail(data: OrderEmailData) {
  const { orderId, orderNumber, customerName, customerEmail, customerPhone, items, subtotal, shippingCost, total, paymentMethod, deliveryMethod, deliveryAddress, city, novaPoshtaWarehouse, trackingNumber, createdAt } = data;

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
      <Preview>Новый заказ #{orderNumber} от {customerName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Новый заказ!</Heading>
          </Section>

          {/* Alert Box */}
          <Section style={alertBox}>
            <Text style={alertIcon}>🔔</Text>
            <Heading style={h2}>Заказ #{orderNumber}</Heading>
            <Text style={paragraph}>{formattedDate}</Text>
            <Link
              style={button}
              href={`${process.env.NEXTAUTH_URL}/admin?tab=orders`}
            >
              Перейти в админ-панель
            </Link>
          </Section>

          {/* Customer Info */}
          <Section style={infoSection}>
            <Heading style={h3}>Информация о клиенте</Heading>
            <Text style={infoText}>
              <strong>Имя:</strong> {customerName}
            </Text>
            <Text style={infoText}>
              <strong>Email:</strong>{' '}
              <Link href={`mailto:${customerEmail}`} style={link}>
                {customerEmail}
              </Link>
            </Text>
            <Text style={infoText}>
              <strong>Телефон:</strong>{' '}
              <Link href={`tel:${customerPhone}`} style={link}>
                {customerPhone}
              </Link>
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
                  <Text style={itemQuantity}>
                    {item.quantity} шт. × {item.price} грн
                  </Text>
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
                <Text style={totalLabelBold}>Итого к получению:</Text>
              </Column>
              <Column>
                <Text style={totalValueBold}>{total} грн</Text>
              </Column>
            </Row>
          </Section>

          {/* Payment and Delivery */}
          <Section style={deliverySection}>
            <Heading style={h3}>Оплата и доставка</Heading>
            <Row style={infoRow}>
              <Column style={iconCol}>
                <Text style={icon}>💳</Text>
              </Column>
              <Column>
                <Text style={labelText}>Способ оплаты</Text>
                <Text style={valueText}>
                  {paymentMethod === 'card' ? 'Оплата картой (оплачено)' : 'Наложенный платеж (оплата при получении)'}
                </Text>
              </Column>
            </Row>
            <Hr style={dividerLight} />
            <Row style={infoRow}>
              <Column style={iconCol}>
                <Text style={icon}>📦</Text>
              </Column>
              <Column>
                <Text style={labelText}>Способ доставки</Text>
                <Text style={valueText}>
                  {deliveryMethod === 'novaposhta' ? 'Новая Почта' : deliveryMethod === 'courier' ? 'Курьер' : 'Самовывоз'}
                </Text>
              </Column>
            </Row>
            {city && (
              <>
                <Hr style={dividerLight} />
                <Row style={infoRow}>
                  <Column style={iconCol}>
                    <Text style={icon}>🏙️</Text>
                  </Column>
                  <Column>
                    <Text style={labelText}>Город</Text>
                    <Text style={valueText}>{city}</Text>
                  </Column>
                </Row>
              </>
            )}
            {novaPoshtaWarehouse && (
              <>
                <Hr style={dividerLight} />
                <Row style={infoRow}>
                  <Column style={iconCol}>
                    <Text style={icon}>🏢</Text>
                  </Column>
                  <Column>
                    <Text style={labelText}>Отделение Новой Почты</Text>
                    <Text style={valueText}>{novaPoshtaWarehouse}</Text>
                  </Column>
                </Row>
              </>
            )}
            {deliveryAddress && (
              <>
                <Hr style={dividerLight} />
                <Row style={infoRow}>
                  <Column style={iconCol}>
                    <Text style={icon}>📍</Text>
                  </Column>
                  <Column>
                    <Text style={labelText}>Адрес доставки</Text>
                    <Text style={valueText}>{deliveryAddress}</Text>
                  </Column>
                </Row>
              </>
            )}
            {trackingNumber && (
              <>
                <Hr style={dividerLight} />
                <Row style={infoRow}>
                  <Column style={iconCol}>
                    <Text style={icon}>🔢</Text>
                  </Column>
                  <Column>
                    <Text style={labelText}>ТТН</Text>
                    <Text style={valueText}>{trackingNumber}</Text>
                  </Column>
                </Row>
              </>
            )}
          </Section>

          {/* Action Items */}
          <Section style={actionSection}>
            <Heading style={h3}>Необходимые действия</Heading>
            <Text style={actionItem}>✓ Проверьте наличие товаров на складе</Text>
            <Text style={actionItem}>✓ Подготовьте заказ к отправке</Text>
            <Text style={actionItem}>✓ Создайте накладную в системе Новой Почты</Text>
            <Text style={actionItem}>✓ Обновите статус заказа в админ-панели</Text>
          </Section>

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Link
              style={buttonPrimary}
              href={`${process.env.NEXTAUTH_URL}/admin?tab=orders&orderId=${orderId}`}
            >
              Открыть заказ в админке
            </Link>
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              Это уведомление отправлено автоматически.
            </Text>
            <Text style={footerTextSmall}>
              © 2026 Sanduta Art Admin System
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
  backgroundColor: '#dc2626',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const alertBox = {
  padding: '32px 24px',
  textAlign: 'center' as const,
  backgroundColor: '#fef2f2',
  borderLeft: '4px solid #dc2626',
};

const alertIcon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
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
  margin: '0 0 16px 0',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '10px 24px',
  marginTop: '8px',
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

const dividerLight = {
  borderColor: '#f3f4f6',
  margin: '12px 0',
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
  color: '#dc2626',
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
  margin: '0',
};

const deliverySection = {
  padding: '24px',
  backgroundColor: '#fef3c7',
  marginBottom: '16px',
};

const infoRow = {
  marginBottom: '12px',
};

const iconCol = {
  width: '40px',
  verticalAlign: 'top' as const,
};

const icon = {
  fontSize: '24px',
  margin: '0',
};

const labelText = {
  color: '#6b7280',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px 0',
};

const valueText = {
  color: '#1f2937',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const actionSection = {
  padding: '24px',
  backgroundColor: '#f0fdf4',
  borderLeft: '4px solid #10b981',
  marginBottom: '16px',
};

const actionItem = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 8px 0',
};

const buttonSection = {
  padding: '0 24px 24px',
  textAlign: 'center' as const,
};

const buttonPrimary = {
  backgroundColor: '#dc2626',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
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
