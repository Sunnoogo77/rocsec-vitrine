import { useTranslation } from 'react-i18next';
import { asset } from '../../../utils/asset';
import styles from './Footer.module.css';

const MAPS_URL =
  'https://maps.google.com/?q=64+avenue+du+Groupe+Manouchian+94400+Vitry-sur-Seine';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Colonne 1 — Identité */}
        <div className={styles.col}>
          <img
            src={asset('/logo-rst.png')}
            alt={t('accessibility.logoAlt')}
            className={styles.logoImg}
            width={120}
            height={75}
          />
          <p className={styles.phrase}>
            {t('footer.identitePhrase1')}<br />{t('footer.identitePhrase2')}
          </p>
        </div>

        {/* Colonne 2 — Localisation */}
        <div className={styles.col}>
          <p className={styles.colLabel}>{t('footer.localisation')}</p>
          <address className={styles.adresse}>
            <span>{t('footer.salle')}</span>
            <span>64 av. du Groupe Manouchian</span>
            <span>94400 Vitry-sur-Seine</span>
          </address>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapLink}
          >
            {t('footer.voirMaps')}
          </a>
        </div>

        {/* Colonne 3 — Horaires */}
        <div className={styles.col}>
          <p className={styles.colLabel}>{t('footer.horaires')}</p>
          <ul className={styles.schedule}>
            <li>
              <span className={styles.schedDay}>{t('footer.schedule.wed')}</span>
              <span className={styles.schedTime}>{t('footer.schedule.wedTime')}</span>
            </li>
            <li>
              <span className={styles.schedDay}>{t('footer.schedule.sun')}</span>
              <span className={styles.schedTime}>{t('footer.schedule.sunTime')}</span>
            </li>
            <li>
              <span className={styles.schedDay}>{t('footer.schedule.fri')}</span>
              <span className={styles.schedTime}>{t('footer.schedule.friTime')}</span>
            </li>
          </ul>
        </div>

        {/* Colonne 4 — Secrétariat */}
        <div className={styles.col}>
          <p className={styles.colLabel}>{t('footer.secretariat')}</p>
          <div className={styles.contactLinks}>
            <a href="tel:+33000000000" className={styles.contactLink}>
              +33 0 00 00 00 00
            </a>
            <a href="mailto:secretariat@rocseculaire.fr" className={styles.contactLink}>
              secretariat@rocseculaire.fr
            </a>
            <a
              href="https://www.youtube.com/@kollonell"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ytLink}
            >
              {t('footer.youtube')}
            </a>
          </div>
        </div>

      </div>

      <div className={styles.legal}>
        <p>{t('footer.legal', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>
  );
}
