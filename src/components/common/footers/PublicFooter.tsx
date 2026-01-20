import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

// Featured categories for footer - manually curated for better control
const featuredCategories = [
  { href: '/produse/carti-de-vizita', label: '🎴 Cărți de vizită', slug: 'carti-de-vizita' },
  { href: '/produse/marketing', label: '📢 Marketing', slug: 'marketing' },
  { href: '/produse/foto-arta', label: '🖼️ Foto & Artă', slug: 'foto-arta' },
  { href: '/produse/textile-merch', label: '👕 Textile & Merch', slug: 'textile-merch' },
];

/**
 * PublicFooter - Footer unificat pentru paginile publice
 * Caracteristici:
 * - Link-uri către categorii principale
 * - Informații de contact
 * - Social media links
 * - Link-uri legale (termeni, privacy)
 */
export function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    categories: featuredCategories,
    products: [
      { href: '/products', label: 'Toate produsele' },
      { href: '/products?featured=true', label: 'Produse populare' },
      { href: '/products?new=true', label: 'Produse noi' },
    ],
    info: [
      { href: '/about', label: 'Despre noi' },
      { href: '/contact', label: 'Contact' },
      { href: '/terms', label: 'Termeni și condiții' },
      { href: '/privacy', label: 'Politica de confidențialitate' },
    ],
    account: [
      { href: '/account', label: 'Contul meu' },
      { href: '/account/orders', label: 'Comenzile mele' },
      { href: '/login', label: 'Autentificare' },
      { href: '/register', label: 'Înregistrare' },
    ],
  };

  const socialLinks = [
    { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
    { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
    { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
  ];

  const contactInfo = [
    { icon: Mail, text: 'contact@sanduta.art' },
    { icon: Phone, text: '+40 123 456 789' },
    { icon: MapPin, text: 'București, România' },
  ];

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600">
                <span className="text-xl font-bold text-white">S</span>
              </div>
              <span className="text-xl font-bold text-secondary">
                Sanduta<span className="text-primary">.Art</span>
              </span>
            </Link>
            <p className="text-sm text-gray-600">
              Transformăm fotografiile tale în opere de artă. Calitate superioară,
              livrare rapidă, prețuri accesibile.
            </p>
            
            {/* Social links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-primary"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Categories column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary">
              Categorii
            </h3>
            <ul className="space-y-3">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/products"
                  className="text-sm font-medium text-primary transition-colors hover:underline"
                >
                  Vezi toate →
                </Link>
              </li>
            </ul>
          </div>

          {/* Products column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary">
              Produse
            </h3>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary">
              Informații
            </h3>
            <ul className="space-y-3">
              {footerLinks.info.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-secondary">
              Contact
            </h3>
            <ul className="space-y-3">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                return (
                  <li key={index} className="flex items-start space-x-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <span className="text-sm text-gray-600">{info.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-sm text-gray-600">
              © {currentYear} Sanduta.Art. Toate drepturile rezervate.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/terms"
                className="text-sm text-gray-600 transition-colors hover:text-primary"
              >
                Termeni
              </Link>
              <Link
                href="/privacy"
                className="text-sm text-gray-600 transition-colors hover:text-primary"
              >
                Confidențialitate
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-gray-600 transition-colors hover:text-primary"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
