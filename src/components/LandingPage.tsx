import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, Zap, Shield, Waves, ChevronRight, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrollY > 50 ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center">
                <Brain className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <span className="text-xl lg:text-2xl font-semibold text-slate-900">AURA</span>
            </div>

            <button
              onClick={onGetStarted}
              className="px-4 lg:px-6 py-2 lg:py-2.5 bg-slate-900 text-white rounded-full text-sm lg:text-base font-medium hover:bg-slate-800 transition-all duration-200 hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 lg:pt-32 pb-16 lg:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />

        <div className={`max-w-7xl mx-auto relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center max-w-4xl mx-auto space-y-6 lg:space-y-8">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-100 rounded-full text-sm text-slate-700">
              <Sparkles className="w-4 h-4" />
              <span>Introducing the future of AI assistance</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
              Your Universal
              <br />
              <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                Reasoning Agent
              </span>
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              AURA transforms how you interact with AI. Seamlessly manage tasks, analyze documents, and accomplish more with intelligent assistance.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onGetStarted}
                className="group w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-full text-base lg:text-lg font-medium hover:bg-slate-800 transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span>Start Using AURA</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-full text-base lg:text-lg font-medium border-2 border-slate-200 hover:border-slate-300 transition-all duration-200">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="mt-12 lg:mt-20 relative">
            <div className="relative mx-auto max-w-5xl">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 to-slate-700/20 blur-3xl rounded-3xl" />
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50"
                style={{
                  transform: `translateY(${scrollY * 0.1}px)`,
                }}
              >
                <div className="p-4 lg:p-8 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>

                  <div className="space-y-3 lg:space-y-4">
                    <div className="bg-slate-800 rounded-2xl p-4 lg:p-6 text-slate-300 text-sm lg:text-base">
                      Hello! I'm AURA, your Universal Reasoning Agent. How can I help you today?
                    </div>

                    <div className="bg-blue-600 rounded-2xl p-4 lg:p-6 text-white ml-auto max-w-md text-sm lg:text-base">
                      Analyze this quarterly report and create a summary
                    </div>

                    <div className="bg-slate-800 rounded-2xl p-4 lg:p-6 text-slate-300 text-sm lg:text-base">
                      I've analyzed the report. Revenue increased 23% YoY with strong growth in...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 lg:mb-6">
              Intelligent by design
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto">
              Built with cutting-edge AI technology to understand, analyze, and assist you like never before.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Brain,
                title: 'Deep Reasoning',
                description: 'Advanced AI that understands context and provides thoughtful, nuanced responses to complex queries.'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Instant responses powered by state-of-the-art models optimized for speed and accuracy.'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your data is encrypted and protected with enterprise-grade security measures.'
              },
              {
                icon: Sparkles,
                title: 'Creative Generation',
                description: 'Generate images, content, and ideas that bring your vision to life effortlessly.'
              },
              {
                icon: Waves,
                title: 'Natural Conversation',
                description: 'Interact naturally with voice and text in a conversational interface that feels human.'
              },
              {
                icon: Sparkles,
                title: 'Smart Automation',
                description: 'Automate repetitive tasks and workflows to focus on what truly matters.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group p-6 lg:p-8 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-all duration-300 hover:scale-105 cursor-pointer"
                style={{
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 lg:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-semibold text-slate-900 mb-3 lg:mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-32 px-6 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 lg:mb-6">
            Ready to transform your workflow?
          </h2>
          <p className="text-lg lg:text-xl text-slate-300 mb-8 lg:mb-12">
            Join thousands of professionals using AURA to work smarter, not harder.
          </p>

          <button
            onClick={onGetStarted}
            className="group px-8 lg:px-10 py-4 lg:py-5 bg-white text-slate-900 rounded-full text-base lg:text-lg font-semibold hover:bg-slate-100 transition-all duration-200 inline-flex items-center space-x-2 hover:scale-105 shadow-2xl"
          >
            <span>Get Started for Free</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 lg:py-12 px-6 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">AURA</span>
            </div>

            <p className="text-sm text-slate-600">
              © 2025 AURA. Universal Reasoning Agent.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
