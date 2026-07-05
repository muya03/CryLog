import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateCry, useListUsers } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Heart } from "lucide-react";

const cryTypes = [
  "Tristeza", "Estrés", "Felicidad", "Nostalgia", "Frustración", "Película/Arte", "Cortando cebolla"
];

const formSchema = z.object({
  intensity: z.number().min(1).max(10),
  occurredAt: z.string(),
  reason: z.string().optional(),
  cryType: z.string().optional(),
  wasAlone: z.boolean().default(true),
  durationMinutes: z.coerce.number().optional(),
  trigger: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
});

const INTENSITY_EMOJI = (val: number) => {
  if (val <= 2) return "🥲";
  if (val <= 4) return "😢";
  if (val <= 6) return "😭";
  if (val <= 8) return "🌧️";
  return "🌊";
};

export function AddCryPage() {
  const [, setLocation] = useLocation();
  const createCry = useCreateCry();
  const { data: users } = useListUsers();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      intensity: 5,
      occurredAt: new Date().toISOString().slice(0, 16),
      wasAlone: true,
    },
  });

  const intensity = form.watch("intensity");

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createCry.mutate(
      { data: { ...values, occurredAt: new Date(values.occurredAt).toISOString() } },
      {
        onSuccess: (cry) => {
          sessionStorage.setItem("lastCry", JSON.stringify({
            intensity: cry.intensity,
            cryType: cry.cryType,
            trigger: cry.trigger,
          }));
          setLocation("/calm");
        },
      }
    );
  };

  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-primary mb-1">Registrar lloro</h1>
        <p className="text-sm text-muted-foreground">Tómate tu tiempo. Este es un espacio seguro.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          {/* Intensidad — tarjeta principal */}
          <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-5 space-y-4">
              <FormField
                control={form.control}
                name="intensity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">¿Qué tan intenso fue?</FormLabel>
                    <div className="flex flex-col items-center gap-4 py-3">
                      <div className="text-6xl transition-all duration-200 ease-out">
                        {INTENSITY_EMOJI(field.value)}
                      </div>
                      <FormControl>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="w-full"
                        />
                      </FormControl>
                      <div className="flex justify-between w-full text-xs text-muted-foreground font-medium px-1">
                        <span>1 · Una lagrimita</span>
                        <span className="font-black text-lg text-primary">{field.value}</span>
                        <span>10 · Mar de lágrimas</span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Necesito ayuda — aparece en intensidad 10 */}
              {intensity === 10 && (
                <div className="bg-danger/10 border border-danger/20 rounded-2xl p-4 animate-in zoom-in-95 duration-300">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-danger text-sm">Parece que ha sido duro</h4>
                      <p className="text-xs text-danger/80 mb-3">No estás solo. Puedes contactar a alguien del grupo:</p>
                      <div className="flex flex-wrap gap-2">
                        {users?.map(u => (
                          <span key={u.id} className="bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-full text-xs font-medium border border-danger/10">
                            {u.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalles */}
          <Card className="rounded-3xl border-border/50 shadow-sm">
            <CardContent className="p-5 space-y-5">

              {/* Tipo de lloro — chips */}
              <FormField
                control={form.control}
                name="cryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de lloro</FormLabel>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {cryTypes.map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => field.onChange(field.value === type ? undefined : type)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            field.value === type
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Por qué lloraste?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Me sentí abrumado en el trabajo…" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trigger"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detonante</FormLabel>
                    <FormControl>
                      <Input placeholder="Una canción, un comentario…" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occurredAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Cuándo fue?</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="durationMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración (min)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="15" {...field} className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lugar</FormLabel>
                      <FormControl>
                        <Input placeholder="Mi cuarto…" {...field} className="rounded-xl" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="wasAlone"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-xl border p-4 bg-card">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm">¿Estabas solo/a?</FormLabel>
                      <FormDescription className="text-xs">
                        A veces es bueno estar acompañado.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas privadas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escribe lo que necesites sacar…"
                        className="resize-none h-20 rounded-xl"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full h-14 text-base rounded-2xl shadow-lg bg-primary hover:bg-primary/90 font-semibold"
            disabled={createCry.isPending}
          >
            {createCry.isPending ? "Guardando…" : "Guardar en el diario"}{" "}
            <Heart className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </Form>
    </div>
  );
}
