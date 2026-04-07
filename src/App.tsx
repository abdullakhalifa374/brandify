import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import SelectPlan from "./pages/SelectPlan";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// NEW: Import FreeTemplates instead of Demo
import FreeTemplates from "./pages/FreeTemplates"; 
import Marketplace from "./pages/Marketplace";
import AppHome from "./pages/AppHome";
import AppTemplates from "./pages/AppTemplates";
import AppAccount from "./pages/AppAccount";
import AppContact from "./pages/AppContact";
import Rewards from "./pages/Rewards"; 
import NotFound from "./pages/NotFound";

import PublicLayout from "./components/PublicLayout";
import AppLayout from "./components/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Public routes with navbar */}
            <Route element={<PublicLayout />}>
              {/* NEW: Updated Route */}
              <Route path="/free-templates" element={<FreeTemplates />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Authenticated app routes */}
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<AppHome />} />
              <Route path="templates" element={<AppTemplates />} />
              <Route path="account" element={<AppAccount />} />
              <Route path="contact" element={<AppContact />} />
              <Route path="rewards" element={<Rewards />} /> 
            </Route>

            {/* Second Public routes block including SelectPlan */}
            <Route element={<PublicLayout />}>
              {/* NEW: Updated Route */}
              <Route path="/free-templates" element={<FreeTemplates />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/select-plan" element={<SelectPlan />} /> 
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
