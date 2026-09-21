import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navigation } from './components/Navigation.js';
import { GlossaryModal } from './components/GlossaryModal.js';
import { SupportModal } from './components/SupportModal.js';
import { OnboardingModal } from './components/OnboardingModal.js';
import { ExpertReviewModal } from './components/ExpertReviewModal.js';

// Views
import { LandingPage } from './views/LandingPage.js';
import { AuthModal } from './views/AuthModal.js';
import { DashboardView } from './views/DashboardView.js';
import { FarmsView } from './views/FarmsView.js';
import { FarmDetailView } from './views/FarmDetailView.js';
import { ScanSoilView } from './views/ScanSoilView.js';
import { AnalysisDetailView } from './views/AnalysisDetailView.js';
import { CropExplorerView } from './views/CropExplorerView.js';
import { HistoryView } from './views/HistoryView.js';
import { JournalView } from './views/JournalView.js';
import { LearnView } from './views/LearnView.js';
import { SoilHealthView } from './views/SoilHealthView.js';
import { ProfileView } from './views/ProfileView.js';
import { PrintReportView } from './views/PrintReportView.js';

function MainApplication() {
  const { profile, isAuthenticated, isLoading } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Agronomist Review Modal
  const [expertReviewData, setExpertReviewData] = useState<{ analysisId: string; farmId: string } | null>(null);

  // Check onboarding for first-time login
  useEffect(() => {
    if (isAuthenticated && profile) {
      const onboardedKey = `shambasoil_onboarded_${profile.id}`;
      const hasOnboarded = localStorage.getItem(onboardedKey);
      if (!hasOnboarded) {
        setIsOnboardingOpen(true);
      }
    }
  }, [isAuthenticated, profile]);

  const handleCompleteOnboarding = () => {
    if (profile) {
      localStorage.setItem(`shambasoil_onboarded_${profile.id}`, 'true');
    }
    setIsOnboardingOpen(false);
  };

  const handleStartFirstScanFromOnboarding = (farmId: string) => {
    setSelectedFarmId(farmId);
    setCurrentView('scan');
  };

  // View navigation helper
  const navigateTo = (view: string, id?: string) => {
    if (view === 'farm-detail' && id) {
      setSelectedFarmId(id);
    } else if (view === 'analysis-detail' && id) {
      setSelectedAnalysisId(id);
    } else if (view === 'report' && id) {
      setSelectedAnalysisId(id);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-stone-600 font-bold text-sm font-display">ShambaSoil Kenya</p>
        </div>
      </div>
    );
  }

  // If user is not logged in, render the landing page
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage
          onGetStarted={() => {
            setAuthMode('register');
            setIsAuthModalOpen(true);
          }}
          onSignIn={() => {
            setAuthMode('signin');
            setIsAuthModalOpen(true);
          }}
          onExploreCrops={() => {
            setAuthMode('signin');
            setIsAuthModalOpen(true);
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authMode}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            setIsAuthModalOpen(false);
            setCurrentView('dashboard');
          }}
        />
      </>
    );
  }

  // Authenticated Farmer Application View
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-body selection:bg-emerald-200">
      {/* Top and Bottom Navigation Shell */}
      <Navigation
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
      >
        {/* Main Content Router */}
        {currentView === 'dashboard' && (
          <DashboardView
            onNavigate={navigateTo}
            onOpenScanWithFarm={(fId) => {
              setSelectedFarmId(fId);
              setCurrentView('scan');
            }}
          />
        )}

        {currentView === 'farms' && (
          <FarmsView
            onSelectFarm={(fId) => {
              setSelectedFarmId(fId);
              setCurrentView('farm-detail');
            }}
            onScanSoil={(fId) => {
              setSelectedFarmId(fId);
              setCurrentView('scan');
            }}
          />
        )}

        {currentView === 'farm-detail' && selectedFarmId && (
          <FarmDetailView
            farmId={selectedFarmId}
            onBack={() => setCurrentView('farms')}
            onScanSoil={(fId) => {
              setSelectedFarmId(fId);
              setCurrentView('scan');
            }}
            onSelectAnalysis={(aId) => {
              setSelectedAnalysisId(aId);
              setCurrentView('analysis-detail');
            }}
          />
        )}

        {currentView === 'scan' && (
          <ScanSoilView
            initialFarmId={selectedFarmId || undefined}
            onAnalysisCompleted={(aId) => {
              setSelectedAnalysisId(aId);
              setCurrentView('analysis-detail');
            }}
            onCancel={() => setCurrentView('dashboard')}
            onNavigateToFarms={() => setCurrentView('farms')}
          />
        )}

        {currentView === 'analysis-detail' && selectedAnalysisId && (
          <AnalysisDetailView
            analysisId={selectedAnalysisId}
            onBack={() => setCurrentView('dashboard')}
            onRequestExpertReview={(aId, fId) => setExpertReviewData({ analysisId: aId, farmId: fId })}
            onOpenReport={(aId) => {
              setSelectedAnalysisId(aId);
              setCurrentView('report');
            }}
          />
        )}

        {currentView === 'crops' && <CropExplorerView />}

        {currentView === 'history' && (
          <HistoryView
            onSelectAnalysis={(aId) => {
              setSelectedAnalysisId(aId);
              setCurrentView('analysis-detail');
            }}
            onNewScan={() => setCurrentView('scan')}
          />
        )}

        {currentView === 'journal' && <JournalView />}

        {currentView === 'learn' && <LearnView />}

        {currentView === 'soil-health' && (
          <SoilHealthView
            onScanSoil={() => setCurrentView('scan')}
            onViewCrops={() => setCurrentView('crops')}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            onOpenSupport={() => setIsSupportOpen(true)}
          />
        )}

        {currentView === 'report' && selectedAnalysisId && (
          <PrintReportView
            analysisId={selectedAnalysisId}
            onBack={() => setCurrentView('analysis-detail')}
          />
        )}
      </Navigation>

      {/* Modals */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
        onStartFirstScan={handleStartFirstScanFromOnboarding}
      />

      {expertReviewData && (
        <ExpertReviewModal
          isOpen={true}
          analysisId={expertReviewData.analysisId}
          farmId={expertReviewData.farmId}
          onClose={() => setExpertReviewData(null)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApplication />
    </AuthProvider>
  );
}
