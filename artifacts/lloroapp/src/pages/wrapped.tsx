import { useState } from "react";
import { useGetWrapped, useGetMe } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Droplet, Calendar, Award } from "lucide-react";
import { Link } from "wouter";

export function WrappedPage() {
  const { data: user } = useGetMe();
  const { data: wrapped, isLoading } = useGetWrapped({ userId: user?.id.toString(), year: new Date().getFullYear() });
  const [slide, setSlide] = useState(0);

  if (isLoading) {
    return <div className="fixed inset-0 bg-primary flex items-center justify-center text-white">Cargando tu año...</div>;
  }

  if (!wrapped) {
    return (
      <div className="text-center py-20">
        <p>Aún no hay suficientes datos para tu resumen anual.</p>
        <Link href="/dashboard" className="text-primary hover:underline mt-4 inline-block">Volver</Link>
      </div>
    );
  }

  const slides = [
    {
      color: "bg-[#8B5CF6]",
      content: (
        <div className="text-center text-white space-y-8">
          <h2 className="text-4xl font-serif font-bold">LloroLog Wrapped {wrapped.year}</h2>
          <p className="text-2xl opacity-80">Ha sido un año de sentir mucho.</p>
        </div>
      )
    },
    {
      color: "bg-[#3B82F6]",
      content: (
        <div className="text-center text-white space-y-6">
          <Droplet className="w-20 h-20 mx-auto opacity-80" />
          <h2 className="text-3xl font-serif">Este año has soltado lágrimas</h2>
          <motion.div 
            initial={{ scale: 0 }} 
            animate={{ scale: 1 }} 
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-8xl font-bold"
          >
            {wrapped.totalCries}
          </motion.div>
          <p className="text-2xl">veces.</p>
        </div>
      )
    },
    {
      color: "bg-[#EC4899]",
      content: (
        <div className="text-center text-white space-y-6">
          <Award className="w-20 h-20 mx-auto opacity-80" />
          <h2 className="text-3xl font-serif">Tu emoción principal fue:</h2>
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="text-6xl font-bold uppercase tracking-wider"
          >
            {wrapped.topCryType || "Misterio"}
          </motion.div>
          <p className="text-xl opacity-80 max-w-sm mx-auto mt-8">
            "{wrapped.topInsight || "Tus emociones fluyen libremente."}"
          </p>
        </div>
      )
    },
    {
      color: "bg-[#10B981]",
      content: (
        <div className="text-center text-white space-y-8">
          <h2 className="text-4xl font-serif font-bold">Gracias por compartirlo</h2>
          <p className="text-xl max-w-sm mx-auto opacity-90">
            Llorar es de valientes. Que el próximo año esté lleno de más risas que lágrimas, pero si las hay, aquí estaremos.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 rounded-full mt-8 text-lg px-8 h-14">
              Volver al inicio
            </Button>
          </Link>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (slide < slides.length - 1) setSlide(s => s + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={slide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex-1 flex items-center justify-center p-6 ${slides[slide].color}`}
          onClick={nextSlide}
        >
          {slides[slide].content}
          
          {slide < slides.length - 1 && (
            <div className="absolute bottom-10 right-10 text-white/50 animate-pulse flex items-center gap-2">
              Toca para avanzar <ChevronRight />
            </div>
          )}
          
          {/* Progress bar */}
          <div className="absolute top-4 left-4 right-4 flex gap-2">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 flex-1 rounded-full ${i <= slide ? "bg-white" : "bg-white/20"}`} 
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}