import { useTranslation } from 'react-i18next';

const COPY = {
  es: {
    eyebrow: 'PVP ESTACIONAL',
    title: 'Trabajando en KORD BREACH',
    body: 'Estamos preparando un nuevo módulo dedicado a la temporada, sus modificadores, misiones y Battle Pass.'
  },
  en: {
    eyebrow: 'SEASONAL PVP',
    title: 'Working on KORD BREACH',
    body: 'We are preparing a new module covering the season, its modifiers, quests and Battle Pass.'
  },
  de: {
    eyebrow: 'SAISON-PVP',
    title: 'KORD BREACH in Arbeit',
    body: 'Wir entwickeln ein neues Modul für die Saison, ihre Modifikatoren, Aufgaben und den Battle Pass.'
  },
  fr: {
    eyebrow: 'PVP SAISONNIER',
    title: 'KORD BREACH en préparation',
    body: 'Nous préparons un nouveau module consacré à la saison, ses modificateurs, ses quêtes et son Battle Pass.'
  },
  it: {
    eyebrow: 'PVP STAGIONALE',
    title: 'KORD BREACH in sviluppo',
    body: 'Stiamo preparando un nuovo modulo dedicato alla stagione, ai modificatori, alle missioni e al Battle Pass.'
  },
  ru: {
    eyebrow: 'СЕЗОННЫЙ PVP',
    title: 'Работаем над KORD BREACH',
    body: 'Мы готовим новый модуль о сезоне, его модификаторах, заданиях и боевом пропуске.'
  }
};

export default function KordBreachWorkNotice() {
  const { i18n } = useTranslation();
  const language = String(i18n.resolvedLanguage || i18n.language || 'en').split('-')[0];
  const copy = COPY[language] || COPY.en;

  return (
    <aside
      aria-label={copy.title}
      style={{
        width: 'min(760px, 100%)',
        margin: '2rem auto 0',
        padding: '1rem 1.2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        textAlign: 'left',
        border: '1px solid rgba(227, 177, 70, 0.34)',
        borderRadius: '8px',
        background: 'linear-gradient(100deg, rgba(227,177,70,0.12), rgba(17,18,16,0.82) 58%, rgba(26,176,21,0.05))',
        boxShadow: '0 14px 38px rgba(0,0,0,0.24), inset 0 1px rgba(255,255,255,0.025)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)'
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: '10px',
          height: '10px',
          flex: '0 0 10px',
          borderRadius: '50%',
          background: '#e3b146',
          boxShadow: '0 0 16px rgba(227,177,70,0.72)'
        }}
      />

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            marginBottom: '0.2rem',
            color: '#b9a476',
            fontSize: '0.68rem',
            fontWeight: 800,
            letterSpacing: '1.7px'
          }}
        >
          {copy.eyebrow}
        </div>
        <strong
          style={{
            display: 'block',
            color: '#f4f1e8',
            fontSize: '1rem',
            letterSpacing: '0.7px'
          }}
        >
          {copy.title}
        </strong>
        <p
          style={{
            margin: '0.28rem 0 0',
            color: 'var(--tk-text-muted)',
            fontSize: '0.84rem',
            lineHeight: 1.45
          }}
        >
          {copy.body}
        </p>
      </div>
    </aside>
  );
}
