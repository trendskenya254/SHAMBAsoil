import React from 'react';
import { Camera, HelpCircle, ArrowRight, ShieldCheck, CheckCircle2, Sprout, Layers, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { PWAInstallButton } from '../components/PWAInstallButton.js';

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
  onExploreCrops: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onSignIn,
  onExploreCrops
}) => {
  const { language, setLanguage, t } = useAuth();

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col selection:bg-emerald-200">
      {/* Landing Header */}
      <header className="px-6 py-4 border-b border-stone-200 bg-white/90 backdrop-blur sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            🌱
          </div>
          <div>
            <span className="font-display font-black text-xl tracking-tight text-stone-900">
              Shamba<span className="text-emerald-700">Soil</span>
            </span>
            <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
              Kenya
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg bg-stone-100 p-0.5 text-xs font-medium border border-stone-200">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-md transition-colors ${language === 'en' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('sw')}
              className={`px-2 py-1 rounded-md transition-colors ${language === 'sw' ? 'bg-white text-stone-900 font-bold shadow-xs' : 'text-stone-600'}`}
            >
              SW
            </button>
          </div>

          <PWAInstallButton />

          <button
            id="landing-signin-nav-btn"
            onClick={onSignIn}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-stone-700 hover:text-stone-900 text-xs sm:text-sm font-semibold rounded-xl hover:bg-stone-100 transition-colors"
          >
            {t.navLogin}
          </button>
          <button
            id="landing-register-nav-btn"
            onClick={onGetStarted}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors inline-flex items-center gap-1"
          >
            <span>{t.navRegister}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-6 py-12 sm:py-20 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'sw' ? 'Teknolojia ya Kilimo cha Kenya' : 'Mobile-First Agricultural Intelligence for Kenya'}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-950 font-display tracking-tight leading-tight max-w-3xl mx-auto">
            {language === 'sw' ? 'Elewa Udongo Wako Kabla Hujanunua Mbolea' : 'Know Your Soil Before You Spend on Inputs'}
          </h1>

          <p className="text-base sm:text-xl text-stone-600 max-w-2xl mx-auto font-normal leading-relaxed">
            {language === 'sw'
              ? 'Piga picha ya udongo. Jibu maswali machache kuhusu shamba lako. Pata ushauri wa kitaalamu wa mazao na afya ya udongo unaolingana na kaunti yako.'
              : 'Take a photo. Understand visible soil indicators. Receive practical crop, liming, and management recommendations tailored to your Kenyan county.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="hero-get-started-btn"
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl shadow-lg shadow-emerald-900/10 transition-all flex items-center justify-center gap-2 text-base"
            >
              <Camera className="w-5 h-5" />
              <span>{language === 'sw' ? 'Anza Kupima Shamba Lako' : 'Start With Your Shamba'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            <button
              id="hero-signin-btn"
              onClick={onSignIn}
              className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-stone-100 text-stone-800 font-semibold rounded-2xl border border-stone-300 transition-colors text-base"
            >
              {language === 'sw' ? 'Ingia Kwenye Akaunti Yako' : 'Sign In to Account'}
            </button>
            <PWAInstallButton variant="hero" />
          </div>

          {/* Safety Notice Callout */}
          <div className="mt-10 p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-left max-w-3xl mx-auto flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-amber-800 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-950 space-y-1">
              <h4 className="font-bold text-amber-900">{t.safetyDisclaimerTitle}</h4>
              <p className="text-amber-800 leading-relaxed">
                {t.safetyDisclaimerText}
              </p>
            </div>
          </div>
        </section>

        {/* 4-Step Practical Flow */}
        <section className="px-6 py-12 bg-white border-y border-stone-200">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-display">
                {language === 'sw' ? 'Jinsi ShambaSoil Inavyofanya Kazi' : 'How ShambaSoil Works in 4 Steps'}
              </h2>
              <p className="text-stone-600 text-sm mt-1">
                {language === 'sw' ? 'Imeundwa kwa ajili ya simu za wakulima nchini Kenya.' : 'Designed for smartphones across rural and peri-urban Kenya.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center mb-4">
                    1
                  </div>
                  <h3 className="font-bold text-stone-900 text-base mb-2">
                    {language === 'sw' ? 'Piga Picha ya Udongo' : 'Capture Soil Photo'}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {language === 'sw'
                      ? 'Piga picha safi mchana ya uso wa udongo au shimo dogo shambani mwako.'
                      : 'Capture a clear, well-lit photo of the field surface or soil profile using your phone.'}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center mb-4">
                    2
                  </div>
                  <h3 className="font-bold text-stone-900 text-base mb-2">
                    {language === 'sw' ? 'Eleza Shamba Lako' : 'Field Observations'}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {language === 'sw'
                      ? 'Jibu maswali mepesi kuhusu umbile la udongo (mfano tifutifu, udongo mfinyanzi), mifereji ya maji, na zao unalotaka kupanda.'
                      : 'Answer quick questions on texture feel, drainage, previous crop, and what you plan to plant.'}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center mb-4">
                    3
                  </div>
                  <h3 className="font-bold text-stone-900 text-base mb-2">
                    {language === 'sw' ? 'Pata Mwongozo wa Kilimo' : 'Agricultural Guidance'}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {language === 'sw'
                      ? 'Pokea uchunguzi wa kimuundo, vihatarishi vya asidi au maji kusimama, na hatua za kurekebisha udongo.'
                      : 'Get structured visual indicators, acidity or waterlogging risks, and actionable soil actions.'}
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white font-bold flex items-center justify-center mb-4">
                    4
                  </div>
                  <h3 className="font-bold text-stone-900 text-base mb-2">
                    {language === 'sw' ? 'Linganisha na Maabara' : 'Integrate Lab Tests'}
                  </h3>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    {language === 'sw'
                      ? 'Ukiwahi kupima udongo wako kwenye maabara iliyoidhinishwa, weka matokeo ili kupata uwiano halisi wa mbolea.'
                      : 'Whenever you test with an accredited soil laboratory, enter your results for precise mineral calculations.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-3">
              <Sprout className="w-8 h-8 text-emerald-700" />
              <h4 className="font-bold text-lg text-stone-900 font-display">
                {language === 'sw' ? 'Miongozo ya Mazao ya Kenya' : 'Kenyan Crop Intelligence'}
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed">
                {language === 'sw'
                  ? 'Katalogi kamili ya Mahindi, Maharage, Nyanya, Sukuma Wiki, Viazi Mviringo, Kitunguu, Parachichi na Ndengu kulingana na kaunti yako.'
                  : 'Grounded in KALRO and FAO agronomic guidelines for staple, legume, and horticulture crops.'}
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-3">
              <Layers className="w-8 h-8 text-amber-700" />
              <h4 className="font-bold text-lg text-stone-900 font-display">
                {language === 'sw' ? 'Inafanya Kazi Nje ya Mtandao' : 'Works Offline on Farm'}
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed">
                {language === 'sw'
                  ? 'Hifadhi kumbukumbu za shamba hata ukiwa maeneo yasiyo na mtandao thabiti; inasawazisha mara tu unaporudi mtandaoni.'
                  : 'Record farm observations and journal entries offline in the field; syncs seamlessly upon reconnection.'}
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-stone-200 space-y-3">
              <ShieldCheck className="w-8 h-8 text-blue-700" />
              <h4 className="font-bold text-lg text-stone-900 font-display">
                {language === 'sw' ? 'Hakuna Uongo au Namba Feki' : 'No Simulated Values'}
              </h4>
              <p className="text-stone-600 text-sm leading-relaxed">
                {language === 'sw'
                  ? 'Hatutawahi kukudanganya kwa kubuni pH au namba za mbolea kutoka kwenye picha tu. Usalama wa kilimo ndio msingi wetu.'
                  : 'We strictly never invent chemical pH, nitrogen, or phosphorus metrics from photography alone.'}
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="px-6 py-14 bg-emerald-900 text-white text-center">
          <div className="max-w-3xl mx-auto space-y-5">
            <h3 className="text-2xl sm:text-3xl font-bold font-display">
              {language === 'sw' ? 'Uko Tayari Kuelewa Udongo Wako?' : 'Ready to Understand Your Soil?'}
            </h3>
            <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">
              {language === 'sw'
                ? 'Jiunge na wakulima wenzako nchini Kenya wanaofanya maamuzi sahihi ya mbolea na mazao.'
                : 'Create your farmer account in less than a minute. Works across all 47 Kenyan counties.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                id="cta-register-btn"
                onClick={onGetStarted}
                className="w-full sm:w-auto px-7 py-3.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-2"
              >
                <span>{language === 'sw' ? 'Sajili Akaunti Bure' : 'Create Free Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="cta-signin-btn"
                onClick={onSignIn}
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-800 hover:bg-emerald-700 text-white font-semibold rounded-2xl border border-emerald-600 transition-colors text-sm"
              >
                {language === 'sw' ? 'Ingia Kwenye Akaunti' : 'Sign In to Account'}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-8 px-6 border-t border-stone-800 text-xs sm:text-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-white text-base font-display">
              Shamba<span className="text-emerald-400">Soil</span>
            </span>
            <p className="text-xs text-stone-500 mt-0.5">
              Agricultural Soil Intelligence for Kenyan Farmers
            </p>
          </div>
          <div className="text-center sm:text-right text-stone-500 text-xs">
            <p>© {new Date().getFullYear()} ShambaSoil. All rights reserved.</p>
            <p className="text-[11px] text-stone-600">
              Guidance adheres to KALRO, Kenya Soil Survey, and FAO agro-ecological practices.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
