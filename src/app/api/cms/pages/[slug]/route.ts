/**
 * Public API: Get page by slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger, logApiError, createErrorResponse } from '@/lib/logger';

// Mock data with multilingual support
const mockPages = [
  // Romanian pages
  {
    id: '1',
    lang: 'ro',
    title: 'Despre Noi',
    slug: 'despre-noi',
    content: `<div class="prose max-w-none">
      <h1>Despre sanduta.art</h1>
      <p>Suntem o echipă pasionată de produse personalizate de calitate premium. Din 2020, creăm produse unice care aduc zâmbete și exprimă personalitatea fiecărui client.</p>
      <h2>Misiunea Noastră</h2>
      <p>Transformăm ideile tale în produse fizice de excepție, folosind tehnologie de ultimă generație și materiale de calitate.</p>
      <h2>Valorile Noastre</h2>
      <ul>
        <li><strong>Calitate</strong> - Fiecare produs este realizat cu atenție la detalii</li>
        <li><strong>Creativitate</strong> - Încurajăm exprimarea unică prin design</li>
        <li><strong>Sustenabilitate</strong> - Materiale eco-friendly și producție responsabilă</li>
      </ul>
    </div>`,
    status: 'PUBLISHED',
    publishedAt: '2025-01-01T10:00:00Z',
    seoTitle: 'Despre Noi - sanduta.art',
    seoDescription: 'Află mai multe despre echipa și misiunea sanduta.art',
    ogImage: 'https://sanduta.art/og-about.jpg',
  },
  {
    id: '2',
    lang: 'ro',
    title: 'Contact',
    slug: 'contact',
    content: `<div class="prose max-w-none">
      <h1>Contact</h1>
      <p>Avem nevoie de ajutor sau vrei să colaborăm? Suntem aici pentru tine!</p>
      <h2>Email</h2>
      <p><a href="mailto:contact@sanduta.art">contact@sanduta.art</a></p>
      <h2>Telefon</h2>
      <p>+40 123 456 789 (Luni-Vineri, 9:00-18:00)</p>
      <h2>Adresă</h2>
      <p>Strada Exemplu Nr. 123<br>București, România</p>
    </div>`,
    status: 'PUBLISHED',
    publishedAt: '2025-01-02T11:00:00Z',
  },
  // English pages
  {
    id: '3',
    lang: 'en',
    title: 'About Us',
    slug: 'about',
    content: `<div class="prose max-w-none">
      <h1>About sanduta.art</h1>
      <p>We are a passionate team dedicated to premium personalized products. Since 2020, we create unique products that bring smiles and express each client's personality.</p>
      <h2>Our Mission</h2>
      <p>We transform your ideas into exceptional physical products using cutting-edge technology and quality materials.</p>
      <h2>Our Values</h2>
      <ul>
        <li><strong>Quality</strong> - Every product is made with attention to detail</li>
        <li><strong>Creativity</strong> - We encourage unique expression through design</li>
        <li><strong>Sustainability</strong> - Eco-friendly materials and responsible production</li>
      </ul>
    </div>`,
    status: 'PUBLISHED',
    publishedAt: '2025-01-01T10:00:00Z',
    seoTitle: 'About Us - sanduta.art',
    seoDescription: 'Learn more about the sanduta.art team and mission',
    ogImage: 'https://sanduta.art/og-about.jpg',
  },
  {
    id: '4',
    lang: 'en',
    title: 'Contact',
    slug: 'contact',
    content: `<div class="prose max-w-none">
      <h1>Contact</h1>
      <p>Need help or want to collaborate? We're here for you!</p>
      <h2>Email</h2>
      <p><a href="mailto:contact@sanduta.art">contact@sanduta.art</a></p>
      <h2>Phone</h2>
      <p>+40 123 456 789 (Monday-Friday, 9:00-18:00)</p>
      <h2>Address</h2>
      <p>123 Example Street<br>Bucharest, Romania</p>
    </div>`,
    status: 'PUBLISHED',
    publishedAt: '2025-01-02T11:00:00Z',
  },
  // Russian pages
  {
    id: '5',
    lang: 'ru',
    title: 'О нас',
    slug: 'o-nas',
    content: `<div class="prose max-w-none">
      <h1>О sanduta.art</h1>
      <p>Мы увлеченная команда, занимающаяся персонализированными продуктами премиум-класса. С 2020 года мы создаем уникальные продукты, которые дарят улыбки и выражают индивидуальность каждого клиента.</p>
      <h2>Наша миссия</h2>
      <p>Мы превращаем ваши идеи в исключительные физические продукты, используя передовые технологии и качественные материалы.</p>
      <h2>Наши ценности</h2>
      <ul>
        <li><strong>Качество</strong> - Каждый продукт создается с вниманием к деталям</li>
        <li><strong>Креативность</strong> - Мы поощряем уникальное самовыражение через дизайн</li>
        <li><strong>Устойчивость</strong> - Экологичные материалы и ответственное производство</li>
      </ul>
    </div>`,
    status: 'PUBLISHED',
    publishedAt: '2025-01-01T10:00:00Z',
    seoTitle: 'О нас - sanduta.art',
    seoDescription: 'Узнайте больше о команде и миссии sanduta.art',
    ogImage: 'https://sanduta.art/og-about.jpg',
  },
  {
    id: '6',
    lang: 'ru',
    title: 'Контакты',
    slug: 'kontakty',
    content: `<div class="prose max-w-none">
      <h1>Контакты</h1>
      <p>Нужна помощь или хотите сотрудничать? Мы здесь для вас!</p>
      <h2>Email</h2>
      <p><a href="mailto:contact@sanduta.art">contact@sanduta.art</a></p>
      <h2>Телефон</h2>
      <p>+40 123 456 789 (Понедельник-Пятница, 9:00-18:00)</p>
      <h2>Адрес</h2>
      <p>ул. Примера, 123<br>Бухарест, Румыния</p>
    </div>`,
    status: 'PUBLISHED',
    publishedAt: '2025-01-02T11:00:00Z',
  },
];

// GET /api/cms/pages/[slug]?lang=ro|en|ru
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const lang = searchParams.get('lang') || 'ro'; // Default to Romanian

    logger.info('API:CMS:Pages:Public', 'Fetching page by slug', { slug, lang });

    const page = mockPages.find(
      p => p.slug === slug && p.lang === lang && p.status === 'PUBLISHED'
    );

    if (!page) {
      return createErrorResponse('Page not found', 404);
    }

    return NextResponse.json(page);
  } catch (err) {
    logApiError('API:CMS:Pages:Public', err);
    return createErrorResponse('Failed to fetch page', 500);
  }
}
