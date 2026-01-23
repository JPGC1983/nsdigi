import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Municipios from "./pages/Municipios";
import Foruns from "./pages/Foruns";
import Educacao from "./pages/Educacao";
import Repositorio from "./pages/Repositorio";
import Indicadores from "./pages/Indicadores";
import Governanca from "./pages/Governanca";
import Configuracoes from "./pages/Configuracoes";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/municipios" element={<Municipios />} />
            <Route path="/foruns" element={<Foruns />} />
            <Route path="/educacao" element={<Educacao />} />
            <Route path="/repositorio" element={<Repositorio />} />
            <Route path="/indicadores" element={<Indicadores />} />
            <Route path="/governanca" element={<Governanca />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
