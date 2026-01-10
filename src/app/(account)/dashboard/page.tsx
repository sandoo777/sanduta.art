import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBagIcon,
  FolderIcon,
  MapPinIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Dashboard | Sanduta.art",
  description: "Bun venit în contul tău",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const quickLinks = [
    {
      title: "Comenzile mele",
      description: "Verifică statusul comenzilor tale",
      href: "/dashboard/orders",
      icon: ShoppingBagIcon,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Proiectele mele",
      description: "Accesează și editează proiectele salvate",
      href: "/dashboard/projects",
      icon: FolderIcon,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      title: "Adrese",
      description: "Gestionează adresele de livrare",
      href: "/dashboard/addresses",
      icon: MapPinIcon,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Date personale",
      description: "Actualizează informațiile contului",
      href: "/dashboard/profile",
      icon: UserIcon,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bun venit, {session.user?.name || "Utilizator"}!
        </h1>
        <p className="mt-2 text-gray-600">
          Accesează rapid secțiunile importante ale contului tău
        </p>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${link.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{link.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          💡 Știai că...
        </h3>
        <p className="text-blue-800">
          Poți salva proiectele tale în editor și le poți accesa oricând din
          secțiunea &quot;Proiectele mele&quot;. Astfel, nu vei pierde niciodată munca ta!
        </p>
      </div>
    </div>
  );
}
