import React, { useState } from 'react';
import Home from './components/Home';
import ChatInterface from './components/ChatInterface';
import ScriptGenerator from './components/ScriptGenerator';
import StrategiesFeed from './components/StrategiesFeed';
import ProfileAuditor from './components/ProfileAuditor';
import SEOOptimizer from './components/SEOOptimizer';
import UserProfile from './components/UserProfile';
import LegalDoc from './components/LegalDoc';
import { ViewState } from './types';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);

  const renderView = () => {
    switch (viewState) {
      case ViewState.CHAT:
        return <ChatInterface setViewState={setViewState} />;
      case ViewState.SCRIPT_GENERATOR:
        return <ScriptGenerator setViewState={setViewState} />;
      case ViewState.STRATEGIES:
        return <StrategiesFeed setViewState={setViewState} />;
      case ViewState.PROFILE_AUDITOR:
        return <ProfileAuditor setViewState={setViewState} />;
      case ViewState.SEO_OPTIMIZER:
        return <SEOOptimizer setViewState={setViewState} />;
      case ViewState.USER_PROFILE:
        return <UserProfile setViewState={setViewState} />;
      case ViewState.LEGAL_TERMS:
        return <LegalDoc setViewState={setViewState} type="terms" />;
      case ViewState.LEGAL_PRIVACY:
        return <LegalDoc setViewState={setViewState} type="privacy" />;
      case ViewState.HOME:
      default:
        return <Home setViewState={setViewState} />;
    }
  };

  return (
    <div className="antialiased text-gray-900">
      {renderView()}
    </div>
  );
};

export default App;