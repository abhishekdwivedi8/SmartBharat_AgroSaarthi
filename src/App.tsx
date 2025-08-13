import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useNavigationState } from "@/hooks/use-navigation-state";
import { useEffect } from "react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import VoiceAssistant from "./pages/VoiceAssistant";
import MandiPrices from "./pages/MandiPrices";
import CropHealth from "./pages/CropHealth";
import WeatherAdvisory from "./pages/WeatherAdvisory";
import AgriGame from "./pages/AgriGame";
import EPass from "./pages/EPass";
import BlockchainTracking from "./pages/BlockchainTracking";
import CropCalendar from "./pages/CropCalendar";
import SubsidyFinder from "./pages/SubsidyFinder";
import AIInsights from "./pages/AIInsights";
import NotFound from "./pages/NotFound";
import AgriMindAI from "./pages/AgriMindAI";
import TerraSenseLab from "./pages/TerraSenseLab";
import HydroSmart from "./pages/HydroSmart";
import MandiPulse from "./pages/MandiPulse";
import KrishiFin from "./pages/KrishiFin";
import WhatsAppButton from "./components/WhatsAppButton";
import Layout from "./components/Layout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/voice" element={<VoiceAssistant />} />
            <Route path="/prices" element={<MandiPrices />} />
            <Route path="/crop-health" element={<CropHealth />} />
            <Route path="/weather" element={<WeatherAdvisory />} />
            <Route path="/agri-game" element={<AgriGame />} />
            <Route path="/e-pass" element={<EPass />} />
            <Route path="/blockchain-tracking" element={<BlockchainTracking />} />
            <Route path="/crop-calendar" element={<CropCalendar />} />
            <Route path="/subsidy-finder" element={<SubsidyFinder />} />
            <Route path="/ai-insights" element={<AIInsights />} />
            <Route path="/agrimind-ai" element={<AgriMindAI />} />
            <Route path="/terrasense-lab" element={<TerraSenseLab />} />
            <Route path="/hydrosmart" element={<HydroSmart />} />
            <Route path="/mandipulse" element={<MandiPulse />} />
            <Route path="/krishifin" element={<KrishiFin />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <WhatsAppButton />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
