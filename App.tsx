import React, { useCallback, useEffect, useState } from 'react';
import Home from './components/Home';
import ChatInterface from './components/ChatInterface';
import ScriptGenerator from './components/ScriptGenerator';
import StrategiesFeed from './components/StrategiesFeed';
import ProfileAuditor from './components/ProfileAuditor';
import SEOOptimizer from './components/SEOOptimizer';
import UserProfile from './components/UserProfile';
import LegalDoc from './components/LegalDoc';
import NewsPage from './components/NewsPage';
import { ViewState } from './types';
import { supabase } from './services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import AuthScreen from './components/AuthScreen';
import AccessBlocked from './components/AccessBlocked';
import LoadingScreen from './components/LoadingScreen';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/news') {
      return ViewState.NEWS;
    }
    return ViewState.HOME;
  });
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState<'loading' | 'active' | 'inactive'>('loading');
  const [accessPlan, setAccessPlan] = useState<string | null>(null);
  const [accessRawStatus, setAccessRawStatus] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname === '/news') {
        setViewState(ViewState.NEWS);
        return;
      }
      if (viewState === ViewState.NEWS) {
        setViewState(ViewState.HOME);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [viewState]);

  const normalizeStatus = (value: string | null) => {
    const normalized = (value ?? '').toLowerCase();
    if (['active', 'approved', 'paid', 'renewed'].some((status) => normalized.includes(status))) {
      return 'active' as const;
    }
    return 'inactive' as const;
  };

  const refreshAccess = useCallback(async (currentSession?: Session | null) => {
    const activeSession = currentSession ?? session;
    const email = activeSession?.user?.email;
    if (!email) {
      setAccessStatus('inactive');
      setAccessPlan(null);
      setAccessRawStatus(null);
      return;
    }

    setAccessStatus('loading');
    const { data, error } = await supabase
      .from('subscriptions')
      .select('status, plan, user_id')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      setAccessStatus('inactive');
      setAccessPlan(null);
      setAccessRawStatus(null);
      return;
    }

    setAccessRawStatus(data.status ?? null);
    setAccessPlan(data.plan ?? null);
    setAccessStatus(normalizeStatus(data.status ?? null));

    if (!data.user_id && activeSession?.user?.id) {
      await supabase
        .from('subscriptions')
        .update({ user_id: activeSession.user.id })
        .eq('email', email);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      refreshAccess(session);
    } else {
      setAccessStatus('inactive');
      setAccessPlan(null);
      setAccessRawStatus(null);
    }
  }, [session, refreshAccess]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleSetViewState = useCallback((view: ViewState) => {
    setViewState(view);
    if (view === ViewState.NEWS && window.location.pathname !== '/news') {
      window.history.pushState({}, '', '/news');
    } else if (view === ViewState.HOME && window.location.pathname === '/news') {
      window.history.pushState({}, '', '/');
    }
  }, []);

  const renderView = () => {
    switch (viewState) {
      case ViewState.CHAT:
        return <ChatInterface setViewState={handleSetViewState} />;
      case ViewState.SCRIPT_GENERATOR:
        return <ScriptGenerator setViewState={handleSetViewState} />;
      case ViewState.STRATEGIES:
        return <StrategiesFeed setViewState={handleSetViewState} />;
      case ViewState.NEWS:
        return <NewsPage onBack={() => handleSetViewState(ViewState.HOME)} />;
      case ViewState.PROFILE_AUDITOR:
        return <ProfileAuditor setViewState={handleSetViewState} />;
      case ViewState.SEO_OPTIMIZER:
        return <SEOOptimizer setViewState={handleSetViewState} />;
      case ViewState.USER_PROFILE:
        return <UserProfile setViewState={handleSetViewState} />;
      case ViewState.LEGAL_TERMS:
        return <LegalDoc setViewState={handleSetViewState} type="terms" />;
      case ViewState.LEGAL_PRIVACY:
        return <LegalDoc setViewState={handleSetViewState} type="privacy" />;
      case ViewState.HOME:
      default:
        return (
          <Home
            setViewState={handleSetViewState}
            userEmail={session?.user?.email ?? undefined}
            onSignOut={handleSignOut}
          />
        );
    }
  };

  return (
    <div className="antialiased text-gray-900">
      {authLoading || (session && accessStatus === 'loading') ? (
        <LoadingScreen />
      ) : !session ? (
        <AuthScreen />
      ) : accessStatus !== 'active' ? (
        <AccessBlocked
          email={session.user.email ?? 'sem email'}
          status={accessRawStatus}
          plan={accessPlan}
          onRefresh={() => refreshAccess(session)}
          onSignOut={handleSignOut}
        />
      ) : (
        renderView()
      )}
    </div>
  );
};

export default App;
