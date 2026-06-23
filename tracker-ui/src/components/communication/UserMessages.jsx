import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';

const panelStyle = {
  padding: '1.4rem',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.08)',
  fontFamily: "'Rajdhani', sans-serif"
};

const actionButtonStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#fff',
  borderRadius: '8px',
  padding: '0.55rem 0.75rem',
  cursor: 'pointer',
  fontWeight: '900'
};

const feedbackTypes = ['bug', 'suggestion', 'other'];

export default function UserMessages({ onViewChange, onReportsSeen, onNotificationsChanged }) {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState([]);
  const [openTicketId, setOpenTicketId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackBody, setFeedbackBody] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setStatus('');

    const { data, error } = await supabase
      .from('user_feedback')
      .select('id, type, subject, body, status, created_at, feedback_replies(id, author_role, body, created_at)')
      .is('user_deleted_at', null)
      .order('created_at', { ascending: false });

    setLoading(false);

    if (error) {
      console.error(error);
      setStatus(t('report.errors.load'));
      return;
    }

    setTickets(data || []);
  }, [t]);

  useEffect(() => {
    onReportsSeen?.();
    const initialLoad = window.setTimeout(loadTickets, 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadTickets, onReportsSeen]);

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();
    setStatus('');

    if (!feedbackSubject.trim() || !feedbackBody.trim()) {
      setStatus(t('report.errors.required'));
      return;
    }

    setSendingFeedback(true);

    const { error } = await supabase
      .from('user_feedback')
      .insert({
        type: feedbackType,
        subject: feedbackSubject.trim(),
        body: feedbackBody.trim()
      });

    setSendingFeedback(false);

    if (error) {
      console.error(error);
      setStatus(t('report.errors.send'));
      return;
    }

    setFeedbackSubject('');
    setFeedbackBody('');
    setStatus(t('report.messages.sent'));
    loadTickets();
    onNotificationsChanged?.();
  };

  const handleReplyTicket = async (ticket) => {
    const body = replyDrafts[ticket.id]?.trim();

    if (!body) {
      setStatus(t('report.errors.emptyReply'));
      return;
    }

    const { error } = await supabase.rpc('reply_own_feedback', {
      feedback_id: ticket.id,
      reply_body: body
    });

    if (error) {
      console.error(error);
      setStatus(t('report.errors.replyWithMessage', { message: error.message }));
      return;
    }

    setReplyDrafts((current) => ({ ...current, [ticket.id]: '' }));
    setStatus(t('report.messages.replySent'));
    loadTickets();
    onNotificationsChanged?.();
  };

  const handleCloseTicket = async (ticket) => {
    const confirmed = window.confirm(t('report.confirm.close', { subject: ticket.subject }));
    if (!confirmed) return;

    const { error } = await supabase.rpc('close_own_feedback', {
      feedback_id: ticket.id
    });

    if (error) {
      console.error(error);
      setStatus(t('report.errors.closeWithMessage', { message: error.message }));
      return;
    }

    setStatus(t('report.messages.closed'));
    loadTickets();
  };

  const handleDeleteOwnFeedback = async (ticket) => {
    const confirmed = window.confirm(
      t('report.confirm.delete', { subject: ticket.subject })
    );

    if (!confirmed) return;

    const { error } = await supabase.rpc('delete_own_feedback', {
      feedback_id: ticket.id
    });

    if (error) {
      console.error(error);
      setStatus(t('report.errors.delete'));
      return;
    }

    setStatus(t('report.messages.deleted'));
    loadTickets();
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

      <main style={{ width: 'min(900px, 100%)', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '2.4rem' }}>{t('report.title')}</h1>
          <p style={{ color: 'var(--tk-text-muted)', marginTop: '0.45rem' }}>
            {t('report.subtitle')}
          </p>
        </header>

        {loading && <p style={{ color: 'var(--tk-green)' }}>{t('common.loading')}</p>}
        {status && <p style={{ color: '#ffcf66' }}>{status}</p>}

        <section style={{ ...panelStyle, marginBottom: '1rem' }}>
          <h2 style={{ color: '#fff', marginTop: 0 }}>{t('report.createTitle')}</h2>

          <form onSubmit={handleFeedbackSubmit} style={{ display: 'grid', gap: '0.8rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {feedbackTypes.map((type) => {
                const isActive = feedbackType === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFeedbackType(type)}
                    style={{
                      flex: '1 1 120px',
                      padding: '0.75rem',
                      background: isActive ? 'var(--tk-green)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${isActive ? 'var(--tk-green)' : 'rgba(255,255,255,0.1)'}`,
                      color: isActive ? '#061006' : '#fff',
                      borderRadius: '8px',
                      fontWeight: '900',
                      cursor: 'pointer',
                      fontFamily: "'Rajdhani', sans-serif"
                    }}
                  >
                    {t(`report.types.${type}`)}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={feedbackSubject}
              onChange={(event) => setFeedbackSubject(event.target.value)}
              placeholder={t('report.subject')}
              maxLength={120}
              style={{
                padding: '0.8rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                borderRadius: '8px'
              }}
            />

            <textarea
              value={feedbackBody}
              onChange={(event) => setFeedbackBody(event.target.value)}
              placeholder={t('report.bodyPlaceholder')}
              rows={5}
              maxLength={2000}
              style={{
                padding: '0.8rem',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                borderRadius: '8px',
                resize: 'vertical'
              }}
            />

            <button
              disabled={sendingFeedback}
              style={{
                padding: '0.8rem',
                background: 'var(--tk-green)',
                border: 'none',
                borderRadius: '8px',
                color: '#061006',
                fontWeight: '900',
                cursor: sendingFeedback ? 'wait' : 'pointer'
              }}
            >
              {sendingFeedback ? t('report.sending') : t('report.createButton')}
            </button>
          </form>
        </section>

        <section style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
          <h2 style={{ color: '#fff', margin: '0.5rem 0' }}>{t('report.myTickets')}</h2>

          {tickets.length === 0 && !loading && (
            <article style={panelStyle}>
              <p style={{ color: 'var(--tk-text-muted)', margin: 0 }}>{t('report.noTickets')}</p>
            </article>
          )}

          {tickets.map((ticket) => {
            const isOpen = openTicketId === ticket.id;
            const replies = [...(ticket.feedback_replies || [])].sort(
              (a, b) => new Date(a.created_at) - new Date(b.created_at)
            );

            return (
              <article key={ticket.id} style={{ ...panelStyle, padding: 0, overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setOpenTicketId(isOpen ? null : ticket.id)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    padding: '1.1rem 1.25rem',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span>
                      <span style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.45rem' }}>
                        <strong style={{ color: 'var(--tk-green)' }}>
                          {t(`report.types.${ticket.type}`, ticket.type)}
                        </strong>
                        <strong style={{ color: '#ffcf66' }}>
                          {t(`report.status.${ticket.status}`, ticket.status)}
                        </strong>
                      </span>
                      <strong style={{ color: '#fff', display: 'block', fontSize: '1.08rem' }}>
                        {ticket.subject}
                      </strong>
                      <span style={{ color: 'var(--tk-text-muted)', display: 'block', marginTop: '0.25rem' }}>
                        {new Date(ticket.created_at).toLocaleString()} · {t('report.responses', { count: replies.length })}
                      </span>
                    </span>
                  </div>
                </button>

                {isOpen && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.1rem 1.25rem' }}>
                    <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ color: '#fff', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        <strong style={{ color: 'var(--tk-green)' }}>{t('report.authorUser')}</strong>
                        <p style={{ margin: '0.35rem 0 0 0' }}>{ticket.body}</p>
                      </div>

                      {replies.map((reply) => (
                        <div
                          key={reply.id}
                          style={{
                            padding: '0.85rem',
                            borderRadius: '8px',
                            background: reply.author_role === 'admin'
                              ? 'rgba(26,176,21,0.07)'
                              : 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            color: '#fff'
                          }}
                        >
                          <strong style={{ color: reply.author_role === 'admin' ? 'var(--tk-green)' : '#fff' }}>
                            {reply.author_role === 'admin' ? t('report.authorAdmin') : t('report.authorUser')}
                          </strong>
                          <span style={{ color: 'var(--tk-text-muted)', marginLeft: '0.5rem' }}>
                            {new Date(reply.created_at).toLocaleString()}
                          </span>
                          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, margin: '0.45rem 0 0 0' }}>
                            {reply.body}
                          </p>
                        </div>
                      ))}
                    </div>

                    {ticket.status !== 'closed' && (
                      <div style={{ display: 'grid', gap: '0.65rem' }}>
                        <textarea
                          value={replyDrafts[ticket.id] || ''}
                          onChange={(event) =>
                            setReplyDrafts((current) => ({ ...current, [ticket.id]: event.target.value }))
                          }
                          placeholder={t('report.replyPlaceholder')}
                          rows={3}
                          maxLength={2000}
                          style={{
                            padding: '0.8rem',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            borderRadius: '8px',
                            resize: 'vertical'
                          }}
                        />

                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleReplyTicket(ticket)}
                            style={{ ...actionButtonStyle, color: 'var(--tk-green)' }}
                          >
                            {t('common.reply')}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCloseTicket(ticket)}
                            style={{ ...actionButtonStyle, color: '#ffcf66' }}
                          >
                            {t('report.closeTicket')}
                          </button>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteOwnFeedback(ticket)}
                      style={{
                        ...actionButtonStyle,
                        marginTop: '0.75rem',
                        color: '#ff6b6b',
                        borderColor: 'rgba(255,107,107,0.35)'
                      }}
                    >
                      {t('report.deleteFromList')}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
