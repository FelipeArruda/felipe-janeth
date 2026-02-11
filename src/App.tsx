import { useEffect, useState } from 'react';
import Hero from './components/Hero';
import Story from './components/Story';
import Timeline from './components/Timeline';
import Travels from './components/Travels';
import Family from './components/Family';
import GiftRegistry from './components/GiftRegistry';
import RSVPAccess from './components/RSVPAccess';
import RSVP from './components/RSVP';
import SaveTheDate from './components/SaveTheDate';
import Footer from './components/Footer';
import Admin from './components/Admin';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string | null;
}

function App() {
  const [mode, setMode] = useState<'site' | 'admin'>(() =>
    window.location.hash === '#admin' ? 'admin' : 'site'
  );

  const [rsvpState, setRsvpState] = useState<{
    stage: 'landing' | 'access' | 'form';
    familyId?: string;
    familyName?: string;
    members?: FamilyMember[];
  }>({
    stage: 'landing',
  });

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [rsvpState.stage]);

  useEffect(() => {
    const handleHashChange = () => {
      setMode(window.location.hash === '#admin' ? 'admin' : 'site');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (mode === 'admin') {
    return (
      <Admin
        onExit={() => {
          window.location.hash = '';
          setMode('site');
        }}
      />
    );
  }

  const handleAccessGranted = (familyId: string, familyName: string, members: FamilyMember[]) => {
    setRsvpState({
      stage: 'form',
      familyId,
      familyName,
      members,
    });
  };

  const handleBack = () => {
    setRsvpState({ stage: 'landing' });
  };

  if (rsvpState.stage === 'form' && rsvpState.familyId && rsvpState.familyName && rsvpState.members) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50">
        <RSVP
          familyId={rsvpState.familyId}
          familyName={rsvpState.familyName}
          members={rsvpState.members}
          onBack={handleBack}
        />
        <Footer />
      </div>
    );
  }

  if (rsvpState.stage === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50">
        <Hero />
        <Story />
        <Timeline />
        <Travels />
        <Family />
        <GiftRegistry />
        <SaveTheDate onRSVPClick={() => setRsvpState({ stage: 'access' })} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-50">
      <RSVPAccess
        onAccessGranted={handleAccessGranted}
        onBack={handleBack}
      />
      <Footer />
    </div>
  );
}

export default App;
