import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Acces Interzis
          </h1>
          <p className="text-gray-600 mb-6">
            Nu ai permisiunea de a accesa această pagină. 
            Această secțiune este disponibilă doar pentru administratori.
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Înapoi la Pagina Principală
            </Link>
            <Link
              href="/login"
              className="block w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
            >
              Autentifică-te cu alt cont
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
