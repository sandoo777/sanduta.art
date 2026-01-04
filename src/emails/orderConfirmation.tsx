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
  Button,
} from '@react-email/components';
import * as React from 'react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
  specifications?: {
    dimensions?: {
      width: number;
      height: number;
      depth?: number;
    };
    material?: {
      name: string;
    };
  };
}

interface OrderConfirmationProps {
  orderNumber: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: {
    street: string;
    number: string;
    apt?: string;
    city: string;
    country: string;
    postalCode: string;
  };
  items: OrderItem[];
  subtotal: number;
  vat: number;
  shippingCost: number;
  total: number;
  deliveryMethod: {
    name: string;
    estimatedDays: string;
  };
  paymentMethod: {
    name: string;
    type: string;
  };
  createdAt: Date;
}

export default function OrderConfirmationEmail({
  orderNumber,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  deliveryAddress,
  items,
  subtotal,
  vat,
  shippingCost,
  total,
  deliveryMethod,
  paymentMethod,
  createdAt,
}: OrderConfirmationProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sanduta.art';
  const orderUrl = `${baseUrl}/account/orders/${orderId}`;

  return (
    <Html>
      <Head />
      <Preview>Confirmarea comenzii #{orderNumber} - Sanduta Art</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Logo */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/logo.png`}
              alt="Sanduta Art"
              width="150"
              height="40"
              style={logo}
            />
          </Section>

          {/* Success Message */}
          <Section style={successBox}>
            <Text style={successIcon}>✓</Text>
            <Heading style={h1}>Comanda ta a fost plasată cu succes!</Heading>
            <Text style={paragraph}>
              Confirmarea comenzii <strong className="text-blue-600">#{orderNumber}</strong>
            </Text>
            <Text style={dateText}>{formattedDate}</Text>
          </Section>

          {/* Customer Info Section */}
          <Section style={infoSection}>
            <Heading style={h2}>📋 Informații client</Heading>
            <Row style={infoRow}>
              <Column style={infoLabel}>
                <Text style={infoLabelText}>Nume:</Text>
              </Column>
              <Column>
                <Text style={infoValueText}>{customerName}</Text>
              </Column>
            </Row>
            <Row style={infoRow}>
              <Column style={infoLabel}>
                <Text style={infoLabelText}>Email:</Text>
              </Column>
              <Column>
                <Text style={infoValueText}>{customerEmail}</Text>
              </Column>
            </Row>
            <Row style={infoRow}>
              <Column style={infoLabel}>
                <Text style={infoLabelText}>Telefon:</Text>
              </Column>
              <Column>
                <Text style={infoValueText}>{customerPhone}</Text>
              </Column>
            </Row>
          </Section>

          {/* Delivery Address Section */}
          <Section style={infoSection}>
            <Heading style={h2}>📍 Adresă de livrare</Heading>
            <Text style={addressText}>
              {deliveryAddress.street} {deliveryAddress.number}
              {deliveryAddress.apt && `, Ap. ${deliveryAddress.apt}`}
            </Text>
            <Text style={addressText}>
              {deliveryAddress.city}, {deliveryAddress.postalCode}
            </Text>
            <Text style={addressText}>{deliveryAddress.country}</Text>
          </Section>

          {/* Order Items Section */}
          <Section style={itemsSection}>
            <Heading style={h2}>📦 Produse comandate</Heading>
            {items.map((item, index) => (
              <div key={item.id}>
                <Row style={itemRow}>
                  <Column style={itemDetailsCol}>
                    <Text style={itemName}>{item.name}</Text>
                    {item.specifications?.dimensions && (
                      <Text style={itemSpecs}>
                        Dimensiuni: {item.specifications.dimensions.width}×
                        {item.specifications.dimensions.height}
                        {item.specifications.dimensions.depth &&
                          `×${item.specifications.dimensions.depth}`}{' '}
                        cm
                      </Text>
                    )}
                    {item.specifications?.material && (
                      <Text style={itemSpecs}>
                        Material: {item.specifications.material.name}
                      </Text>
                    )}
                    <Text style={itemQuantity}>Cantitate: {item.quantity}</Text>
                  </Column>
                  <Column style={itemPriceCol}>
                    <Text style={itemPrice}>{item.totalPrice.toFixed(2)} RON</Text>
                  </Column>
                </Row>
                {index < items.length - 1 && <Hr style={itemDivider} />}
              </div>
            ))}
          </Section>

          {/* Order Totals */}
          <Section style={totalsSection}>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Subtotal produse:</Text>
              </Column>
              <Column style={totalValueCol}>
                <Text style={totalValue}>{subtotal.toFixed(2)} RON</Text>
              </Column>
            </Row>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>TVA (19%):</Text>
              </Column>
              <Column style={totalValueCol}>
                <Text style={totalValue}>{vat.toFixed(2)} RON</Text>
              </Column>
            </Row>
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Transport ({deliveryMethod.name}):</Text>
              </Column>
              <Column style={totalValueCol}>
                <Text style={totalValue}>
                  {shippingCost > 0 ? `${shippingCost.toFixed(2)} RON` : 'Gratuit'}
                </Text>
              </Column>
            </Row>
            <Hr style={totalDivider} />
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabelBold}>TOTAL:</Text>
              </Column>
              <Column style={totalValueCol}>
                <Text style={totalValueBold}>{total.toFixed(2)} RON</Text>
              </Column>
            </Row>
          </Section>

          {/* Delivery & Payment Info */}
          <Section style={deliverySection}>
            <Row>
              <Column style={deliveryInfoCol}>
                <Heading style={h3}>🚚 Livrare</Heading>
                <Text style={deliveryText}>{deliveryMethod.name}</Text>
                <Text style={deliveryTimeText}>
                  Timp estimat: {deliveryMethod.estimatedDays}
                </Text>
              </Column>
              <Column style={deliveryInfoCol}>
                <Heading style={h3}>💳 Plată</Heading>
                <Text style={deliveryText}>{paymentMethod.name}</Text>
                <Text style={deliveryTimeText}>
                  {paymentMethod.type === 'card' && 'Plată procesată cu succes'}
                  {paymentMethod.type === 'cash' && 'Plata la livrare'}
                  {paymentMethod.type === 'transfer' && 'Așteaptă transfer bancar'}
                  {paymentMethod.type === 'pickup' && 'Plata la ridicare'}
                </Text>
              </Column>
            </Row>
          </Section>

          {/* CTA Button */}
          <Section style={buttonSection}>
            <Button style={button} href={orderUrl}>
              Vezi comanda completă
            </Button>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Hr style={footerDivider} />
            <Heading style={h3}>Ai nevoie de ajutor?</Heading>
            <Text style={footerText}>
              Echipa noastră de suport este disponibilă să te ajute:
            </Text>
            <Text style={footerText}>
              📧 Email:{' '}
              <Link href="mailto:support@sanduta.art" style={link}>
                support@sanduta.art
              </Link>
            </Text>
            <Text style={footerText}>
              📞 Telefon:{' '}
              <Link href="tel:+40123456789" style={link}>
                +40 (123) 456-789
              </Link>
            </Text>
            <Hr style={footerDivider} />
            <Text style={copyrightText}>
              © {new Date().getFullYear()} Sanduta Art. Toate drepturile rezervate.
            </Text>
            <Text style={unsubscribeText}>
              Acest email conține informații despre comanda ta #{orderNumber}.
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
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const successBox = {
  padding: '32px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#f0fdf4',
  borderRadius: '12px',
  margin: '0 20px 32px',
};

const successIcon = {
  fontSize: '48px',
  margin: '0 0 16px',
};

const h1 = {
  color: '#111827',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 8px',
  padding: '0',
  lineHeight: '1.3',
};

const h2 = {
  color: '#111827',
  fontSize: '20px',
  fontWeight: '600',
  margin: '0 0 16px',
  padding: '0',
};

const h3 = {
  color: '#374151',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px',
};

const paragraph = {
  color: '#4b5563',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const dateText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '8px 0 0',
};

const infoSection = {
  padding: '24px 20px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  margin: '0 20px 16px',
};

const infoRow = {
  marginBottom: '8px',
};

const infoLabel = {
  width: '120px',
};

const infoLabelText = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const infoValueText = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '500',
  margin: '0',
};

const addressText = {
  color: '#111827',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '4px 0',
};

const itemsSection = {
  padding: '24px 20px',
  margin: '0 20px 16px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
};

const itemRow = {
  padding: '12px 0',
};

const itemDetailsCol = {
  paddingRight: '16px',
};

const itemName = {
  color: '#111827',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0 0 4px',
};

const itemSpecs = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '2px 0',
};

const itemQuantity = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '4px 0 0',
};

const itemPriceCol = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
  width: '120px',
};

const itemPrice = {
  color: '#111827',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0',
};

const itemDivider = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
};

const totalsSection = {
  padding: '20px',
  margin: '0 20px 16px',
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
};

const totalRow = {
  marginBottom: '8px',
};

const totalLabel = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '0',
};

const totalValueCol = {
  textAlign: 'right' as const,
};

const totalValue = {
  color: '#4b5563',
  fontSize: '14px',
  margin: '0',
};

const totalDivider = {
  borderColor: '#d1d5db',
  margin: '12px 0',
};

const totalLabelBold = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '700',
  margin: '0',
};

const totalValueBold = {
  color: '#0066FF',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0',
};

const deliverySection = {
  padding: '20px',
  margin: '0 20px 24px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
};

const deliveryInfoCol = {
  padding: '0 12px',
};

const deliveryText = {
  color: '#111827',
  fontSize: '14px',
  fontWeight: '500',
  margin: '4px 0',
};

const deliveryTimeText = {
  color: '#6b7280',
  fontSize: '13px',
  margin: '4px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 20px',
};

const button = {
  backgroundColor: '#0066FF',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 32px',
};

const footer = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const footerDivider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const footerText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '8px 0',
};

const link = {
  color: '#0066FF',
  textDecoration: 'none',
};

const copyrightText = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '16px 0 8px',
};

const unsubscribeText = {
  color: '#9ca3af',
  fontSize: '12px',
  margin: '4px 0',
};
