import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { FeedbackProvider } from "./contexts/FeedbackContext";
import { SessaoProvider } from "./contexts/SessaoContext";
import { Inicio } from "./pages/Inicio";
import { Estacionamentos } from "./pages/Estacionamentos";
import { Detalhe } from "./pages/Detalhe";
import { Conta } from "./pages/Conta";
import { Veiculos } from "./pages/Veiculos";
import { Reservas } from "./pages/Reservas";
import { Parceiro, EditarUnidade } from "./pages/Parceiro";
import { GestaoReservas } from "./pages/GestaoReservas";
import { Tarifas } from "./pages/Tarifas";
import { Acessos } from "./pages/Acessos";
import {
  Contato,
  FAQ,
  Integrante,
  Integrantes,
  NaoEncontrado,
  Sobre,
} from "./pages/Institucional";
export function App() {
  return (
    <SessaoProvider>
      <FeedbackProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Inicio />} />
            <Route path="estacionamentos" element={<Estacionamentos />} />
            <Route path="estacionamentos/:id" element={<Detalhe />} />
            <Route path="entrar" element={<Conta />} />
            <Route path="cadastro" element={<Conta cadastro />} />
            <Route path="veiculos" element={<Veiculos />} />
            <Route path="minhas-reservas" element={<Reservas />} />
            <Route path="minhas-reservas/:id" element={<Reservas />} />
            <Route path="parceiro" element={<Parceiro />} />
            <Route
              path="parceiro/estacionamentos/novo"
              element={<EditarUnidade nova />}
            />
            <Route
              path="parceiro/estacionamentos/:id/editar"
              element={<EditarUnidade />}
            />
            <Route path="parceiro/:id/reservas" element={<GestaoReservas />} />
            <Route path="parceiro/:id/tarifas" element={<Tarifas />} />
            <Route path="parceiro/:id/acessos" element={<Acessos />} />
            <Route path="sobre" element={<Sobre />} />
            <Route path="integrantes" element={<Integrantes />} />
            <Route path="integrantes/:id" element={<Integrante />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="contato" element={<Contato />} />
            <Route path="*" element={<NaoEncontrado />} />
          </Route>
        </Routes>
      </FeedbackProvider>
    </SessaoProvider>
  );
}
