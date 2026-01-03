export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h5 className="text-lg font-semibold mb-4">Sanduta Art</h5>
            <p className="text-gray-400">Качественные фотоуслуги для всех. Печать фото на различных материалах с высочайшим качеством.</p>
          </div>
          <div id="contact">
            <h5 className="text-lg font-semibold mb-4">Контакты</h5>
            <p className="text-gray-400 mb-2">Email: <a href="mailto:info@sanduta.art" className="hover:text-white transition">info@sanduta.art</a></p>
            <p className="text-gray-400">Телефон: <a href="tel:+71234567890" className="hover:text-white transition">+7 (123) 456-7890</a></p>
          </div>
          <div>
            <h5 className="text-lg font-semibold mb-4">Полезные ссылки</h5>
            <ul className="text-gray-400 space-y-2">
              <li><a href="/" className="hover:text-white transition">Главная</a></li>
              <li><a href="/products" className="hover:text-white transition">Продукты</a></li>
              <li><a href="#about" className="hover:text-white transition">О нас</a></li>
              <li><a href="#" className="hover:text-white transition">Политика конфиденциальности</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2024-2026 Sanduta Art. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
