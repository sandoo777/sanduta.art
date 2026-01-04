'use client';

import { Star, Quote } from 'lucide-react';
import { useState } from 'react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Maria Popescu',
    role: 'Client mulțumit',
    content:
      'Calitate excepțională! Am comandat un tablou canvas cu o fotografie de familie și rezultatul a depășit așteptările. Culorile sunt vibrante și detaliile perfecte.',
    rating: 5,
    avatar: 'MP',
  },
  {
    id: '2',
    name: 'Alexandru Ion',
    role: 'Designer',
    content:
      'Lucrez des cu Sanduta.Art pentru proiectele clienților mei. Servicii rapide, profesionale și prețuri foarte bune. Recomand cu încredere!',
    rating: 5,
    avatar: 'AI',
  },
  {
    id: '3',
    name: 'Elena Stanciu',
    role: 'Fotograf',
    content:
      'Am descoperit serviciile lor prin recomandare și nu regret! Printurile sunt de calitate superioară, exact ce căutam pentru portofoliul meu.',
    rating: 5,
    avatar: 'ES',
  },
  {
    id: '4',
    name: 'Cristian Dumitrescu',
    role: 'Entrepreneur',
    content:
      'Am comandat materiale promoționale pentru business-ul meu. Calitatea este excepțională și livrarea a fost foarte rapidă. Super mulțumit!',
    rating: 5,
    avatar: 'CD',
  },
  {
    id: '5',
    name: 'Andreea Vasile',
    role: 'Client fidel',
    content:
      'Comand de la ei de fiecare dată când am nevoie de cadouri personalizate. Nu m-au dezamăgit niciodată. Servicii impecabile!',
    rating: 5,
    avatar: 'AV',
  },
  {
    id: '6',
    name: 'Mihai Georgescu',
    role: 'Photographer',
    content:
      'Colaborez cu Sanduta.Art de mai bine de 2 ani. Profesioniști adevărați care înțeleg importanța calității în fotografie.',
    rating: 5,
    avatar: 'MG',
  },
];

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="bg-gradient-to-br from-primary/5 to-blue-50 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-secondary sm:text-4xl lg:text-5xl">
            Ce spun clienții noștri
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Mii de clienți mulțumiți au ales deja serviciile noastre
          </p>
        </div>

        {/* Testimonials Grid - Desktop */}
        <div className="hidden gap-6 lg:grid lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Testimonials Carousel - Mobile & Tablet */}
        <div className="lg:hidden">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* Carousel indicators */}
          <div className="mt-8 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid gap-8 border-t border-gray-200 pt-12 sm:grid-cols-3">
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-primary">10,000+</div>
            <div className="text-gray-600">Comenzi livrate</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-primary">5.0</div>
            <div className="text-gray-600">Rating mediu</div>
          </div>
          <div className="text-center">
            <div className="mb-2 text-4xl font-bold text-primary">98%</div>
            <div className="text-gray-600">Clienți mulțumiți</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="relative h-full rounded-xl bg-white p-8 shadow-sm transition-all hover:shadow-lg">
      {/* Quote icon */}
      <Quote className="absolute right-6 top-6 h-12 w-12 text-primary/10" />

      {/* Rating */}
      <div className="mb-4 flex gap-1">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-accent text-accent" />
        ))}
      </div>

      {/* Content */}
      <p className="mb-6 text-gray-700">{testimonial.content}</p>

      {/* Author */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600 text-white font-semibold">
          {testimonial.avatar}
        </div>
        <div>
          <div className="font-semibold text-secondary">{testimonial.name}</div>
          <div className="text-sm text-gray-600">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );
}
