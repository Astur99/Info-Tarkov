import { useCallback, useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';

const panelStyle = {
  padding: '1.4rem',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.08)',
  fontFamily: "'Rajdhani', sans-serif"
};

const statValueStyle = {
  color: 'var(--tk-green)',
  fontSize: '2rem',
  fontWeight: '900',
  margin: '0.25rem 0 0 0'
};

const actionButtonStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff',
  borderRadius: '8px',
  padding: '0.45rem 0.65rem',
  cursor: 'pointer',
  fontWeight: '900',
  whiteSpace: 'nowrap'
};

const OWNER_EMAIL = 'juancarfele@gmail.com';

const feedbackTypeLabels = {
  bug: 'Bug',
  suggestion: 'Sugerencia',
  other: 'Otro'
};

const feedbackStatusLabels = {
  open: 'Abierto',
  reviewing: 'En revisión',
  closed: 'Cerrado'
};

const feedbackStatusActions = {
  open: 'Marcar abierto',
  reviewing: 'Pasar a revisión',
  closed: 'Cerrar ticket'
};

const feedbackStatusStyles = {
  open: {
    color: 'var(--tk-green)',
    border: 'rgba(26,176,21,0.35)',
    background: 'rgba(26,176,21,0.08)'
  },
  reviewing: {
    color: '#ffcf66',
    border: 'rgba(255,207,102,0.35)',
    background: 'rgba(255,207,102,0.08)'
  },
  closed: {
    color: '#9ca3af',
    border: 'rgba(156,163,175,0.28)',
    background: 'rgba(156,163,175,0.08)'
  }
};

const replyAuthorLabels = {
  user: 'Usuario',
  admin: 'Astur'
};

const getAdminDisplayUsername = (user) =>
  user.username ||
  user.tarkov_username ||
  user.auth_username ||
  user.auth_tarkov_username ||
  null;

const isRecentlyOnline = (lastSeen) => {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < 120000;
};

const getUserProfileStatus = (user) =>
  user.username || user.tarkov_username || user.auth_username || user.auth_tarkov_username ? 'complete' : 'pending';

const getTicketButtonStyle = ({ color, border, background, active = false, danger = false, disabled = false }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.35rem',
  background: active ? background : 'rgba(255,255,255,0.045)',
  border: `1px solid ${active ? border : 'rgba(255,255,255,0.09)'}`,
  color: danger ? '#ff6b6b' : color,
  borderRadius: '8px',
  padding: '0.5rem 0.7rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontWeight: '900',
  whiteSpace: 'nowrap',
  opacity: disabled ? 0.48 : 1,
  fontFamily: "'Rajdhani', sans-serif"
});

export default function AdminPanel({ onViewChange, onNotificationsChanged }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserProgress, setSelectedUserProgress] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const feedbackTypeLabel = (type) => t(`admin.feedback.types.${type}`, { defaultValue: feedbackTypeLabels[type] || type });
  const feedbackStatusLabel = (status) => t(`admin.feedback.status.${status}`, { defaultValue: feedbackStatusLabels[status] || status });
  const feedbackStatusAction = (status) => t(`admin.feedback.statusActions.${status}`, { defaultValue: feedbackStatusActions[status] || status });

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setMessage('');

    const [
      { data: statsData, error: statsError },
      { data: usersData, error: usersError },
      { data: feedbackData, error: feedbackError }
    ] = await Promise.all([
      supabase.rpc('get_admin_app_stats'),
      supabase.rpc('list_admin_users'),
      supabase.rpc('list_admin_feedback')
    ]);

    setLoading(false);

    if (statsError || usersError || feedbackError) {
      console.error(statsError || usersError || feedbackError);
      setMessage(t('admin.messages.loadError'));
      return;
    }

    setStats(Array.isArray(statsData) ? statsData[0] : statsData);
    setUsers(usersData || []);
    setFeedback(feedbackData || []);
  }, [t]);

  const onlineUsers = useMemo(
    () => users.filter((user) => isRecentlyOnline(user.last_seen)).length,
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      const username = (getAdminDisplayUsername(user) || '').toLowerCase();
      const email = String(user.email || '').toLowerCase();
      const role = user.role || 'user';
      const matchesQuery = !query || username.includes(query) || email.includes(query);
      const matchesRole = roleFilter === 'all' || role === roleFilter;
      const matchesActivity =
        activityFilter === 'all' ||
        (activityFilter === 'online' && isRecentlyOnline(user.last_seen)) ||
        (activityFilter === 'offline' && !isRecentlyOnline(user.last_seen));

      return matchesQuery && matchesRole && matchesActivity;
    });
  }, [activityFilter, roleFilter, searchQuery, users]);

  const openUserDetail = async (user) => {
    setSelectedUser(user);
    setSelectedUserProgress(null);
    setDetailLoading(true);

    const { data, error } = await supabase.rpc('admin_get_user_progress', {
      target_user_id: user.user_id
    });

    setDetailLoading(false);

    if (error) {
      console.error(error);
      setSelectedUserProgress({
        module_states: [],
        quest_progress: [],
        error: t('admin.messages.progressLoadError', { error: error.message || t('admin.messages.rpcUnavailable') })
      });
      return;
    }

    setSelectedUserProgress(data || {});
  };

  useEffect(() => {
    const initialLoad = window.setTimeout(loadAdminData, 0);

    const interval = window.setInterval(() => {
      loadAdminData();
    }, 15000);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadAdminData]);

  const handleRoleChange = async (user, nextRole) => {
    const confirmed = window.confirm(t('admin.prompts.roleChange', { email: user.email, role: nextRole }));
    if (!confirmed) return;

    const { error } = await supabase.rpc('admin_set_user_role', {
      target_user_id: user.user_id,
      target_role: nextRole
    });

    if (error) {
      console.error(error);
      setMessage(t('admin.messages.roleError'));
      return;
    }

    setMessage(t('admin.messages.roleUpdated'));
    loadAdminData();
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      t('admin.prompts.deleteUser', { email: user.email })
    );
    if (!confirmed) return;

    const secondConfirm = window.prompt(t('admin.prompts.typeDelete'));
    if (secondConfirm !== 'BORRAR') {
      setMessage(t('admin.messages.deleteCancelled'));
      return;
    }

    const { error } = await supabase.rpc('admin_delete_user', {
      target_user_id: user.user_id
    });

    if (error) {
      console.error(error);
      setMessage(t('admin.messages.deleteError'));
      return;
    }

    setMessage(t('admin.messages.deleteSuccess'));
    loadAdminData();
  };

  const handleSendMessage = async (user) => {
    const subject = window.prompt(t('admin.prompts.messageSubject'));
    if (!subject) return;

    const body = window.prompt(t('admin.prompts.messageBody'));
    if (!body) return;

    const { error } = await supabase.rpc('admin_send_user_message', {
      target_user_id: user.user_id,
      message_subject: subject,
      message_body: body
    });

    if (error) {
      console.error(error);
      setMessage(t('admin.messages.sendMessageError', { error: error.message }));
      return;
    }

    setMessage(t('admin.messages.messageSent'));
  };

  const handleFeedbackStatusChange = async (feedbackItem, nextStatus) => {
    const { error } = await supabase.rpc('admin_update_feedback_status', {
      feedback_id: feedbackItem.id,
      next_status: nextStatus
    });

    if (error) {
      console.error(error);
      setMessage(t('admin.messages.feedbackUpdateError', { error: error.message }));
      return;
    }

    setMessage(t('admin.messages.feedbackUpdated'));
    loadAdminData();
    onNotificationsChanged?.();
  };

  const handleReplyFeedback = async (feedbackItem) => {
    const body = window.prompt(t('admin.prompts.replyBody'));
    if (!body) return;

    const { error } = await supabase.rpc('admin_reply_feedback', {
      feedback_id: feedbackItem.id,
      reply_body: body
    });

    if (error) {
      console.error(error);
      setMessage(t('admin.messages.feedbackReplyError', { error: error.message }));
      return;
    }

    setMessage(t('admin.messages.replySent'));
    loadAdminData();
    onNotificationsChanged?.();
  };

  const handleDeleteFeedback = async (feedbackItem) => {
    const confirmed = window.confirm(
      t('admin.prompts.deleteTicket', { subject: feedbackItem.subject })
    );

    if (!confirmed) return;

    const { error } = await supabase.rpc('admin_delete_feedback', {
      feedback_id: feedbackItem.id
    });

    if (error) {
      console.error(error);
      setMessage(t('admin.messages.feedbackDeleteError', { error: error.message }));
      return;
    }

    setMessage(t('admin.messages.feedbackDeleted'));
    loadAdminData();
    onNotificationsChanged?.();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0c',
        padding: '6rem 2rem',
        fontFamily: "'Rajdhani', sans-serif"
      }}
    >
      <button
        type="button"
        onClick={() => onViewChange('home')}
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.5rem',
          zIndex: 10,
          background: 'transparent',
          border: 'none',
          color: 'var(--tk-green)',
          fontSize: '1rem',
          cursor: 'pointer',
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: '700',
          letterSpacing: '1px'
        }}
      >
        {t('common.backToTerminal')}
      </button>

      <main style={{ width: 'min(1100px, 100%)', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '2.4rem' }}>{t('admin.title')}</h1>
          <p style={{ color: 'var(--tk-text-muted)', marginTop: '0.45rem' }}>
            {t('admin.subtitle')}
          </p>
        </header>

        {loading && <p style={{ color: 'var(--tk-green)' }}>{t('admin.loading')}</p>}
        {message && <p style={{ color: '#ffcf66' }}>{message}</p>}

        {stats && (
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}
          >
            <article style={panelStyle}>
              <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800' }}>{t('admin.stats.totalVisits')}</span>
              <p style={statValueStyle}>{stats.total_visits ?? 0}</p>
            </article>

            <article style={panelStyle}>
              <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800' }}>{t('admin.stats.todayVisits')}</span>
              <p style={statValueStyle}>{stats.today_visits ?? 0}</p>
            </article>

            <article style={panelStyle}>
              <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800' }}>{t('admin.stats.registeredUsers')}</span>
              <p style={statValueStyle}>{stats.registered_users ?? 0}</p>
            </article>

            <article style={panelStyle}>
              <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800' }}>{t('admin.stats.onlineUsers')}</span>
              <p style={statValueStyle}>{onlineUsers}</p>
              <span style={{ color: 'var(--tk-text-muted)', fontSize: '0.78rem', fontWeight: '800' }}>
                {t('admin.stats.onlineWindow')}
              </span>
            </article>
          </section>
        )}

        <section style={panelStyle}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}
          >
            <h2 style={{ color: '#fff', margin: 0 }}>{t('admin.users.title')}</h2>

            <button
              type="button"
              onClick={loadAdminData}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--tk-green)',
                borderRadius: '8px',
                padding: '0.55rem 0.8rem',
                cursor: 'pointer',
                fontWeight: '900'
              }}
            >
              {t('admin.actions.refresh')}
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(220px, 1fr) 150px 170px',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}
          >
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t('admin.users.searchPlaceholder')}
              style={{
                background: '#111214',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#fff',
                padding: '0.65rem 0.8rem',
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: '800'
              }}
            />
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              style={{
                background: '#111214',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#fff',
                padding: '0.65rem 0.8rem',
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: '800'
              }}
            >
              <option value="all">{t('admin.filters.allRoles')}</option>
              <option value="admin">{t('admin.roles.admin')}</option>
              <option value="user">{t('admin.roles.user')}</option>
            </select>
            <select
              value={activityFilter}
              onChange={(event) => setActivityFilter(event.target.value)}
              style={{
                background: '#111214',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#fff',
                padding: '0.65rem 0.8rem',
                fontFamily: "'Rajdhani', sans-serif",
                fontWeight: '800'
              }}
            >
              <option value="all">{t('admin.filters.allActivity')}</option>
              <option value="online">{t('admin.filters.online')}</option>
              <option value="offline">{t('admin.filters.offline')}</option>
            </select>
          </div>

          <p style={{ color: 'var(--tk-text-muted)', margin: '0 0 0.75rem', fontWeight: '800' }}>
            {t('admin.users.showing', { filtered: filteredUsers.length, total: users.length })}
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
              <thead>
                <tr style={{ color: 'var(--tk-text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{t('admin.users.columns.username')}</th>
                  <th style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{t('admin.users.columns.email')}</th>
                  <th style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{t('admin.users.columns.role')}</th>
                  <th style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{t('admin.users.columns.registered')}</th>
                  <th style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{t('admin.users.columns.lastActivity')}</th>
                  <th style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{t('admin.users.columns.actions')}</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {getAdminDisplayUsername(user) || t('admin.users.unconfigured')}
                    </td>
                    <td style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)', color: user.role === 'admin' ? 'var(--tk-green)' : '#fff' }}>
                      {t(`admin.roles.${user.role || 'user'}`)}
                    </td>
                    <td style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {user.last_seen ? new Date(user.last_seen).toLocaleString() : '-'}
                      {isRecentlyOnline(user.last_seen) && (
                        <span style={{ color: 'var(--tk-green)', marginLeft: '0.45rem', fontWeight: '900' }}>{t('admin.users.onlineBadge')}</span>
                      )}
                    </td>
                    <td style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {user.email === OWNER_EMAIL ? (
                        <span
                          style={{
                            display: 'inline-block',
                            color: '#ffcf66',
                            border: '1px solid rgba(255,207,102,0.35)',
                            borderRadius: '8px',
                            padding: '0.45rem 0.65rem',
                            fontWeight: '900',
                            letterSpacing: '1px'
                          }}
                        >
                          {t('admin.roles.owner')}
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => openUserDetail(user)}
                            style={actionButtonStyle}
                          >
                            {t('admin.actions.detail')}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRoleChange(user, user.role === 'admin' ? 'user' : 'admin')}
                            style={{
                              ...actionButtonStyle,
                              color: user.role === 'admin' ? '#ffcf66' : 'var(--tk-green)'
                            }}
                          >
                            {user.role === 'admin' ? t('admin.actions.removeAdmin') : t('admin.actions.makeAdmin')}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendMessage(user)}
                            style={actionButtonStyle}
                          >
                            {t('admin.actions.message')}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            style={{
                              ...actionButtonStyle,
                              color: '#ff6b6b',
                              borderColor: 'rgba(255,107,107,0.35)'
                            }}
                          >
                            {t('common.delete')}
                          </button>
                        </div>
                      )}
                      {user.email === OWNER_EMAIL && (
                        <button
                          type="button"
                          onClick={() => openUserDetail(user)}
                          style={{ ...actionButtonStyle, marginLeft: '0.45rem' }}
                        >
                          {t('admin.actions.detail')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ ...panelStyle, marginTop: '1.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}
          >
            <h2 style={{ color: '#fff', margin: 0 }}>{t('admin.feedback.title')}</h2>

            <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800' }}>
              {t('admin.feedback.ticketCount', { count: feedback.length })}
            </span>
          </div>

          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {feedback.length === 0 && (
              <p style={{ color: 'var(--tk-text-muted)', margin: 0 }}>
                {t('admin.feedback.empty')}
              </p>
            )}

            {feedback.map((item) => {
              const replies = [...(item.replies || [])].sort(
                (a, b) => new Date(a.created_at) - new Date(b.created_at)
              );

              return (
                <article
                key={item.id}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.035)',
                  border: '1px solid rgba(255,255,255,0.07)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    alignItems: 'flex-start'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                      <span style={{ color: 'var(--tk-green)', fontWeight: '900', textTransform: 'uppercase' }}>
                        {feedbackTypeLabel(item.type)}
                      </span>
                      <span style={{ color: '#ffcf66', fontWeight: '900', textTransform: 'uppercase' }}>
                        {feedbackStatusLabel(item.status)}
                      </span>
                    </div>

                    <h3 style={{ color: '#fff', margin: '0 0 0.35rem 0' }}>{item.subject}</h3>

                    <p style={{ color: 'var(--tk-text-muted)', margin: '0 0 0.7rem 0' }}>
                      {item.username || t('admin.feedback.noUser')} · {item.email || t('admin.feedback.noEmail')} ·{' '}
                      {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}
                    </p>

                    <p style={{ color: '#fff', whiteSpace: 'pre-wrap', lineHeight: 1.5, margin: 0 }}>
                      {item.body}
                    </p>

                    {replies.length > 0 && (
                      <div style={{ display: 'grid', gap: '0.55rem', marginTop: '0.9rem' }}>
                        {replies.map((reply) => (
                          <div
                            key={reply.id}
                            style={{
                              padding: '0.75rem',
                              borderRadius: '8px',
                              background: reply.author_role === 'admin'
                                ? 'rgba(26,176,21,0.07)'
                                : 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.06)'
                            }}
                          >
                            <strong style={{ color: reply.author_role === 'admin' ? 'var(--tk-green)' : '#fff' }}>
                              {replyAuthorLabels[reply.author_role] || reply.author_role}
                            </strong>
                            <span style={{ color: 'var(--tk-text-muted)', marginLeft: '0.5rem' }}>
                              {reply.created_at ? new Date(reply.created_at).toLocaleString() : '-'}
                            </span>
                            <p style={{ color: '#fff', whiteSpace: 'pre-wrap', margin: '0.4rem 0 0 0' }}>
                              {reply.body}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gap: '0.5rem', minWidth: '260px' }}>
                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {['open', 'reviewing', 'closed'].map((status) => {
                        const isActive = item.status === status;
                        const statusStyle = feedbackStatusStyles[status];

                        return (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleFeedbackStatusChange(item, status)}
                            disabled={isActive}
                            title={isActive ? t('admin.feedback.currentStatus', { status: feedbackStatusLabel(status) }) : feedbackStatusAction(status)}
                            style={getTicketButtonStyle({
                              ...statusStyle,
                              active: isActive,
                              disabled: isActive
                            })}
                          >
                            <span>{isActive ? '●' : '○'}</span>
                            {isActive ? feedbackStatusLabel(status) : feedbackStatusAction(status)}
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleReplyFeedback(item)}
                        disabled={item.status === 'closed'}
                        title={item.status === 'closed' ? t('admin.feedback.closedReplyTitle') : t('admin.feedback.replyTitle')}
                        style={getTicketButtonStyle({
                          color: 'var(--tk-green)',
                          border: 'rgba(26,176,21,0.35)',
                          background: 'rgba(26,176,21,0.08)',
                          disabled: item.status === 'closed'
                        })}
                      >
                        ↩ {t('admin.feedback.replyUser')}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteFeedback(item)}
                        title={t('admin.feedback.deleteForAllTitle')}
                        style={getTicketButtonStyle({
                          color: '#ff6b6b',
                          border: 'rgba(255,107,107,0.35)',
                          background: 'rgba(255,107,107,0.08)',
                          danger: true
                        })}
                      >
                        ✕ {t('admin.feedback.deleteForAll')}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        </section>

        {selectedUser && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 5000,
              background: 'rgba(0,0,0,0.72)',
              display: 'grid',
              placeItems: 'center',
              padding: '1.5rem'
            }}
          >
            <section
              style={{
                width: 'min(780px, 100%)',
                maxHeight: '86vh',
                overflow: 'auto',
                ...panelStyle,
                background: '#111214'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ color: 'var(--tk-green)', margin: 0, fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {t('admin.detail.title')}
                  </p>
                  <h2 style={{ color: '#fff', margin: '0.25rem 0 0' }}>{getAdminDisplayUsername(selectedUser) || t('admin.users.unconfigured')}</h2>
                  <p style={{ color: 'var(--tk-text-muted)', margin: '0.35rem 0 0' }}>{selectedUser.email}</p>
                </div>

                <button type="button" onClick={() => setSelectedUser(null)} style={actionButtonStyle}>
                  {t('common.close')}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                <DetailStat label={t('admin.detail.role')} value={t(`admin.roles.${selectedUser.role || 'user'}`)} />
                <DetailStat label={t('admin.detail.profile')} value={t(`admin.detail.profileStatus.${getUserProfileStatus(selectedUser)}`)} />
                <DetailStat label={t('admin.detail.status')} value={isRecentlyOnline(selectedUser.last_seen) ? t('admin.filters.online') : t('admin.filters.offline')} />
                <DetailStat label={t('admin.detail.lastActivity')} value={selectedUser.last_seen ? new Date(selectedUser.last_seen).toLocaleString() : '-'} />
              </div>

              {detailLoading && <p style={{ color: 'var(--tk-green)' }}>{t('admin.detail.loadingProgress')}</p>}

              {selectedUserProgress?.error && (
                <p style={{ color: '#ffcf66', fontWeight: '800' }}>{selectedUserProgress.error}</p>
              )}

              {!detailLoading && selectedUserProgress && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <h3 style={{ color: '#fff', margin: '0 0 0.65rem' }}>{t('admin.detail.cloudProgress')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.6rem' }}>
                      {(selectedUserProgress.module_states || []).length === 0 && (
                        <p style={{ color: 'var(--tk-text-muted)', margin: 0 }}>{t('admin.detail.noModuleStates')}</p>
                      )}
                      {(selectedUserProgress.module_states || []).map((state) => (
                        <DetailStat
                          key={`${state.module_key}-${state.mode}`}
                          label={`${state.module_key} / ${state.mode}`}
                          value={state.updated_at ? new Date(state.updated_at).toLocaleString() : t('admin.detail.saved')}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 style={{ color: '#fff', margin: '0 0 0.65rem' }}>{t('admin.detail.missions')}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.6rem' }}>
                      {(selectedUserProgress.quest_progress || []).length === 0 && (
                        <p style={{ color: 'var(--tk-text-muted)', margin: 0 }}>{t('admin.detail.noQuestProgress')}</p>
                      )}
                      {(selectedUserProgress.quest_progress || []).map((progress) => (
                        <DetailStat
                          key={progress.mode}
                          label={t('admin.detail.missionsMode', { mode: progress.mode })}
                          value={t('admin.detail.completedCount', { count: progress.completed_count || 0 })}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function DetailStat({ label, value }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '0.85rem' }}>
      <span style={{ color: 'var(--tk-text-muted)', display: 'block', fontWeight: '900', textTransform: 'uppercase' }}>{label}</span>
      <strong style={{ color: '#fff', display: 'block', marginTop: '0.25rem', overflowWrap: 'anywhere' }}>{value}</strong>
    </div>
  );
}
