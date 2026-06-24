import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import Header from "./components/Header";
import BannerCarousel from "./components/BannerCarousel";
import MenuGrid from "./components/MenuGrid";
import AboutCAR from "./components/AboutCAR";
import RegistrationModule from "./components/RegistrationModule";
import SubmitCAR from "./components/SubmitCAR";
import RectifyCAR from "./components/RectifyCAR";
import OwnerCenter from "./components/OwnerCenter";
import ConsultCAR from "./components/ConsultCAR";
import FAQ from "./components/FAQ";
import ContactUs from "./components/ContactUs";
import Footer from "./components/Footer";
import AssistantFAB from "./components/AssistantFAB";
import AgentUI from "./components/Agent/AgentUI";

import { MOCK_PROPERTIES, MOCK_FAQS } from "./data";
import { Property } from "./types";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("home");
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [showAgent, setShowAgent] = useState(false);

  const handleAddProperty = (newProp: Property) => {
    setProperties((prev) => [newProp, ...prev]);
  };

  const handleUpdateProperty = (updatedProp: Property) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === updatedProp.id ? updatedProp : p))
    );
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Render sub-page views dynamically
  const renderContent = () => {
    switch (currentView) {
      case "sobre":
        return <AboutCAR />;
      case "cadastro":
        return <RegistrationModule onAddProperty={handleAddProperty} />;
      case "envio":
        return <SubmitCAR onAddProperty={handleAddProperty} />;
      case "retificacao":
        return <RectifyCAR properties={properties} onUpdateProperty={handleUpdateProperty} />;
      case "proprietario":
        return <OwnerCenter properties={properties} onUpdateProperty={handleUpdateProperty} />;
      case "consulta":
        return <ConsultCAR properties={properties} />;
      case "faq":
        return <FAQ faqs={MOCK_FAQS} />;
      case "contato":
        return <ContactUs />;
      default:
        return (
          <div className="space-y-6">
            <BannerCarousel onNavigateToView={handleNavigate} />
            <MenuGrid onSelectView={handleNavigate} activeView={currentView} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface-background flex flex-col justify-between font-sans antialiased text-slate-800" id="main-container">
      <div>
        <Header onGoHome={() => handleNavigate("home")} currentView={currentView} />

        <main className="max-w-7xl mx-auto px-4 md:px-10 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              id="view-content"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Footer onNavigateToView={handleNavigate} />
      <AssistantFAB onOpen={() => setShowAgent(true)} />
      
      <AnimatePresence>
        {showAgent && <AgentUI onClose={() => setShowAgent(false)} />}
      </AnimatePresence>
    </div>
  );
}
