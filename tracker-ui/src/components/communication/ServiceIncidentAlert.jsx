import { useTranslation } from 'react-i18next';

export default function ServiceIncidentAlert() {
  const { t } = useTranslation();

  return (
    <div className="service-incident-alert" role="alert" aria-live="polite">
      <span className="service-incident-alert__signal" aria-hidden="true">!</span>
      <div>
        <strong>{t('incidentAlert.title')}</strong>
        <span>{t('incidentAlert.body')}</span>
      </div>
    </div>
  );
}
