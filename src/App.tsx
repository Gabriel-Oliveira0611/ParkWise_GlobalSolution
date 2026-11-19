import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { SessaoProvider } from "./contexts/SessaoContext";
import { FeedbackProvider } from "./contexts/FeedbackContext";
import { Inicio } from "./pages/Inicio";
import { Estacionamentos } from "./pages/Estacionamentos";
import { Conta } from "./pages/Conta";
import {
  Contato,
  FAQ,
  Integrante,
  Integrantes,
  NaoEncontrado,
  Sobre,
} from "./pages/Institucional";
import { Veiculos } from "./pages/Veiculos";
import { Reservas } from "./pages/Reservas";
export function App() {
  return (
    <SessaoProvider>
      <FeedbackProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Inicio />} />
            <Route path="estacionamentos" element={<Estacionamentos />} />
            <Route path="entrar" element={<Conta />} />
            <Route path="cadastro" element={<Conta cadastro />} />
            <Route path="sobre" element={<Sobre />} />
            <Route path="integrantes" element={<Integrantes />} />
            <Route path="integrantes/:id" element={<Integrante />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="contato" element={<Contato />} />
            <Route path="veiculos" element={<Veiculos />} />
            <Route path="minhas-reservas" element={<Reservas />} />
            <Route path="minhas-reservas/:id" element={<Reservas />} />
            <Route path="*" element={<NaoEncontrado />} />
          </Route>
        </Routes>
      </FeedbackProvider>
    </SessaoProvider>
  );
}
