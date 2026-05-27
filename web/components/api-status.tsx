"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type Status = "verificando" | "operacional" | "fora";

export function ApiStatus() {
  const [status, setStatus] = useState<Status>("verificando");

  useEffect(() => {
    async function verificar() {
      try {
        const res = await fetch(`${API_URL}/ws/01001000/json/`);
        const data = await res.json();
        setStatus(res.ok && data.cep ? "operacional" : "fora");
      } catch {
        setStatus("fora");
      }
    }

    verificar();
    const intervalo = setInterval(verificar, 60000);
    return () => clearInterval(intervalo);
  }, []);

  const cor =
    status === "operacional"
      ? "bg-emerald-400"
      : status === "fora"
        ? "bg-red-400"
        : "bg-white/20 animate-pulse";

  const texto =
    status === "operacional"
      ? "API operacional"
      : status === "fora"
        ? "API fora do ar"
        : "Verificando...";

  const corTexto =
    status === "operacional"
      ? "text-emerald-400/70"
      : status === "fora"
        ? "text-red-400/70"
        : "text-white/30";

  return (
    <Link
      href="/status"
      className={`inline-flex items-center gap-2 text-xs ${corTexto} hover:text-white/50 transition-colors`}
    >
      <span className={`size-1.5 rounded-full ${cor}`} />
      {texto}
    </Link>
  );
}
