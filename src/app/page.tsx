import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Печать фотографий</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">Качественные фотоуслуги для ваших воспоминаний. Печать на бумаге, холсте, кружках и многом другом</p>
          <Link href="/products" className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg">
            Перейти в каталог
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Популярные услуги</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Выберите одну из наших основных услуг и начните создавать уникальные товары с вашими фотографиями</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/products?category=Фото%20на%20бумаге" className="group bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-lg shadow-md hover:shadow-xl transition transform hover:scale-105">
              <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-300 transition">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Фото на бумаге</h3>
              <p className="text-gray-700 text-center">Высококачественная печать фотографий на премиум бумаге</p>
            </Link>
            
            <Link href="/products?category=Холст" className="group bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-lg shadow-md hover:shadow-xl transition transform hover:scale-105">
              <div className="w-16 h-16 bg-green-200 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-green-300 transition">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Холст</h3>
              <p className="text-gray-700 text-center">Печать на холсте для украшения интерьера</p>
            </Link>
            
            <Link href="/products?category=Кружки" className="group bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-lg shadow-md hover:shadow-xl transition transform hover:scale-105">
              <div className="w-16 h-16 bg-yellow-200 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-yellow-300 transition">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Кружки</h3>
              <p className="text-gray-700 text-center">Персонализированные кружки со своим дизайном</p>
            </Link>
            
            <Link href="/products?category=Футболки" className="group bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-lg shadow-md hover:shadow-xl transition transform hover:scale-105">
              <div className="w-16 h-16 bg-red-200 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:bg-red-300 transition">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center">Футболки</h3>
              <p className="text-gray-700 text-center">Печать на одежде с высокой устойчивостью</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Все категории</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Откройте полный спектр наших услуг печати</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link href="/products?category=Фото%20на%20бумаге" className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition hover:bg-gray-50">
              <svg className="w-8 h-8 text-blue-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h4 className="font-semibold text-gray-800">Фото на бумаге</h4>
            </Link>
            <Link href="/products?category=Холст" className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition hover:bg-gray-50">
              <svg className="w-8 h-8 text-green-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="font-semibold text-gray-800">Холст</h4>
            </Link>
            <Link href="/products?category=Кружки" className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition hover:bg-gray-50">
              <svg className="w-8 h-8 text-yellow-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <h4 className="font-semibold text-gray-800">Кружки</h4>
            </Link>
            <Link href="/products?category=Футболки" className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition hover:bg-gray-50">
              <svg className="w-8 h-8 text-red-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h4 className="font-semibold text-gray-800">Футболки</h4>
            </Link>
            <Link href="/products?category=Чехлы%20для%20телефона" className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition hover:bg-gray-50">
              <svg className="w-8 h-8 text-purple-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h4 className="font-semibold text-gray-800">Чехлы для телефона</h4>
            </Link>
            <Link href="/products?category=Календари" className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition hover:bg-gray-50">
              <svg className="w-8 h-8 text-indigo-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h4 className="font-semibold text-gray-800">Календари</h4>
            </Link>
            <Link href="/products?category=Книги" className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition hover:bg-gray-50">
              <svg className="w-8 h-8 text-pink-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h4 className="font-semibold text-gray-800">Книги</h4>
            </Link>
            <Link href="/products?category=Пазлы" className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition hover:bg-gray-50">
              <svg className="w-8 h-8 text-teal-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4 className="font-semibold text-gray-800">Пазлы</h4>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Почему выбирают нас</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Высокое качество</h3>
              <p className="text-gray-600">Используем современное оборудование и материалы премиум класса для идеального результата</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Быстрая доставка</h3>
              <p className="text-gray-600">Доставляем заказы по всей России через Nova Poshta с отслеживанием</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Поддержка 24/7</h3>
              <p className="text-gray-600">Наша команда готова помочь вам в любое время по любым вопросам</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
