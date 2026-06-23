import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './index.css';

import { supabase } from './lib/supabaseClient';
import { buildProfileFromSessionMetadata, hydrateGameModePreference } from './lib/userProfilePreferences';
import LanguageSwitcher from './components/layout/LanguageSwitcher';
import { APP_VERSION } from './data/changelog';

import mapasImage from './assets/backgrounds/mapas.png';
import kappaCaseImage from './assets/backgrounds/kappa.png';
import finalesImage from './assets/backgrounds/finales.png';
import bossesImage from './assets/backgrounds/bosses.png';
import goonsImage from './assets/backgrounds/goons.png';
import fleaImage from './assets/backgrounds/flea.png';
import hideoutImage from './assets/backgrounds/hideout.png';
import simuladorImage from './assets/backgrounds/simulador.png';
import troubleshootingImage from './assets/backgrounds/troubleshooting.png';
import prestigeImage from './assets/backgrounds/prestigios.png';
import keysImage from './assets/backgrounds/llaves.png';
import pmcProfileImage from './assets/backgrounds/pmc.png';

const Auth = lazy(() => import('./components/auth/Auth'));
const AccountSettings = lazy(() => import('./components/auth/AccountSettings'));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));
const AboutView = lazy(() => import('./components/about/AboutView'));
const HowToUseView = lazy(() => import('./components/about/HowToUseView'));
const AsturView = lazy(() => import('./components/about/AsturView'));
const ChangelogView = lazy(() => import('./components/about/ChangelogView'));
const ProjectDossierView = lazy(() => import('./components/about/ProjectDossierView'));
const UserMessages = lazy(() => import('./components/communication/UserMessages'));
const MapsView = lazy(() => import('./modules/maps/MapsView'));
const KappaTree = lazy(() => import('./modules/kappa/KappaTree'));
const StoryDecisions = lazy(() => import('./modules/story/StoryDecisions'));
const BossesIntel = lazy(() => import('./modules/bosses/BossesIntel'));
const GoonsTracker = lazy(() => import('./modules/goons/GoonsTracker'));
const FleaTracker = lazy(() => import('./modules/flea/FleaTracker'));
const HideoutModule = lazy(() => import('./modules/hideout/HideoutModule'));
const ArmorSimulator = lazy(() => import('./modules/armor/ArmorSimulator'));
const PrestigeModule = lazy(() => import('./modules/prestige/PrestigeModule'));
const KeysModule = lazy(() => import('./modules/keys/KeysModule'));
const PmcProfileModule = lazy(() => import('./modules/pmc/PmcProfileModule'));
const TroubleshootingView = lazy(() => import('./modules/troubleshooting/TroubleshootingView'));
const ServerStatus = lazy(() => import('./modules/server-status/ServerStatus'));

const loadUserRole = async (session) => {
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data?.role || 'user';
};

const loadUserProfile = async (session) => {
  if (!session?.user?.id) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error(error);
    return buildProfileFromSessionMetadata(session);
  }

  return data || buildProfileFromSessionMetadata(session);
};

const getClientSessionId = () => {
  const storageKey = 'info_tarkov_client_session_id';
  const saved = localStorage.getItem(storageKey);

  if (saved) return saved;

  const nextId = crypto.randomUUID();
  localStorage.setItem(storageKey, nextId);
  return nextId;
};

const getViewFromUrl = () => {
  const view = new URLSearchParams(window.location.search).get('view');
  return view || 'home';
};

const getUrlForView = (view) => {
  if (view === 'home') return window.location.pathname;
  return `${window.location.pathname}?view=${encodeURIComponent(view)}`;
};

function LoadingTerminal() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#0a0a0c',
        color: '#fff',
        fontFamily: "'Rajdhani', sans-serif",
        letterSpacing: '2px'
      }}
    >
      INICIALIZANDO TERMINAL...
    </div>
  );
}

function LazyView({ children }) {
  return <Suspense fallback={<LoadingTerminal />}>{children}</Suspense>;
}

function NotificationBadge({ count }) {
  if (!count) return null;

  return (
    <span
      style={{
        position: 'absolute',
        top: '-8px',
        right: '-8px',
        minWidth: '18px',
        height: '18px',
        padding: '0 5px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '999px',
        background: '#ffcf66',
        color: '#111',
        border: '1px solid rgba(255,255,255,0.28)',
        fontSize: '0.72rem',
        fontWeight: '900',
        lineHeight: 1,
        boxShadow: '0 0 14px rgba(255,207,102,0.35)'
      }}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}

const getUserReportSeenKey = (userId) => `info_tarkov_report_seen_at_${userId}`;

const getTicketLastActivity = (ticket, repliesKey = 'replies') => {
  const replies = ticket?.[repliesKey] || [];
  const latestReply = replies.reduce((latest, reply) => {
    const replyTime = new Date(reply.created_at || 0).getTime();
    return replyTime > latest.time ? { time: replyTime, role: reply.author_role } : latest;
  }, { time: new Date(ticket?.created_at || 0).getTime(), role: 'user' });

  return latestReply;
};

function App() {
  const { t } = useTranslation();
  const [currentView, setCurrentView] = useState(getViewFromUrl);
  const currentViewRef = useRef(currentView);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminNotificationCount, setAdminNotificationCount] = useState(0);
  const [reportNotificationCount, setReportNotificationCount] = useState(0);
  const userId = session?.user?.id || null;

  const navigateToView = useCallback((nextView, options = {}) => {
    const targetView = nextView || 'home';
    const shouldReplace = options.replace ?? targetView === 'home';
    const nextUrl = getUrlForView(targetView);
    const currentStateView = window.history.state?.view || 'home';

    if (targetView !== currentStateView || window.location.search !== new URL(nextUrl, window.location.origin).search) {
      if (shouldReplace) {
        window.history.replaceState({ view: targetView }, '', nextUrl);
      } else {
        window.history.pushState({ view: targetView }, '', nextUrl);
      }
    }

    currentViewRef.current = targetView;
    setCurrentView(targetView);
  }, []);

  useEffect(() => {
    window.history.replaceState({ view: currentViewRef.current }, '', getUrlForView(currentViewRef.current));

    const handlePopState = (event) => {
      const nextView = event.state?.view || 'home';
      currentViewRef.current = nextView;
      setCurrentView(nextView);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const syncSessionData = async (nextSession) => {
      if (!nextSession) {
        setUserRole(null);
        setUserProfile(null);
        return;
      }

      const [role, profile] = await Promise.all([
        loadUserRole(nextSession),
        loadUserProfile(nextSession)
      ]);

      setUserRole(role);
      setUserProfile(profile);
      hydrateGameModePreference(profile, nextSession);
    };

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
      syncSessionData(data.session);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      window.setTimeout(() => {
        syncSessionData(session);
      }, 0);
      if (session) navigateToView('home');
    });

    return () => subscription.unsubscribe();
  }, [navigateToView]);

  useEffect(() => {
    const clientSessionId = getClientSessionId();

    const trackActivity = async (trackVisit = false) => {
      const userId = session?.user?.id || null;

      if (trackVisit) {
        supabase
          .from('app_visits')
          .insert({
            client_session_id: clientSessionId,
            user_id: userId
          })
          .then(({ error }) => {
            if (error) console.error(error);
          });
      }

      const { error } = await supabase
        .from('app_active_sessions')
        .upsert(
          {
            client_session_id: clientSessionId,
            user_id: userId,
            last_seen: new Date().toISOString()
          },
          { onConflict: 'client_session_id' }
        );

      if (error) console.error(error);
    };

    trackActivity(true);
    const interval = window.setInterval(() => trackActivity(false), 60000);

    return () => window.clearInterval(interval);
  }, [session?.user?.id]);

  const loadNotificationCounts = useCallback(async () => {
    if (!userId || !userRole) {
      setAdminNotificationCount(0);
      setReportNotificationCount(0);
      return;
    }

    if (userRole === 'admin') {
      const { data, error } = await supabase.rpc('list_admin_feedback');
      if (error) {
        console.error(error);
        setAdminNotificationCount(0);
        return;
      }

      const needsAdmin = (data || []).filter((ticket) => {
        if (ticket.status === 'closed') return false;
        const latest = getTicketLastActivity(ticket, 'replies');
        return latest.role !== 'admin';
      });

      setAdminNotificationCount(needsAdmin.length);
      setReportNotificationCount(0);
      return;
    }

    const seenAt = Number(localStorage.getItem(getUserReportSeenKey(userId)) || 0);
    const { data, error } = await supabase
      .from('user_feedback')
      .select('id, created_at, feedback_replies(id, author_role, created_at)')
      .is('user_deleted_at', null);

    if (error) {
      console.error(error);
      setReportNotificationCount(0);
      return;
    }

    const unreadAdminReplies = (data || []).reduce((count, ticket) => {
      const replies = ticket.feedback_replies || [];
      return count + replies.filter((reply) => (
        reply.author_role === 'admin' && new Date(reply.created_at).getTime() > seenAt
      )).length;
    }, 0);

    setReportNotificationCount(unreadAdminReplies);
    setAdminNotificationCount(0);
  }, [userId, userRole]);

  useEffect(() => {
    if (!userId || !userRole) return;

    const initialLoad = window.setTimeout(loadNotificationCounts, 0);
    const interval = window.setInterval(loadNotificationCounts, 45000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadNotificationCounts, userId, userRole]);

  const markReportsAsSeen = useCallback(() => {
    if (!userId) return;
    localStorage.setItem(getUserReportSeenKey(userId), String(Date.now()));
    setReportNotificationCount(0);
  }, [userId]);

  const navigateAndRefreshNotifications = useCallback((view) => {
    navigateToView(view);
    window.setTimeout(loadNotificationCounts, 600);
  }, [loadNotificationCounts, navigateToView]);

  if (authLoading) {
    return <LoadingTerminal />;
  }

  if (currentView === 'auth') {
    return (
      <LazyView>
        <Auth onViewChange={navigateToView} />
      </LazyView>
    );
  }

  const handleMouseMoveGlobal = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const modules = [
    {
      id: 'maps',
      title: t('home.modules.maps.title'),
      desc: t('home.modules.maps.desc'),
      bgImage: mapasImage,
      imagePosition: { right: '-70px', bottom: '-35px', width: '270px', maxWidth: '64%' }
    },
    {
      id: 'kappa',
      title: t('home.modules.kappa.title'),
      desc: t('home.modules.kappa.desc'),
      bgImage: kappaCaseImage,
      imagePosition: { right: '-50px', bottom: '-30px', width: '270px', maxWidth: '68%' }
    },
    {
      id: 'story',
      title: t('home.modules.story.title'),
      desc: t('home.modules.story.desc'),
      bgImage: finalesImage,
      imagePosition: { right: '-65px', bottom: '-15px', width: '260px', maxWidth: '65%' }
    },
    {
      id: 'bosses',
      title: t('home.modules.bosses.title'),
      desc: t('home.modules.bosses.desc'),
      bgImage: bossesImage,
      imagePosition: { right: '-40px', bottom: '-20px', width: '235px', maxWidth: '58%' }
    },
    {
      id: 'goons',
      title: t('home.modules.goons.title'),
      desc: t('home.modules.goons.desc'),
      bgImage: goonsImage,
      imagePosition: { right: '-10px', bottom: '-20px', width: '250px', maxWidth: '78%' }
    },
    {
      id: 'flea',
      title: t('home.modules.flea.title'),
      desc: t('home.modules.flea.desc'),
      bgImage: fleaImage,
      imagePosition: { right: '-15px', bottom: '5px', width: '150px', maxWidth: '55%' }
    },
    {
      id: 'hideout',
      title: t('home.modules.hideout.title'),
      desc: t('home.modules.hideout.desc'),
      bgImage: hideoutImage,
      imagePosition: { right: '-50px', bottom: '-20px', width: '480px', maxWidth: '52%' }
    },
    {
      id: 'simulador',
      title: t('home.modules.simulator.title'),
      desc: t('home.modules.simulator.desc'),
      bgImage: simuladorImage,
      imagePosition: { right: '-80px', bottom: '-30px', width: '280px', maxWidth: '76%' }
    },
    {
      id: 'prestige',
      title: t('home.modules.prestige.title'),
      desc: t('home.modules.prestige.desc'),
      bgImage: prestigeImage,
      imagePosition: { right: '-15px', bottom: '-15px', width: '160px', maxWidth: '62%' }
    },
    {
      id: 'keys',
      title: t('home.modules.keys.title'),
      desc: t('home.modules.keys.desc'),
      bgImage: keysImage,
      imagePosition: { right: '-30px', bottom: '0px', width: '200px', maxWidth: '62%' }
    },
    {
      id: 'pmc-profile',
      title: t('home.modules.pmcProfile.title'),
      desc: t('home.modules.pmcProfile.desc'),
      bgImage: pmcProfileImage,
      imagePosition: { right: '-10px', bottom: '-100px', width: '180px', maxWidth: '58%' }
    },
    {
      id: 'trouble',
      title: t('home.modules.trouble.title'),
      desc: t('home.modules.trouble.desc'),
      bgImage: troubleshootingImage,
      imagePosition: { right: '-5px', bottom: '0px', width: '130px', maxWidth: '58%' }
    }
  ];

  if (currentView === 'account') {
    return (
      <LazyView>
        <AccountSettings
          onViewChange={navigateToView}
          session={session}
          userProfile={userProfile}
          userRole={userRole}
          onProfileUpdated={setUserProfile}
          onAccountDeleted={() => {
            setSession(null);
            setUserRole(null);
            setUserProfile(null);
          }}
        />
      </LazyView>
    );
  }

  if (currentView === 'admin') {
    return (
      <LazyView>
        <AdminPanel onViewChange={navigateToView} onNotificationsChanged={loadNotificationCounts} />
      </LazyView>
    );
  }

  if (currentView === 'messages') {
    return (
      <LazyView>
        <UserMessages onViewChange={navigateToView} onReportsSeen={markReportsAsSeen} onNotificationsChanged={loadNotificationCounts} />
      </LazyView>
    );
  }

  if (currentView === 'about') {
    return (
      <LazyView>
        <AboutView onViewChange={navigateToView} />
      </LazyView>
    );
  }

  if (currentView === 'how-to-use') {
    return (
      <LazyView>
        <HowToUseView onViewChange={navigateToView} />
      </LazyView>
    );
  }

  if (currentView === 'astur') {
    return (
      <LazyView>
        <AsturView onViewChange={navigateToView} />
      </LazyView>
    );
  }

  if (currentView === 'changelog') {
    return (
      <LazyView>
        <ChangelogView onViewChange={navigateToView} />
      </LazyView>
    );
  }

  if (currentView === 'project-dossier' && userRole === 'admin') {
    return (
      <LazyView>
        <ProjectDossierView onViewChange={navigateToView} />
      </LazyView>
    );
  }

  if (currentView === 'maps') return <LazyView><MapsView onViewChange={navigateToView} /></LazyView>;
  if (currentView === 'kappa') return <LazyView><KappaTree onViewChange={navigateToView} session={session} userRole={userRole} /></LazyView>;
  if (currentView === 'story') return <LazyView><StoryDecisions onViewChange={navigateToView} /></LazyView>;
  if (currentView === 'bosses') return <LazyView><BossesIntel onViewChange={navigateToView} /></LazyView>;
  if (currentView === 'goons') return <LazyView><GoonsTracker onViewChange={navigateToView} /></LazyView>;
  if (currentView === 'flea') return <LazyView><FleaTracker onViewChange={navigateToView} /></LazyView>;
  if (currentView === 'hideout') return <LazyView><HideoutModule onViewChange={navigateToView} session={session} /></LazyView>;
  if (currentView === 'simulador') return <LazyView><ArmorSimulator onViewChange={navigateToView} /></LazyView>;
  if (currentView === 'prestige') return <LazyView><PrestigeModule onViewChange={navigateToView} /></LazyView>;
  if (currentView === 'keys') return <LazyView><KeysModule onViewChange={navigateToView} /></LazyView>;
  if (currentView === 'quest-optimizer') return <LazyView><KappaTree onViewChange={navigateToView} session={session} userRole={userRole} initialTool="optimizer" /></LazyView>;
  if (currentView === 'pmc-profile') return <LazyView><PmcProfileModule onViewChange={navigateToView} session={session} userProfile={userProfile} /></LazyView>;
  if (currentView === 'trouble') return <LazyView><TroubleshootingView onViewChange={navigateToView} /></LazyView>;
  if (currentView === 'server-status') return <LazyView><ServerStatus onViewChange={navigateToView} /></LazyView>;

  return (
    <div
      className="viewport-wrapper"
      onMouseMove={handleMouseMoveGlobal}
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        backgroundImage: `radial-gradient(circle 1000px at ${mousePos.x}px ${mousePos.y}px, rgba(26, 176, 21, 0.018) 0%, rgba(10, 10, 12, 1) 100%)`,
        backgroundAttachment: 'fixed',
        backgroundColor: '#0a0a0c',
        transition: 'background-image 0.2s ease-out'
      }}
    >
      <button
        onClick={() => navigateToView('server-status')}
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.5rem',
          zIndex: 2000,
          backgroundColor: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px',
          color: 'var(--tk-text-muted)',
          padding: '0.55rem 0.85rem',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '0.75rem',
          fontWeight: '800',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          transition: 'all 0.25s ease'
        }}
      >
        {t('home.serverStatus')}
      </button>

      <LanguageSwitcher />

      {session && (
        <button
          onClick={() => navigateToView('account')}
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '10.5rem',
            zIndex: 2000,
            backgroundColor: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '8px',
            color: 'var(--tk-green)',
            padding: '0.55rem 0.85rem',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '0.75rem',
            fontWeight: '900',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            transition: 'all 0.25s ease'
          }}
        >
          {t('home.userButton', { username: userProfile?.username || t('home.configureUser') })}
        </button>
      )}

      {session && userRole !== 'admin' && (
        <button
          onClick={() => {
            markReportsAsSeen();
            navigateToView('messages');
          }}
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '19.5rem',
            zIndex: 2000,
          backgroundColor: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px',
          color: 'var(--tk-text-muted)',
            padding: '0.55rem 0.85rem',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '0.75rem',
            fontWeight: '900',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            transition: 'all 0.25s ease'
          }}
        >
          {t('home.report')}
          <NotificationBadge count={reportNotificationCount} />
        </button>
      )}

      {userRole === 'admin' && (
        <button
          onClick={() => navigateAndRefreshNotifications('admin')}
          style={{
            position: 'fixed',
            top: '1.5rem',
            right: '19.5rem',
            zIndex: 2000,
            backgroundColor: 'rgba(26,176,21,0.08)',
            border: '1px solid rgba(26,176,21,0.28)',
            borderRadius: '8px',
            color: 'var(--tk-green)',
            padding: '0.55rem 0.85rem',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '0.75rem',
            fontWeight: '900',
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            transition: 'all 0.25s ease'
          }}
        >
          {t('home.admin')}
          <NotificationBadge count={adminNotificationCount} />
        </button>
      )}

      <button
        onClick={async () => {
          if (session) {
            await supabase.auth.signOut();
            setUserRole(null);
            setUserProfile(null);
            navigateToView('home');
          } else {
            navigateToView('auth');
          }
        }}
        style={{
          position: 'fixed',
          top: '1.5rem',
          right: '1.5rem',
          zIndex: 2000,
          backgroundColor: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '8px',
          color: session ? 'var(--tk-green)' : 'var(--tk-text-muted)',
          padding: '0.55rem 0.85rem',
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '0.75rem',
          fontWeight: '800',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          transition: 'all 0.25s ease'
        }}
      >
        {session ? t('home.logout') : t('home.login')}
      </button>

      <div style={{ padding: '6rem 2rem 10rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <header className="fade-in-slide" style={{ marginBottom: '6rem', textAlign: 'center' }}>
          <TitleGlowPro />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '1.5rem' }}>
            <span
              style={{
                width: '7px',
                height: '7px',
                backgroundColor: session ? 'var(--tk-green)' : '#ffcf66',
                borderRadius: '50%',
                display: 'inline-block',
                boxShadow: session
                  ? '0 0 10px var(--tk-green)'
                  : '0 0 10px rgba(255,207,102,0.45)'
              }}
            />

            <p
              style={{
                color: 'var(--tk-text-muted)',
                fontSize: '0.85rem',
                letterSpacing: '2.5px',
                textTransform: 'uppercase',
                fontWeight: '600',
                fontFamily: "'Rajdhani', sans-serif"
              }}
            >
              {session
                ? `${t('home.sessionStarted')}${userRole === 'admin' ? t('home.adminSuffix') : ''}`
                : t('home.guestMode')}
            </p>
          </div>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {modules.map((mod, index) => (
            <ModuleCard key={mod.id} mod={mod} index={index} onViewChange={navigateToView} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => navigateToView('astur')}
          style={{
            position: 'fixed',
            bottom: '2.5rem',
            right: '2.5rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--tk-text-muted)',
            fontSize: '0.75rem',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            opacity: 0.5,
            textDecoration: 'none',
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: '700',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 1000,
            borderBottom: '1px solid transparent',
            padding: '0 0 2px',
            cursor: 'pointer'
          }}
        >
          BY ASTUR
        </button>

        <div
          style={{
            position: 'fixed',
            bottom: '3.85rem',
            left: '2.5rem',
            zIndex: 1000,
            display: 'flex',
            gap: '0.6rem',
            flexWrap: 'wrap'
          }}
        >
          {[
            { label: t('home.howToUse'), view: 'how-to-use' },
            { label: t('home.about'), view: 'about' },
            { label: t('home.patchNotes'), view: 'changelog' },
            ...(userRole === 'admin' ? [{ label: t('home.dossier'), view: 'project-dossier' }] : [])
          ].map((button) => (
            <button
              key={button.view}
              type="button"
              onClick={() => navigateToView(button.view)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '8px',
                color: 'var(--tk-text-muted)',
                padding: '0.55rem 0.85rem',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '0.75rem',
                fontWeight: '900',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = '#fff';
                event.currentTarget.style.borderColor = 'rgba(26,176,21,0.3)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = 'var(--tk-text-muted)';
                event.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)';
              }}
            >
              {button.label}
            </button>
          ))}
        </div>
        <div
          style={{
            position: 'fixed',
            bottom: '2.35rem',
            left: '2.5rem',
            zIndex: 1000,
            color: 'rgba(255,255,255,0.32)',
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: '0.72rem',
            fontWeight: '900',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            pointerEvents: 'none'
          }}
        >
          v{APP_VERSION}
        </div>
      </div>
    </div>
  );
}

function TitleGlowPro() {
  const [relPos, setRelPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMoveLocal = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRelPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      onMouseMove={handleMouseMoveLocal}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative', display: 'inline-block', padding: '20px 40px', zIndex: 1, cursor: 'default' }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle 180px at ${relPos.x}px ${relPos.y}px, rgba(26, 176, 21, 0.18) 0%, transparent 80%)`,
          pointerEvents: 'none',
          filter: 'blur(30px)',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 0
        }}
      />

      <h1
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '4.8rem',
          fontWeight: '800',
          letterSpacing: '4px',
          margin: 0,
          textTransform: 'uppercase',
          color: 'rgba(255, 255, 255, 0.08)'
        }}
      >
        Info Tarkov
      </h1>

      <h1
        style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: '4.8rem',
          fontWeight: '800',
          letterSpacing: '4px',
          margin: 0,
          textTransform: 'uppercase',
          position: 'absolute',
          top: '20px',
          left: '40px',
          width: 'calc(100% - 80px)',
          color: 'transparent',
          pointerEvents: 'none',
          backgroundImage: `radial-gradient(circle 150px at ${relPos.x}px ${relPos.y}px, rgba(255,255,255,0.95) 0%, rgba(26,176,21,0.5) 45%, transparent 85%)`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
          zIndex: 2
        }}
      >
        Info Tarkov
      </h1>
    </div>
  );
}

function ModuleCard({ mod, index, onViewChange }) {
  const [isHovered, setIsHovered] = useState(false);
  const delayClass = `delay-${(index % 7) + 1}`;
  const hasBgImage = Boolean(mod.bgImage);

  return (
    <div
      className={`fade-in-slide terminal-module-card ${delayClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewChange(mod.id)}
      style={{
        backgroundColor: 'var(--tk-glass)',
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
        border: `1px solid ${isHovered ? 'rgba(26, 176, 21, 0.4)' : 'var(--tk-glass-border)'}`,
        borderRadius: '8px',
        padding: '2.5rem 2.25rem',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '170px',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(26,176,21,0.05)'
          : '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      {hasBgImage && (
        <>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(5,5,6,0.96) 0%, rgba(5,5,6,0.82) 42%, rgba(5,5,6,0.28) 100%)',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 0
            }}
          />

          <img
            src={mod.bgImage}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: mod.imagePosition?.right ?? '-45px',
              bottom: mod.imagePosition?.bottom ?? '-25px',
              width: mod.imagePosition?.width ?? '300px',
              maxWidth: mod.imagePosition?.maxWidth ?? '68%',
              opacity: isHovered ? 0.88 : 0,
              transform: isHovered
                ? 'translateX(0) translateY(0) scale(1)'
                : 'translateX(28px) translateY(16px) scale(0.94)',
              filter: 'drop-shadow(0 0 30px rgba(255,190,40,0.16))',
              transition: 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />

          <div
            style={{
              position: 'absolute',
              right: '-120px',
              bottom: '-120px',
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(255,185,30,0.16) 0%, transparent 68%)',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 1s ease',
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        </>
      )}

      <div style={{ position: 'relative', zIndex: 3, maxWidth: hasBgImage ? '68%' : '100%' }}>
        <h3
          style={{
            color: isHovered ? '#fff' : '#bbb',
            fontFamily: "'Rajdhani', sans-serif",
            marginBottom: '0.75rem',
            fontSize: '1.15rem',
            fontWeight: '700',
            letterSpacing: '1.5px',
            transition: 'color 0.3s'
          }}
        >
          {mod.title}
        </h3>

        <p
          style={{
            color: isHovered ? 'rgba(255,255,255,0.85)' : 'var(--tk-text-muted)',
            fontSize: '0.88rem',
            lineHeight: '1.5',
            fontFamily: "'Rajdhani', sans-serif",
            transition: 'color 0.3s'
          }}
        >
          {mod.desc}
        </p>
      </div>
    </div>
  );
}

export default App;
