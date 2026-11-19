import { Building2, CircleParking, Menu, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useSessao } from "../contexts/SessaoContext";
const sobre = [
  ["/sobre", "Sobre"],
  ["/integrantes", "Integrantes"],
  ["/faq", "FAQ"],
  ["/contato", "Contato"],
];
export function Marca({ clara = false }: { clara?: boolean }) {
  return (
    <Link
      to="/"
      className={"marca " + (clara ? "text-white" : "text-ink")}
      aria-label="ParkWise, início"
    >
      <span className="marca-icone bg-pine-800 text-white">
        <CircleParking size={22} />
      </span>
      <span>
        ParkWise<span className="text-pine-500">.</span>
      </span>
    </Link>
  );
}
export function Layout() {
  const { pathname } = useLocation();
  const [menu, setMenu] = useState(false);
  const { sessao, atualizar } = useSessao();
  const parceiro = sessao?.usuario.papel === "DONO";
  const links = [
    ["/", "Início"],
    ["/estacionamentos", "Estacionamentos"],
    ...(parceiro
      ? [["/parceiro", "Minhas unidades"]]
      : [
          ["/minhas-reservas", "Minhas reservas"],
          ["/veiculos", "Veículos"],
        ]),
  ];
  useEffect(() => {
    setMenu(false);
    window.scrollTo(0, 0);
  }, [pathname]);
  useEffect(() => {
    const atualizarTitulo = () => {
      const titulo = document
        .querySelector("h1")
        ?.innerText?.replace(/\s+/g, " ")
        .trim();
      document.title = (titulo ? titulo + " · " : "") + "ParkWise";
    };
    atualizarTitulo();
    const observador = new MutationObserver(atualizarTitulo);
    const principal = document.querySelector("main");
    if (principal)
      observador.observe(principal, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    return () => observador.disconnect();
  }, [pathname]);
  const acesso = sessao ? (
    <button className="button button-secondary" onClick={() => atualizar(null)}>
      Sair · {sessao.usuario.nome.split(" ")[0]}
    </button>
  ) : (
    <Link to="/entrar" className="button button-secondary">
      <UserRound size={16} /> Entrar
    </Link>
  );
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo
      </a>
      <header className="site-header">
        <div className="container-site flex min-h-[76px] items-center justify-between gap-4">
          <Marca />
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Principal"
          >
            {links.map(([href, texto]) => (
              <NavLink
                key={href}
                to={href}
                end={href === "/"}
                className="nav-item"
              >
                {texto}
              </NavLink>
            ))}
          </nav>
          <div className="hidden gap-2 lg:flex">
            {!parceiro && (
              <Link to="/parceiro" className="button button-ghost">
                <Building2 size={17} /> Sou parceiro
              </Link>
            )}
            {acesso}
          </div>
          <button
            className="icon-button size-11 rounded-xl border border-line lg:hidden"
            aria-label={menu ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menu}
            aria-controls="menu-mobile"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
        {menu && (
          <nav
            id="menu-mobile"
            aria-label="Navegação mobile"
            className="container-site grid gap-1 py-4 lg:hidden"
          >
            {[...links, ["/parceiro", "Área do parceiro"], ...sobre].map(
              ([href, texto]) => (
                <Link key={href} to={href} className="nav-item">
                  {texto}
                </Link>
              ),
            )}
            {acesso}
          </nav>
        )}
      </header>
      <main id="conteudo" tabIndex={-1} className="min-h-[60vh]">
        <Outlet />
      </main>
      <footer className="mt-16 bg-pine-950 py-10 text-white">
        <div className="container-site grid gap-8 sm:grid-cols-3">
          <div>
            <Marca clara />
            <p className="mt-4 text-pine-100">
              Menos voltas.
              <br />
              Mais cidade para você.
            </p>
          </div>
          <nav aria-label="Institucional" className="grid gap-3 text-sm">
            {sobre.map(([href, texto]) => (
              <Link className="footer-link" key={href} to={href}>
                {texto}
              </Link>
            ))}
          </nav>
          <div className="text-sm text-pine-100">
            <strong className="text-white">Uma cidade mais simples.</strong>
            <p className="mt-3">
              ParkWise · CitizenTech
              <br />
              FIAP Global Solution 2026
            </p>
            <Link className="footer-link mt-4" to="/cadastro?perfil=DONO">
              Cadastre seu estacionamento
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
