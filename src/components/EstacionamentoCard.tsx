import { MapPin, Clock3, CircleParking } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type { Estacionamento } from "../types/api";
import { hora } from "../utils/formatacao";
export function Foto({
  local,
  className = "",
}: {
  local: Estacionamento;
  className?: string;
}) {
  const [falhou, falhar] = useState(false);
  const externa = !falhou && /^https:\/\//i.test(local.foto ?? "");
  return (
    <figure className={"relative overflow-hidden bg-pine-50 " + className}>
      <img
        onError={() => falhar(true)}
        src={externa ? local.foto : "/imagens/garage-paulista.webp"}
        alt={externa ? "Estacionamento " + local.nome : "Garagem ilustrativa"}
        className="size-full object-cover"
        loading="lazy"
      />
      {!externa && (
        <figcaption className="absolute bottom-2 right-2 rounded bg-black/65 px-2 py-1 text-xs text-white">
          Imagem ilustrativa
        </figcaption>
      )}
    </figure>
  );
}
export function EstacionamentoCard({ local }: { local: Estacionamento }) {
  return (
    <article className="parking-card">
      <Foto local={local} className="parking-photo" />
      <div className="grid flex-1 gap-3 p-5">
        <span className="w-fit rounded-full bg-pine-50 px-3 py-1 text-sm font-bold text-pine-800">
          {local.vagasPreferenciais > 0
            ? "Com vagas preferenciais"
            : "Estacionamento parceiro"}
        </span>
        <h2 className="text-xl font-bold">{local.nome}</h2>
        <p className="flex gap-2 text-sm text-ink-muted">
          <MapPin size={17} className="shrink-0" /> {local.endereco},{" "}
          {local.numero}
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-ink-muted">
          <span className="flex gap-2">
            <Clock3 size={17} /> {hora(local.horaAbertura)} –{" "}
            {hora(local.horaFechamento)}
          </span>
          <span className="flex gap-2">
            <CircleParking size={17} /> {local.maximoDeVagas} vagas totais
          </span>
        </div>
        <Link
          to={"/estacionamentos/" + local.id}
          className="button button-primary mt-2"
        >
          Ver estacionamento
        </Link>
      </div>
    </article>
  );
}
