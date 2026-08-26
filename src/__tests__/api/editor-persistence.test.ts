import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/modules/auth/nextauth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    editorProject: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

const AUTH_USER = { id: 'user-1', email: 'test@example.com', name: 'Test' };
const makeRequest = (url: string, body?: unknown, method = 'POST') =>
  new NextRequest(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

// ─── POST /api/editor/save ────────────────────────────────────────────────────

describe('POST /api/editor/save', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue(null);

    const { POST } = await import('@/app/api/editor/save/route');
    const res = await POST(makeRequest('http://localhost/api/editor/save', { design: {} }));
    expect(res.status).toBe(401);
  });

  it('creates a new EditorProject and returns designId', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue({ user: AUTH_USER });

    const { prisma } = await import('@/lib/prisma');
    const created = { id: 'proj-1', name: 'My Design', createdAt: new Date(), updatedAt: new Date() };
    vi.mocked(prisma.editorProject.create).mockResolvedValue(created as never);

    const { POST } = await import('@/app/api/editor/save/route');
    const res = await POST(makeRequest('http://localhost/api/editor/save', {
      design: { elements: [], canvas: { width: 800, height: 600 } },
      name: 'My Design',
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.designId).toBe('proj-1');
    expect(prisma.editorProject.create).toHaveBeenCalledOnce();
  });

  it('updates existing project when id is provided', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue({ user: AUTH_USER });

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.editorProject.findFirst).mockResolvedValue({ id: 'proj-1' } as never);
    const updated = { id: 'proj-1', name: 'Updated', createdAt: new Date(), updatedAt: new Date() };
    vi.mocked(prisma.editorProject.update).mockResolvedValue(updated as never);

    const { POST } = await import('@/app/api/editor/save/route');
    const res = await POST(makeRequest('http://localhost/api/editor/save', {
      id: 'proj-1',
      design: { elements: [{ id: 'el1', type: 'text' }] },
    }));

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.designId).toBe('proj-1');
    expect(prisma.editorProject.update).toHaveBeenCalledOnce();
    expect(prisma.editorProject.create).not.toHaveBeenCalled();
  });

  it('returns 404 when updating a project not owned by user', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue({ user: AUTH_USER });

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.editorProject.findFirst).mockResolvedValue(null);

    const { POST } = await import('@/app/api/editor/save/route');
    const res = await POST(makeRequest('http://localhost/api/editor/save', {
      id: 'other-proj',
      design: {},
    }));

    expect(res.status).toBe(404);
  });
});

// ─── GET /api/editor/projects/[id] ───────────────────────────────────────────

describe('GET /api/editor/projects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue(null);

    const { GET } = await import('@/app/api/editor/projects/[id]/route');
    const res = await GET(
      new NextRequest('http://localhost/api/editor/projects/proj-1', { method: 'GET' }),
      { params: Promise.resolve({ id: 'proj-1' }) }
    );
    expect(res.status).toBe(401);
  });

  it('returns 404 when project not found', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue({ user: AUTH_USER });

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.editorProject.findFirst).mockResolvedValue(null);

    const { GET } = await import('@/app/api/editor/projects/[id]/route');
    const res = await GET(
      new NextRequest('http://localhost/api/editor/projects/missing', { method: 'GET' }),
      { params: Promise.resolve({ id: 'missing' }) }
    );
    expect(res.status).toBe(404);
  });

  it('returns parsed project data', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue({ user: AUTH_USER });

    const { prisma } = await import('@/lib/prisma');
    const projectData = { elements: [], canvas: { width: 800, height: 600 } };
    vi.mocked(prisma.editorProject.findFirst).mockResolvedValue({
      id: 'proj-1',
      name: 'Test Project',
      userId: AUTH_USER.id,
      data: JSON.stringify(projectData),
      thumbnail: null,
      status: 'saved',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const { GET } = await import('@/app/api/editor/projects/[id]/route');
    const res = await GET(
      new NextRequest('http://localhost/api/editor/projects/proj-1', { method: 'GET' }),
      { params: Promise.resolve({ id: 'proj-1' }) }
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('proj-1');
    expect(body.data).toEqual(projectData);
  });
});

// ─── PUT /api/editor/projects/[id] ───────────────────────────────────────────

describe('PUT /api/editor/projects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates project name and returns updated data', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue({ user: AUTH_USER });

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.editorProject.findFirst).mockResolvedValue({ id: 'proj-1' } as never);
    vi.mocked(prisma.editorProject.update).mockResolvedValue({
      id: 'proj-1',
      name: 'Renamed',
      data: '{}',
      status: 'saved',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const { PUT } = await import('@/app/api/editor/projects/[id]/route');
    const req = new NextRequest('http://localhost/api/editor/projects/proj-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Renamed' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'proj-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('Renamed');
  });

  it('returns 404 when project not owned by user', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue({ user: AUTH_USER });

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.editorProject.findFirst).mockResolvedValue(null);

    const { PUT } = await import('@/app/api/editor/projects/[id]/route');
    const req = new NextRequest('http://localhost/api/editor/projects/other', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'x' }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: 'other' }) });
    expect(res.status).toBe(404);
  });
});

// ─── DELETE /api/editor/projects/[id] ────────────────────────────────────────

describe('DELETE /api/editor/projects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deletes project and returns success', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue({ user: AUTH_USER });

    const { prisma } = await import('@/lib/prisma');
    vi.mocked(prisma.editorProject.findFirst).mockResolvedValue({ id: 'proj-1' } as never);
    vi.mocked(prisma.editorProject.delete).mockResolvedValue({ id: 'proj-1' } as never);

    const { DELETE } = await import('@/app/api/editor/projects/[id]/route');
    const req = new NextRequest('http://localhost/api/editor/projects/proj-1', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'proj-1' }) });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(prisma.editorProject.delete).toHaveBeenCalledWith({ where: { id: 'proj-1' } });
  });

  it('returns 401 when unauthenticated', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue(null);

    const { DELETE } = await import('@/app/api/editor/projects/[id]/route');
    const req = new NextRequest('http://localhost/api/editor/projects/proj-1', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'proj-1' }) });
    expect(res.status).toBe(401);
  });
});
