import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface OrderStatusUpdateEmailProps {
  orderNumber: string;
  customerName: string;
  status: string;
  statusLabel: string;
  statusMessage: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

const statusConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  IN_PREPRODUCTION: { icon: '📋', color: '#3b82f6', bgColor: '#dbeafe' },
  IN_DESIGN: { icon: '🎨', color: '#8b5cf6', bgColor: '#ede9fe' },
  IN_PRODUCTION: { icon: '🏭', color: '#f59e0b', bgColor: '#fef3c7' },
  IN_PRINTING: { icon: '🖨️', color: '#f59e0b', bgColor: '#fef3c7' },
  QUALITY_CHECK: { icon: '✓', color: '#10b981', bgColor: '#d1fae5' },
  READY_FOR_DELIVERY: { icon: '📦', color: '#10b981', bgColor: '#d1fae5' },
  DELIVERED: { icon: '✅', color: '#059669', bgColor: '#a7f3d0' },
  CANCELLED: { icon: '❌', color: '#ef4444', bgColor: '#fee2e2' },
};

export default function OrderStatusUpdateEmail({
  orderNumber,
  customerName,
  status,
  statusLabel,
  statusMessage,
  trackingNumber,
  estimatedDelivery,
}: OrderStatusUpdateEmailProps) {
  const config = statusConfig[status] || statusConfig.IN_PRODUCTION;

  return (
    <Html>
      <Head />
      <Preview>Обновление статуса заказа #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Sanduta Art</Heading>
          </Section>

          {/* Status Update Box */}
          <Section style={{ ...statusBox, backgroundColor: config.bgColor }}>
            <Text style={{ ...statusIcon, fontSize: '48px' }}>{config.icon}</Text>
            <Heading style={{ ...h2, color: config.color }}>{statusLabel}</Heading>
            <Text style={paragraph}>
              Привет, <strong>{customerName}</strong>!
            </Text>
            <Text style={paragraph}>
              Статус вашего заказа <strong>#{orderNumber}</strong> изменился
            </Text>
            <Text style={{ ...statusText, color: config.color }}>
              {statusMessage}
            </Text>
          </Section>

          {/* Tracking Number */}
          {trackingNumber && (
            <Section style={infoBox}>
              <Text style={infoLabel}>Трек-номер для отслеживания:</Text>
              <Text style={trackingText}>{trackingNumber}</Text>
              <Text style={infoSubtext}>
                Вы можете отследить вашу посылку на сайте службы доставки
              </Text>
            </Section>
          )}

          {/* Estimated Delivery */}
          {estimatedDelivery && (
            <Section style={infoBox}>
              <Text style={infoLabel}>Ожидаемая дата доставки:</Text>
              <Text style={trackingText}>{estimatedDelivery}</Text>
            </Section>
          )}

          {/* CTA Button */}
          <Section style={buttonContainer}>
            <Button
              style={button}
              href={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://sanduta.art'}/account/orders/${orderNumber}`}
            >
              Просмотреть детали заказа
            </Button>
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              Если у вас есть вопросы, пожалуйста, свяжитесь с нами по адресу{' '}
              <a href="mailto:support@sanduta.art" style={link}>
                support@sanduta.art
              </a>
            </Text>
            <Text style={footerText}>© 2026 Sanduta Art. Все права защищены.</Text>
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
  padding: '32px 48px',
  backgroundColor: '#1e293b',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
};

const statusBox = {
  padding: '40px 48px',
  textAlign: 'center' as const,
  borderRadius: '8px',
  margin: '32px 24px',
};

const statusIcon = {
  fontSize: '48px',
  margin: '0 0 16px 0',
};

const h2 = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
};

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  margin: '8px 0',
};

const statusText = {
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '28px',
  textAlign: 'center' as const,
  margin: '16px 0 0 0',
};

const infoBox = {
  padding: '24px 48px',
  backgroundColor: '#f8fafc',
  borderRadius: '8px',
  margin: '16px 24px',
};

const infoLabel = {
  color: '#64748b',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 8px 0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const trackingText = {
  color: '#1e293b',
  fontSize: '20px',
  fontWeight: 'bold',
  fontFamily: 'monospace',
  margin: '0 0 8px 0',
};

const infoSubtext = {
  color: '#64748b',
  fontSize: '14px',
  margin: '0',
};

const buttonContainer = {
  padding: '24px 48px',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '32px 0',
};

const footer = {
  padding: '0 48px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  margin: '8px 0',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};
