import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-helpers';
import { sendOrderConfirmationEmail, sendAdminNewOrderEmail } from '@/lib/email';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

export async function POST() {
  try {
    const { user, error } = await requireRole(['ADMIN']);
    if (error) return error;

    logger.info('API:EmailTest', 'Testing email sending', { userId: user.id });

    // Test data
    const testOrder = {
      id: 'TEST-' + Date.now(),
      orderNumber: 'ORD-TEST-001',
      customerName: 'Test Customer',
      customerEmail: user.email, // Send to admin's email for testing
      total: 199.99,
      items: [
        {
          product: { name: 'Canvas Print A4' },
          quantity: 2,
          unitPrice: 99.99
        }
      ],
      status: 'PENDING',
      createdAt: new Date()
    };

    const results = {
      customerEmail: null as any,
      adminEmail: null as any,
      errors: [] as string[]
    };

    // Test 1: Customer confirmation email
    try {
      logger.info('API:EmailTest', 'Sending customer confirmation email');
      results.customerEmail = await sendOrderConfirmationEmail(testOrder as any);
      logger.info('API:EmailTest', 'Customer email sent', { 
        id: results.customerEmail.id 
      });
    } catch (err: any) {
      const errorMsg = `Customer email failed: ${err.message}`;
      logger.error('API:EmailTest', errorMsg, { error: err });
      results.errors.push(errorMsg);
    }

    // Test 2: Admin notification email
    try {
      logger.info('API:EmailTest', 'Sending admin notification email');
      results.adminEmail = await sendAdminNewOrderEmail(testOrder as any);
      logger.info('API:EmailTest', 'Admin email sent', { 
        id: results.adminEmail.id 
      });
    } catch (err: any) {
      const errorMsg = `Admin email failed: ${err.message}`;
      logger.error('API:EmailTest', errorMsg, { error: err });
      results.errors.push(errorMsg);
    }

    // Determine overall status
    const allSuccess = results.customerEmail && results.adminEmail && results.errors.length === 0;
    const partialSuccess = (results.customerEmail || results.adminEmail) && results.errors.length > 0;
    const status = allSuccess ? 'success' : partialSuccess ? 'partial' : 'failed';

    return NextResponse.json({
      status,
      message: allSuccess 
        ? 'Toate email-urile au fost trimise cu succes'
        : partialSuccess
        ? 'Unele email-uri au fost trimise, altele au eșuat'
        : 'Trimiterea email-urilor a eșuat',
      testOrder: {
        id: testOrder.id,
        orderNumber: testOrder.orderNumber,
        recipient: testOrder.customerEmail
      },
      results: {
        customerEmail: results.customerEmail ? {
          id: results.customerEmail.id,
          success: true
        } : null,
        adminEmail: results.adminEmail ? {
          id: results.adminEmail.id,
          success: true
        } : null,
        errors: results.errors
      },
      resendDashboard: 'https://resend.com/emails',
      instructions: [
        '1. Verifică inbox-ul la ' + testOrder.customerEmail,
        '2. Verifică folder-ul Spam/Junk',
        '3. Accesează Resend Dashboard pentru statistici detaliate',
        '4. Verifică delivery rate și bounce rate în dashboard'
      ]
    }, { status: allSuccess ? 200 : partialSuccess ? 207 : 500 });

  } catch (error) {
    logApiError('API:EmailTest', error);
    return createErrorResponse('Failed to test email sending', 500);
  }
}
