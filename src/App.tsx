import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { SessaoProvider } from "./contexts/SessaoContext";
import { FeedbackProvider } from "./contexts/FeedbackContext";
import { Inicio } from "./pages/Inicio";
import { Estacionamentos } from "./pages/Estacionamentos";
import { Conta } from "./pages/Conta";
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
            <Route
              path="*"
              element={<p>Pagina em desenvolvimento nesta etapa.</p>}
            />
          </Route>
        </Routes>
      </FeedbackProvider>
    </SessaoProvider>
  );
}
