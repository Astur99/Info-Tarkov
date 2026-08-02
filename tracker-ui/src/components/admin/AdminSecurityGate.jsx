import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabaseClient';

const gateStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  padding: '2rem',
  background: '#0a0a0c',
  fontFamily: "'Rajdhani', sans-serif"
};

const cardStyle = {
  width: 'min(480px, 100%)',
  padding: '1.6rem',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.035)',
  border: '1px solid rgba(255,255,255,0.1)'
};

const buttonStyle = {
  width: '100%',
  marginTop: '1rem',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  border: '1px solid rgba(26,176,21,0.35)',
  background: 'rgba(26,176,21,0.12)',
  color: '#fff',
  cursor: 'pointer',
  fontFamily: "'Rajdhani', sans-serif",
  fontWeight: '900'
};

const getVerifiedTotpFactor = (factors) =>
  (factors?.totp || []).find((factor) => factor.status === 'verified');

export default function AdminSecurityGate({ children, onBack }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState('checking');
  const [factorId, setFactorId] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const initializeAccess = useCallback(async () => {
    setStatus('checking');
    setError('');

    const { data: assurance, error: assuranceError } =
      await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (assuranceError) {
      setError(assuranceError.message);
      setStatus('error');
      return;
    }

    if (assurance?.currentLevel === 'aal2') {
      setStatus('verified');
      return;
    }

    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      setError(factorsError.message);
      setStatus('error');
      return;
    }

    const verifiedFactor = getVerifiedTotpFactor(factors);
    if (verifiedFactor) {
      setFactorId(verifiedFactor.id);
      setStatus('challenge');
      return;
    }

    const unverifiedFactors = (factors?.totp || []).filter((factor) => factor.status !== 'verified');
    await Promise.all(unverifiedFactors.map((factor) => supabase.auth.mfa.unenroll({ factorId: factor.id })));

    const { data: enrollment, error: enrollmentError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Info Tarkov Admin'
    });

    if (enrollmentError) {
      setError(enrollmentError.message);
      setStatus('error');
      return;
    }

    setFactorId(enrollment.id);
    setQrCode(enrollment.totp?.qr_code || '');
    setSecret(enrollment.totp?.secret || '');
    setStatus('enroll');
  }, []);

  useEffect(() => {
    const initialCheck = window.setTimeout(initializeAccess, 0);
    return () => window.clearTimeout(initialCheck);
  }, [initializeAccess]);

  const verifyCode = async (event) => {
    event.preventDefault();
    if (!factorId || !/^\d{6}$/.test(code.trim())) return;

    setSubmitting(true);
    setError('');

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setSubmitting(false);
      setError(challengeError.message);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: code.trim()
    });

    setSubmitting(false);
    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    await supabase.auth.refreshSession();
    setStatus('verified');
  };

  if (status === 'verified') return children;

  return (
    <div style={gateStyle}>
      <section style={cardStyle}>
        <p style={{ color: 'var(--tk-green)', fontWeight: '900', letterSpacing: '2px', margin: 0 }}>
          {t('admin.security.eyebrow', { defaultValue: 'PROTECTED ACCESS' })}
        </p>
        <h1 style={{ color: '#fff', margin: '0.35rem 0 0.65rem' }}>
          {t('admin.security.title', { defaultValue: 'Administrator verification' })}
        </h1>

        {status === 'checking' && (
          <p style={{ color: 'var(--tk-text-muted)' }}>
            {t('admin.security.checking', { defaultValue: 'Checking session security…' })}
          </p>
        )}

        {status === 'enroll' && (
          <>
            <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.55 }}>
              {t('admin.security.enrollDescription', {
                defaultValue: 'Scan this QR code with an authenticator app. MFA will be required for administrative access.'
              })}
            </p>
            {qrCode && (
              <img
                src={qrCode}
                alt={t('admin.security.qrAlt', { defaultValue: 'MFA configuration QR code' })}
                style={{ display: 'block', width: '220px', maxWidth: '100%', margin: '1rem auto', borderRadius: '10px' }}
              />
            )}
            {secret && (
              <p style={{ color: 'var(--tk-text-muted)', overflowWrap: 'anywhere', fontSize: '0.85rem' }}>
                {t('admin.security.manualCode', { defaultValue: 'Manual code' })}: <strong style={{ color: '#fff' }}>{secret}</strong>
              </p>
            )}
          </>
        )}

        {status === 'challenge' && (
          <p style={{ color: 'var(--tk-text-muted)', lineHeight: 1.55 }}>
            {t('admin.security.challengeDescription', {
              defaultValue: 'Enter the six-digit code from your authenticator to open the admin panel.'
            })}
          </p>
        )}

        {(status === 'enroll' || status === 'challenge') && (
          <form onSubmit={verifyCode}>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              aria-label={t('admin.security.codeLabel', { defaultValue: 'Authentication code' })}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.8rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: '#111214',
                color: '#fff',
                textAlign: 'center',
                letterSpacing: '0.45rem',
                fontSize: '1.2rem'
              }}
            />
            <button type="submit" disabled={submitting || code.length !== 6} style={{ ...buttonStyle, opacity: submitting || code.length !== 6 ? 0.5 : 1 }}>
              {submitting
                ? t('admin.security.verifying', { defaultValue: 'Verifying…' })
                : t('admin.security.verify', { defaultValue: 'VERIFY AND OPEN' })}
            </button>
          </form>
        )}

        {error && <p role="alert" style={{ color: '#ff6b6b', overflowWrap: 'anywhere' }}>{error}</p>}

        {status === 'error' && (
          <button type="button" onClick={initializeAccess} style={buttonStyle}>
            {t('common.retry', { defaultValue: 'Retry' })}
          </button>
        )}

        <button
          type="button"
          onClick={onBack}
          style={{ ...buttonStyle, background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: 'var(--tk-text-muted)' }}
        >
          {t('common.backToTerminal')}
        </button>
      </section>
    </div>
  );
}
