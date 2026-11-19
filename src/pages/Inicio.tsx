import { Building2, CalendarDays, MapPin, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
export function Inicio() {
  const [busca, buscar] = useState("");
  const navegar = useNavigate();
  return (
    <div className="container-site page">
      <section className="hero px-6 py-12 sm:px-12 sm:py-20">
        <img className="hero-photo" src="/imagens/garage-hero.webp" alt="" />
        <div className="hero-shade" />
        <div className="relative max-w-2xl">
          <span className="hero-local">
            <MapPin size={15} /> Seu próximo destino começa aqui
          </span>
          <h1 className="hero-title mt-7">
            Menos voltas.
            <br />
            <span>
              Mais tempo
              <br />
              para você.
            </span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-pine-100">
            Encontre estacionamentos, conheça as tarifas e solicite sua reserva
            antes de sair de casa.
          </p>
          <form
            className="mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              navegar("/estacionamentos?busca=" + encodeURIComponent(busca));
            }}
          >
            <label className="sr-only" htmlFor="destino">
              Seu destino
            </label>
            <input
              id="destino"
              className="field flex-1"
              value={busca}
              onChange={(e) => buscar(e.target.value)}
              placeholder="Rua, bairro ou estacionamento"
            />
            <button className="button bg-lime-200 text-pine-950">
              Encontrar estacionamento
            </button>
          </form>
        </div>
      </section>
      <section className="py-12 sm:py-16">
        <p className="text-sm font-bold uppercase tracking-widest text-pine-700">
          Da busca à chegada
        </p>
        <h2 className="section-title mt-3">
          Seu lugar na cidade,
          <br />
          com mais tranquilidade.
        </h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {[
            [
              MapPin,
              "Encontre seu destino",
              "Busque por nome, endereço ou CEP e confira horários e acessibilidade.",
            ],
            [
              CalendarDays,
              "Planeje sua chegada",
              "Escolha uma data e um horário. Acompanhe a confirmação da sua solicitação.",
            ],
            [
              ShieldCheck,
              "Tenha tudo à mão",
              "Consulte suas reservas e mantenha seus veículos organizados.",
            ],
          ].map(([Icone, titulo, texto]) => {
            const Icon = Icone as typeof MapPin;
            return (
              <article key={String(titulo)} className="panel">
                <div className="feature-icon">
                  <Icon />
                </div>
                <h3 className="mt-5 text-xl font-bold">{String(titulo)}</h3>
                <p className="mt-3 text-ink-muted">{String(texto)}</p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="panel flex flex-wrap items-center justify-between gap-6 bg-pine-50">
        <div>
          <Building2 className="text-pine-800" />
          <h2 className="mt-3 text-2xl font-bold">
            Seu estacionamento, mais conectado.
          </h2>
          <p className="mt-2 text-ink-muted">
            Publique sua unidade e acompanhe reservas, tarifas e movimentação.
          </p>
        </div>
        <Link to="/cadastro?perfil=DONO" className="button button-primary">
          Quero ser parceiro
        </Link>
      </section>
    </div>
  );
}
