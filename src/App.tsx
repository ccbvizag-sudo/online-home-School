import React, { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GurukulProvider } from './context/GurukulContext';
import { Navbar } from './components/Navbar';
import { HomeShowcase } from './components/HomeShowcase';
import { CourseCatalogLMS } from './components/CourseCatalogLMS';
import { AILearningAssistant } from './components/AILearningAssistant';
import { UniqueHubs } from './components/UniqueHubs';
import { AdminControlPanel, RolePortalsView } from './components/RolePortalsAndAdmin';
import { AgeGroup, AppSection, Course, UniqueHubId } from './types/gurukul';

function GurukulAppShell() {
  const [activeSection, setActiveSection] = useState<AppSection>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | 'All'>('All');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeHub, setActiveHub] = useState<UniqueHubId>('my-gurukul');
  const [aiTopic, setAiTopic] = useState<string>('');

  const handleOpenCourse = (course: Course) => {
    setActiveCourse(course);
    setActiveSection('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskAIAboutTopic = (topic: string) => {
    setAiTopic(topic);
    setActiveSection('ai-guru');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <Navbar activeSection={activeSection} onNavigate={setActiveSection} />

      <main>
        {activeSection === 'home' && (
          <HomeShowcase
            onNavigate={setActiveSection}
            onSelectCategory={(catId) => {
              setSelectedCategoryId(catId);
              setSelectedAgeGroup('All');
            }}
            onSelectAgeGroup={(age) => {
              setSelectedAgeGroup(age);
              setSelectedCategoryId('all');
            }}
            onOpenCourse={handleOpenCourse}
            onOpenHub={(hubId) => setActiveHub(hubId)}
          />
        )}

        {activeSection === 'catalog' && (
          <CourseCatalogLMS
            selectedCategoryId={selectedCategoryId}
            onChangeCategory={setSelectedCategoryId}
            selectedAgeGroup={selectedAgeGroup}
            onChangeAgeGroup={setSelectedAgeGroup}
            activeCourse={activeCourse}
            onSelectCourse={setActiveCourse}
            onAskAIAboutTopic={handleAskAIAboutTopic}
          />
        )}

        {activeSection === 'ai-guru' && <AILearningAssistant initialTopic={aiTopic} />}

        {activeSection === 'hubs' && (
          <UniqueHubs
            activeHub={activeHub}
            onSelectHub={setActiveHub}
            onAskAI={handleAskAIAboutTopic}
          />
        )}

        {activeSection === 'portals' && (
          <RolePortalsView
            onNavigate={setActiveSection}
            onOpenHub={(hubId) => setActiveHub(hubId)}
          />
        )}

        {activeSection === 'admin' && <AdminControlPanel />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <GurukulProvider>
        <GurukulAppShell />
      </GurukulProvider>
    </ErrorBoundary>
  );
}
