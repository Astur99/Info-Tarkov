import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

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

const replyAuthorLabels = {
  user: 'Usuario',
  admin: 'Astur'
};

export default function AdminPanel({ onViewChange }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAdminData = async () => {
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
      setMessage('No se pudieron cargar las métricas admin.');
      return;
    }

    setStats(Array.isArray(statsData) ? statsData[0] : statsData);
    setUsers(usersData || []);
    setFeedback(feedbackData || []);
  };

  useEffect(() => {
    loadAdminData();

    const interval = window.setInterval(() => {
      loadAdminData();
    }, 15000);

    return () => window.clearInterval(interval);
  }, []);

  const handleRoleChange = async (user, nextRole) => {
    const confirmed = window.confirm(`¿Quieres convertir a ${user.email} en ${nextRole}?`);
    if (!confirmed) return;

    const { error } = await supabase.rpc('admin_set_user_role', {
      target_user_id: user.user_id,
      target_role: nextRole
    });

    if (error) {
      console.error(error);
      setMessage('No se pudo cambiar el rol del usuario.');
      return;
    }

    setMessage('Rol actualizado.');
    loadAdminData();
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Vas a borrar la cuenta de ${user.email}. Perderá su progreso cloud. ¿Continuar?`
    );
    if (!confirmed) return;

    const secondConfirm = window.prompt('Escribe BORRAR para confirmar.');
    if (secondConfirm !== 'BORRAR') {
      setMessage('Borrado cancelado.');
      return;
    }

    const { error } = await supabase.rpc('admin_delete_user', {
      target_user_id: user.user_id
    });

    if (error) {
      console.error(error);
      setMessage('No se pudo borrar la cuenta.');
      return;
    }

    setMessage('Cuenta borrada.');
    loadAdminData();
  };

  const handleSendMessage = async (user) => {
    const subject = window.prompt('Asunto del mensaje');
    if (!subject) return;

    const body = window.prompt('Mensaje');
    if (!body) return;

    const { error } = await supabase.rpc('admin_send_user_message', {
      target_user_id: user.user_id,
      message_subject: subject,
      message_body: body
    });

    if (error) {
      console.error(error);
      setMessage(`No se pudo enviar el mensaje: ${error.message}`);
      return;
    }

    setMessage('Mensaje enviado.');
  };

  const handleFeedbackStatusChange = async (feedbackItem, nextStatus) => {
    const { error } = await supabase.rpc('admin_update_feedback_status', {
      feedback_id: feedbackItem.id,
      next_status: nextStatus
    });

    if (error) {
      console.error(error);
      setMessage(`No se pudo actualizar el reporte: ${error.message}`);
      return;
    }

    setMessage('Reporte actualizado.');
    loadAdminData();
  };

  const handleReplyFeedback = async (feedbackItem) => {
    const body = window.prompt('Respuesta para el usuario');
    if (!body) return;

    const { error } = await supabase.rpc('admin_reply_feedback', {
      feedback_id: feedbackItem.id,
      reply_body: body
    });

    if (error) {
      console.error(error);
      setMessage(`No se pudo responder el reporte: ${error.message}`);
      return;
    }

    setMessage('Respuesta enviada.');
    loadAdminData();
  };

  const handleDeleteFeedback = async (feedbackItem) => {
    const confirmed = window.confirm(
      `¿Quieres borrar el ticket "${feedbackItem.subject}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase.rpc('admin_delete_feedback', {
      feedback_id: feedbackItem.id
    });

    if (error) {
      console.error(error);
      setMessage(`No se pudo borrar el reporte: ${error.message}`);
      return;
    }

    setMessage('Reporte borrado.');
    loadAdminData();
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
        ← VOLVER AL TERMINAL
      </button>

      <main style={{ width: 'min(1100px, 100%)', margin: '0 auto' }}>
        <header style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', margin: 0, fontSize: '2.4rem' }}>Panel Admin</h1>
          <p style={{ color: 'var(--tk-text-muted)', marginTop: '0.45rem' }}>
            Métricas internas de uso y usuarios registrados.
          </p>
        </header>

        {loading && <p style={{ color: 'var(--tk-green)' }}>Cargando métricas...</p>}
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
              <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800' }}>Visitas totales</span>
              <p style={statValueStyle}>{stats.total_visits ?? 0}</p>
            </article>

            <article style={panelStyle}>
              <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800' }}>Visitas hoy</span>
              <p style={statValueStyle}>{stats.today_visits ?? 0}</p>
            </article>

            <article style={panelStyle}>
              <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800' }}>Usuarios registrados</span>
              <p style={statValueStyle}>{stats.registered_users ?? 0}</p>
            </article>

            <article style={panelStyle}>
              <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800' }}>Usuarios online</span>
              <p style={statValueStyle}>{stats.active_users ?? 0}</p>
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
            <h2 style={{ color: '#fff', margin: 0 }}>Usuarios</h2>

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
              Actualizar
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
              <thead>
                <tr style={{ color: 'var(--tk-text-muted)', textAlign: 'left' }}>
                  <th style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Usuario</th>
                  <th style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Email</th>
                  <th style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Rol</th>
                  <th style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Registro</th>
                  <th style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Última actividad</th>
                  <th style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    <td style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {user.username || 'Sin configurar'}
                    </td>
                    <td style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)', color: user.role === 'admin' ? 'var(--tk-green)' : '#fff' }}>
                      {user.role || 'user'}
                    </td>
                    <td style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}
                    </td>
                    <td style={{ padding: '0.7rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {user.last_seen ? new Date(user.last_seen).toLocaleString() : '-'}
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
                          OWNER
                        </span>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleRoleChange(user, user.role === 'admin' ? 'user' : 'admin')}
                            style={{
                              ...actionButtonStyle,
                              color: user.role === 'admin' ? '#ffcf66' : 'var(--tk-green)'
                            }}
                          >
                            {user.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSendMessage(user)}
                            style={actionButtonStyle}
                          >
                            Mensaje
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
                            Borrar
                          </button>
                        </div>
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
            <h2 style={{ color: '#fff', margin: 0 }}>Reportes</h2>

            <span style={{ color: 'var(--tk-text-muted)', fontWeight: '800' }}>
              {feedback.length} tickets
            </span>
          </div>

          <div style={{ display: 'grid', gap: '0.8rem' }}>
            {feedback.length === 0 && (
              <p style={{ color: 'var(--tk-text-muted)', margin: 0 }}>
                No hay reportes ni sugerencias.
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
                        {feedbackTypeLabels[item.type] || item.type}
                      </span>
                      <span style={{ color: '#ffcf66', fontWeight: '900', textTransform: 'uppercase' }}>
                        {feedbackStatusLabels[item.status] || item.status}
                      </span>
                    </div>

                    <h3 style={{ color: '#fff', margin: '0 0 0.35rem 0' }}>{item.subject}</h3>

                    <p style={{ color: 'var(--tk-text-muted)', margin: '0 0 0.7rem 0' }}>
                      {item.username || 'Sin usuario'} · {item.email || 'sin email'} ·{' '}
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

                  <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {['open', 'reviewing', 'closed'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleFeedbackStatusChange(item, status)}
                        style={{
                          ...actionButtonStyle,
                          color: item.status === status ? 'var(--tk-green)' : '#fff',
                          borderColor: item.status === status
                            ? 'rgba(26,176,21,0.35)'
                            : 'rgba(255,255,255,0.08)'
                        }}
                      >
                        {feedbackStatusLabels[status]}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleReplyFeedback(item)}
                      disabled={item.status === 'closed'}
                      style={{
                        ...actionButtonStyle,
                        color: item.status === 'closed' ? 'var(--tk-text-muted)' : 'var(--tk-green)',
                        borderColor: 'rgba(26,176,21,0.35)'
                      }}
                    >
                      Responder
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteFeedback(item)}
                      style={{
                        ...actionButtonStyle,
                        color: '#ff6b6b',
                        borderColor: 'rgba(255,107,107,0.35)'
                      }}
                    >
                      Borrar global
                    </button>
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
