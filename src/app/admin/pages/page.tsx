'use client';

import { useState, useEffect } from "react";
import { Table, Button } from '@/components/ui';

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockPages: Page[] = [
        {
          id: 1,
          title: 'About Us',
          slug: 'about',
          content: 'About our company...',
          published: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-02',
        },
        {
          id: 2,
          title: 'Contact',
          slug: 'contact',
          content: 'Contact information...',
          published: true,
          createdAt: '2026-01-01',
          updatedAt: '2026-01-03',
        },
        {
          id: 3,
          title: 'Privacy Policy',
          slug: 'privacy',
          content: 'Privacy policy content...',
          published: false,
          createdAt: '2026-01-02',
          updatedAt: '2026-01-02',
        },
      ];
      setPages(mockPages);
    } catch (_error) {
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Pages Management</h1>
          <Button>Add New Page</Button>
        </div>

        <Table
          columns={[
            {
              key: 'title',
              label: 'Title',
              sortable: true,
              render: (page) => (
                <div className="text-sm font-medium text-gray-900">
                  {page.title}
                </div>
              ),
            },
            {
              key: 'slug',
              label: 'Slug',
              render: (page) => (
                <div className="text-sm text-gray-500 font-mono">
                  /{page.slug}
                </div>
              ),
            },
            {
              key: 'published',
              label: 'Status',
              render: (page) => (
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    page.published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {page.published ? 'Published' : 'Draft'}
                </span>
              ),
            },
            {
              key: 'updatedAt',
              label: 'Last Updated',
              sortable: true,
              render: (page) => (
                <span className="text-sm text-gray-500">
                  {new Date(page.updatedAt).toLocaleDateString()}
                </span>
              ),
            },
            {
              key: 'actions',
              label: 'Actions',
              render: () => (
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-900">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-900">
                    View
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-900">
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          data={pages}
          rowKey="id"
          loading={loading}
          emptyMessage="Nu există pagini. Creează prima pagină."
          clientSideSort={true}
        />
      </div>
  );
}
