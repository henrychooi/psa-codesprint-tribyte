import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { TrendingUp, Briefcase, Award, ArrowRight, Activity } from 'lucide-react';
import { careerCompassAPI } from '../services/api';

function Home() {
  const router = useRouter();
  const [apiHealth, setApiHealth] = useState(false);

  // Check API health on mount
  useEffect(() => {
    checkAPIHealth();
  }, []);

  const checkAPIHealth = async () => {
    try {
      await careerCompassAPI.healthCheck();
      setApiHealth(true);
    } catch (err) {
      setApiHealth(false);
    }
  };

  return (
    <>
      <Head>
        <title>Career Compass - PSA International</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="AI-Powered Career Development Platform" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-psa-blue to-purple-700 text-white shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-10 h-10" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-1">Career Compass</h1>
                  <p className="text-purple-200 text-lg">AI-Powered Career Development Platform</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Activity className={`w-5 h-5 ${apiHealth ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-sm font-medium">
                  {apiHealth ? 'System Online' : 'System Offline'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Welcome Section */}
          <div className="text-center mb-16 fade-in">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to Career Compass
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering PSA employees with intelligent career insights, role matching, 
              and leadership potential assessment powered by cutting-edge AI technology.
            </p>
          </div>

          {/* Module Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {/* Career Matching Module */}
            <div 
              onClick={() => router.push('/career-matching')}
              className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') router.push('/career-matching');
              }}
            >
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Briefcase className="w-10 h-10" />
                  </div>
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  AI-Powered Role Matching
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  Career Narrative Generation
                </p>
              </div>
              
              <div className="p-8">
                <p className="text-gray-700 mb-6">
                  Discover your ideal career path with AI-powered role recommendations, 
                  skill gap analysis, and personalized career narratives.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Advanced embedding-based matching
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Comprehensive skill gap analysis
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      GPT-generated career narratives
                    </span>
                  </div>
                </div>

                <button className="w-full mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-semibold flex items-center justify-center space-x-2 group-hover:bg-blue-600">
                  <span>Explore Role Matching</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Leadership Potential Module */}
            <div 
              onClick={() => router.push('/leadership')}
              className="group bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-2"
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === 'Enter') router.push('/leadership');
              }}
            >
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Award className="w-10 h-10" />
                  </div>
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Leadership Potential
                </h3>
                <p className="text-purple-100 text-sm mb-4">
                  Explainable Scoring System
                </p>
              </div>
              
              <div className="p-8">
                <p className="text-gray-700 mb-6">
                  Transparent, evidence-based leadership assessment with component 
                  breakdowns, percentile rankings, and actionable improvement suggestions.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      4-component scoring model
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Full transparency and evidence linking
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Feedback mechanism for continuous improvement
                    </span>
                  </div>
                </div>

                <button className="w-full mt-6 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition font-semibold flex items-center justify-center space-x-2 group-hover:bg-purple-600">
                  <span>Assess Leadership Potential</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-8">
              Why Career Compass?
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-bold text-lg mb-2">AI-Powered Insights</h4>
                <p className="text-gray-600 text-sm">
                  Leverage advanced machine learning and embeddings for accurate, personalized recommendations
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="font-bold text-lg mb-2">Transparent & Explainable</h4>
                <p className="text-gray-600 text-sm">
                  Every score and recommendation is backed by clear evidence and methodology
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="font-bold text-lg mb-2">Actionable Development</h4>
                <p className="text-gray-600 text-sm">
                  Get specific, practical suggestions for skill development and career growth
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                <strong>Career Compass</strong> - Empowering Career Development at PSA International
              </p>
              <p className="text-gray-500 text-sm">
                © 2025 PSA International. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default Home;
