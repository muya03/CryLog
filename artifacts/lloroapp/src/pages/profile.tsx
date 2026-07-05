import { useRef, useState } from "react";
import { useUser, useClerk } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, Camera, Loader2 } from "lucide-react";

export function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen (JPG, PNG, GIF…)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen no puede pesar más de 10 MB");
      return;
    }

    setError(null);
    setUploading(true);
    try {
      await user.setProfileImage({ file });
    } catch (err: any) {
      setError(err?.errors?.[0]?.message ?? "No se pudo subir la foto. Inténtalo de nuevo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Tu Perfil</h1>
        <p className="text-muted-foreground">Ajustes y cuenta.</p>
      </div>

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar with upload overlay */}
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-md">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {user?.firstName?.substring(0, 2).toUpperCase() || "ME"}
                </AvatarFallback>
              </Avatar>

              {/* Camera overlay button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                title="Cambiar foto"
              >
                {uploading
                  ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                  : <Camera className="w-6 h-6 text-white" />
                }
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="text-center sm:text-left space-y-2">
              <h2 className="text-2xl font-bold">{user?.fullName}</h2>
              <p className="text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="rounded-full text-sm border-primary/30 text-primary hover:bg-primary/10"
              >
                {uploading ? (
                  <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Subiendo…</>
                ) : (
                  <><Camera className="w-3 h-3 mr-1.5" /> Cambiar foto</>
                )}
              </Button>
              {error && <p className="text-xs text-danger">{error}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-border/50 shadow-sm overflow-hidden border-danger/20">
        <CardHeader>
          <CardTitle className="text-danger">Ajustes de cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para gestionar la privacidad, cambio de contraseña u otros detalles, por favor contacta al administrador del grupo (es una app pequeña, ya sabes cómo funciona).
          </p>
          <Button
            variant="outline"
            className="w-full text-danger border-danger/30 hover:bg-danger/10"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
