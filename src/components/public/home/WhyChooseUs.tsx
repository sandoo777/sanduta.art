import {
  Truck,
  Award,
  DollarSign,
  Headphones,
  Palette,
  Shield,
} from 'lucide-react';

interface Benefit {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: Truck,
    title: 'Livrare rapidă',
    description: 'Livrăm în 2-3 zile lucrătoare în toată țara prin Nova Poshta',
  },
  {
    icon: Award,
    title: 'Calitate premium',
    description: 'Materiale de cea mai înaltă calitate și echipamente profesionale',
  },
  {
    icon: DollarSign,
    title: 'Prețuri competitive',
    description: 'Raport calitate-preț excelent, fără compromisuri',
  },
  {
    icon: Headphones,
    title: 'Suport dedicat',
    description: 'Echipa noastră te ajută în orice moment',
  },
  {
    icon: Palette,
    title: 'Design gratuit',
    description: 'Ajutor profesional pentru crearea designului perfect',
  },
  {
    icon: Shield,
    title: '100% satisfacție',
    description: 'Garanție de returnare dacă nu ești mulțumit',
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary sm:text-4xl lg:text-5xl">
            De ce să ne alegi?
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Calitate, rapiditate și profesionalism - tot ce ai nevoie pentru proiectul tău
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-sm transition-all hover:shadow-xl"
              >
                {/* Icon */}
                <div className="mb-6 inline-flex rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                  <Icon className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-xl font-semibold text-secondary">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>

                {/* Hover effect */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-blue-600 transition-transform group-hover:translate-y-0" />
              </div>
            );
          })}
        </div>

        {/* Trust badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 shadow-md">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold text-secondary">
              Peste 10.000 de comenzi livrate cu succes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
