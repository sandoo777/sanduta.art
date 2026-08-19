import { http, HttpResponse } from 'msw';

import seed from '../../data/materials.json';

const api = (path: string) => new RegExp(`(^https?://[^/]+)?${path}(\\?.*)?$`);

export const materialsHandlers = [
  http.get(api('/api/materials'), () => HttpResponse.json({ materials: seed })),
  http.get(api('/api/materials/[^/]+'), ({ request }) => {
    const url = new URL(request.url);
    const id = decodeURIComponent(url.pathname.split('/').pop() ?? '');
    const material = seed.find((entry) => entry.id === id || entry.sku === id);

    return material
      ? HttpResponse.json(material)
      : HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
];