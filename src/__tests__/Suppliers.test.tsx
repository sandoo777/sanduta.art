import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuppliersManager } from '@/components/purchasing/SuppliersManager';

describe('SuppliersManager', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input.toString();

        if (url === '/api/suppliers' && init?.method === 'POST') {
          return {
            ok: true,
            json: async () => ({ ok: true, item: { id: 'supplier-1', name: 'Acme Supply' } }),
          } as Response;
        }

        if (url === '/api/suppliers') {
          return {
            ok: true,
            json: async () => ({
              items: [{ id: 'supplier-1', name: 'Acme Supply', phones: ['+37360111222'] }],
            }),
          } as Response;
        }

        return {
          ok: true,
          json: async () => ({ ok: true }),
        } as Response;
      })
    );
  });

  it('creates a supplier with contact-only payload', async () => {
    const user = userEvent.setup();
    render(<SuppliersManager />);

    expect(screen.queryByPlaceholderText(/API endpoint/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/API key/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Currency/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Email/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Test connection/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /\+ Add supplier/i }));

    await user.type(screen.getByPlaceholderText(/Supplier name/i), 'Acme Supply');
    await user.type(screen.getByPlaceholderText('+373...'), '+37360111222');
    await user.type(screen.getByPlaceholderText(/Cod fiscal/i), '1234 5678');

    const codFiscalInput = screen.getByPlaceholderText(/Cod fiscal/i);
    const notesInput = screen.getByPlaceholderText(/Notes/i);
    expect(
      codFiscalInput.compareDocumentPosition(notesInput) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Save supplier/i }));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/suppliers',
      expect.objectContaining({ method: 'POST' })
    );

    const postCall = (vi.mocked(global.fetch).mock.calls as Array<[RequestInfo | URL, RequestInit | undefined]>).find(
      ([url, init]) => url === '/api/suppliers' && init?.method === 'POST'
    );
    const postBody = JSON.parse(String(postCall?.[1]?.body ?? '{}'));
    expect(postBody).toEqual(
      expect.objectContaining({
        name: 'Acme Supply',
        phones: [{ number: '+37360111222', name: null }],
        address: null,
        website: null,
        codFiscal: '12345678',
        notes: null,
      })
    );
    expect(postBody).not.toHaveProperty('email');
    expect(postBody).not.toHaveProperty('preferred_channel');
    expect(postBody).not.toHaveProperty('defaultLeadTimeDays');
    expect(postBody).not.toHaveProperty('defaultCurrency');

    expect(screen.queryByText(/Last sent:/i)).not.toBeInTheDocument();
  });

  it('includes a contact name with each phone number in the payload', async () => {
    const user = userEvent.setup();
    render(<SuppliersManager />);

    await user.click(screen.getByRole('button', { name: /\+ Add supplier/i }));

    await user.type(screen.getByPlaceholderText(/Supplier name/i), 'Acme Supply');
    await user.type(screen.getByLabelText(/Telefon 1/i), '+37360111222');
    await user.type(screen.getByLabelText(/Nume contact 1/i), 'Vasile');
    await user.click(screen.getByRole('button', { name: /Save supplier/i }));

    const postCall = (vi.mocked(global.fetch).mock.calls as Array<[RequestInfo | URL, RequestInit | undefined]>).find(
      ([url, init]) => url === '/api/suppliers' && init?.method === 'POST'
    );

    const postBody = JSON.parse(String(postCall?.[1]?.body ?? '{}'));
    expect(postBody.phones).toEqual([
      expect.objectContaining({ number: '+37360111222', name: 'Vasile' }),
    ]);
  });

  it('does not submit when cod fiscal is invalid', async () => {
    const user = userEvent.setup();
    render(<SuppliersManager />);

    await user.click(screen.getByRole('button', { name: /\+ Add supplier/i }));

    await user.type(screen.getByPlaceholderText(/Supplier name/i), 'Blocked Supplier');
    await user.type(screen.getByPlaceholderText('+373...'), '+37360111222');
    await user.type(screen.getByPlaceholderText(/Cod fiscal/i), 'ABCD');
    await user.click(screen.getByRole('button', { name: /Save supplier/i }));

    const postCalls = (vi.mocked(global.fetch).mock.calls as Array<[RequestInfo | URL, RequestInit | undefined]>).filter(
      ([url, init]) => url === '/api/suppliers' && init?.method === 'POST'
    );

    expect(postCalls).toHaveLength(0);
  });

  it('keeps add form hidden by default and resets it on close', async () => {
    const user = userEvent.setup();
    render(<SuppliersManager />);

    expect(screen.queryByRole('button', { name: /Save supplier/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /\+ Add supplier/i }));
    await user.type(screen.getByPlaceholderText(/Supplier name/i), 'Temporary Supplier');
    await user.click(screen.getByRole('button', { name: /Close/i }));

    expect(screen.queryByRole('button', { name: /Save supplier/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /\+ Add supplier/i }));
    expect(screen.getByPlaceholderText(/Supplier name/i)).toHaveValue('');
  });

  it('shows partner registry labels in partner mode', async () => {
    const user = userEvent.setup();
    render(<SuppliersManager mode="partner" />);

    expect(screen.getByRole('button', { name: /\+ Add partner/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Parteneri/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /\+ Add partner/i }));
    expect(screen.getByPlaceholderText(/Partener name/i)).toBeInTheDocument();
  });

  it('renders Edit link to admin edit route', async () => {
    render(<SuppliersManager />);

    const editLink = await screen.findByRole('link', { name: 'Edit' });
    expect(editLink).toHaveAttribute('href', '/admin/suppliers/supplier-1/edit');
  });
});
