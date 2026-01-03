import Link from "next/link";

export function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">Sanduta Art</Link>
        </div>
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-700 hover:text-blue-600 transition">Главная</Link>
          <Link href="/products" className="text-gray-700 hover:text-blue-600 transition">Продукты</Link>
          <Link href="/checkout" className="text-gray-700 hover:text-blue-600 transition">Корзина</Link>
          <a href="#about" className="text-gray-700 hover:text-blue-600 transition">О нас</a>
          <a href="#contact" className="text-gray-700 hover:text-blue-600 transition">Контакты</a>
        </nav>
        <div className="flex items-center space-x-4">
          <form action="/products" method="GET" className="hidden md:flex">
            <input
              type="text"
              name="search"
              placeholder="Поиск..."
              className="px-3 py-1 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-r hover:bg-blue-700 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
          <Link href="/checkout" className="text-gray-700 hover:text-blue-600 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
