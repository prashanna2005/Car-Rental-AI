import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { OverviewPage } from "./pages/OverviewPage";
import { AgentHubPage } from "./pages/AgentHubPage";
import { FleetPage } from "./pages/FleetPage";
import { BookingsPage } from "./pages/BookingsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import { ActivityPage } from "./pages/ActivityPage";
import { SettingsPage } from "./pages/SettingsPage";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [agentInitialPrompt, setAgentInitialPrompt] = useState<string>("");

  const handleNavigateToAgent = (prompt?: string) => {
    if (prompt) setAgentInitialPrompt(prompt);
    setActiveTab("agent_hub");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewPage onNavigateToAgent={handleNavigateToAgent} />;
      case "agent_hub":
        return <AgentHubPage initialPrompt={agentInitialPrompt} />;
      case "fleet":
        return <FleetPage />;
      case "bookings":
        return <BookingsPage />;
      case "customers":
        return <CustomersPage />;
      case "analytics":
        return <AnalyticsPage />;
      case "maintenance":
        return <MaintenancePage />;
      case "activity":
        return <ActivityPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <OverviewPage onNavigateToAgent={handleNavigateToAgent} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        <Header activeTab={activeTab} onOpenAiHub={() => handleNavigateToAgent()} />
        <div className="page-container">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
