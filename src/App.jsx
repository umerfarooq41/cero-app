import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import AppLayout from "@/components/layout/AppLayout";
import Plan from "@/pages/Plan";
import Transactions from "@/pages/Transactions";
import AddTransaction from "@/pages/AddTransaction";
import Accounts from "@/pages/Accounts";
import AccountDetail from "@/pages/AccountDetail";
import AddAccount from "@/pages/AddAccount";
import Categories from "@/pages/Categories";
import Settings from "@/pages/Settings";
import Reflect from "@/pages/Reflect";
import Onboarding from "@/pages/Onboarding";


// 🎬 Splash Component (CERO style)
const Splash = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_50%_40%,#0b2230,#050f16)] z-[9999]">
    <div className="relative w-24 h-24">
      <div className="absolute inset-[-16px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.25),transparent_70%)] animate-pulse"></div>
      <div className="w-full h-full rounded-full bg-[conic-gradient(#67e8f9,#22d3ee,#0ea5e9,#2563eb)] [mask:radial-gradient(circle,transparent_55%,black_56%)] animate-spin"></div>
    </div>
  </div>
);


// 🔐 Authenticated App
const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // 🔥 Replace boring spinner with branded loader
  if (isLoadingPublicSettings || isLoadingAuth) {
    return <Splash />;
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    } else if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Plan />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/add-transaction" element={<AddTransaction />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/accounts/:id" element={<AccountDetail />} />
        <Route path="/add-account" element={<AddAccount />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reflect" element={<Reflect />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


// 🧠 Root App
function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Show splash only on first load
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && <Splash />}

      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </>
  );
}

export default App;