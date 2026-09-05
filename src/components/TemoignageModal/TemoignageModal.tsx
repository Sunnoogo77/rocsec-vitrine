import HCaptcha from '@hcaptcha/react-hcaptcha';
/**
 * Modal de soumission d'un témoignage depuis la vitrine.
 *
 * - Champs : prénom, nom, email (facultatif), téléphone (facultatif),
 *   ville (facultatif), texte du témoignage, photos jusqu'à 5×5 Mo.
 * - Honeypot caché `website` (vrais visiteurs ne le voient pas).
 * - États : edition → submitting → success | error.
 * - Date de soumission gérée côté serveur (`date_recue=timezone.now()`).
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  soumettreTemoignagePublic,
  type SoumissionTemoignageInput,
} from '../../api/soumissionTemoignage';
import { ApiError } from '../../api/client';
import styles from './TemoignageModal.module.css';

const MAX_PHOTOS = 5;
const MAX_PHOTO_MB = 5;

interface Props {
  open: boolean;
  onClose: () => void;
}

type Status = 'edition' | 'submitting' | 'success' | 'error';

export function TemoignageModal({ open, onClose }: Props) {
  const { i18n } = useTranslation();
  const lang: 'fr' | 'en' = i18n.language === 'en' ? 'en' : 'fr';

  const [captchaToken, setCaptchaToken] = useState('');
  const captchaRef = useRef<HCaptcha>(null);
  const captchaKey = import.meta.env.VITE_HCAPTCHA_SITEKEY || '';
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [ville, setVille] = useState('');
  const [texte, setTexte] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('edition');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status !== 'submitting') onClose();
    };
    window.addEventListener('keydown', onKey);
    closeBtnRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, status]);

  useEffect(() => {
    if (open) return;
    // Reset à la fermeture seulement quand le formulaire n'est pas en train d'être
    // envoyé (évite de perdre une saisie sur fermeture accidentelle).
    if (status === 'success' || status === 'error') {
      const t = setTimeout(() => {
        setPrenom('');
        setNom('');
        setEmail('');
        setTelephone('');
        setVille('');
        setTexte('');
        setPhotos([]);
        setHoneypot('');
        setStatus('edition');
        setErrorMsg(null);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open, status]);

  if (!open) return null;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const merged = [...photos, ...incoming].slice(0, MAX_PHOTOS);
    const limit = MAX_PHOTO_MB * 1024 * 1024;
    const tooBig = merged.find((f) => f.size > limit);
    if (tooBig) {
      setErrorMsg(`La photo « ${tooBig.name} » dépasse ${MAX_PHOTO_MB} Mo.`);
      return;
    }
    setErrorMsg(null);
    setPhotos(merged);
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const canSubmit =
    captchaToken.length > 0 &&
    prenom.trim().length > 0 &&
    nom.trim().length > 0 &&
    texte.trim().length >= 30 &&
    status !== 'submitting';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setStatus('submitting');
    setErrorMsg(null);
    try {
      const input: SoumissionTemoignageInput = {
        hcaptcha_token: captchaToken,
        prenom,
        nom,
        email: email || undefined,
        telephone: telephone || undefined,
        ville: ville || undefined,
        texte,
        langue: lang,
        photos,
        honeypot,
      };
      await soumettreTemoignagePublic(input);
      setStatus('success');
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 0
          ? 'Le serveur est momentanément indisponible. Réessayez plus tard.'
          : err instanceof ApiError && err.status === 429
          ? 'Trop de soumissions depuis cette adresse. Réessayez plus tard.'
          : err instanceof ApiError && err.status === 400
          ? "Vérifiez que tous les champs obligatoires sont bien remplis (texte d'au moins 30 caractères)."
          : 'Une erreur est survenue lors de l\'envoi. Réessayez plus tard.';
      setErrorMsg(msg);
      setStatus('error');
    } finally {
      setCaptchaToken('');
      captchaRef.current?.resetCaptcha();
    }
  };

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="temModalTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== 'submitting') onClose();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.handle} aria-hidden="true" />

        <header className={styles.head}>
          <div className={styles.headText}>
            <span className={styles.eyebrow}>Témoignage</span>
            <h2 id="temModalTitle" className={styles.title}>
              Partager mon témoignage
            </h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Fermer"
            disabled={status === 'submitting'}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {status === 'success' ? (
          <div className={styles.success}>
            <div className={styles.successIcon} aria-hidden="true">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h3 className={styles.successTitle}>Votre témoignage est bien soumis</h3>
            <p className={styles.successBody}>
              Notre équipe va l'étudier dans les prochains jours. S'il est validé,
              il sera publié sur la page Témoignages. Merci de partager
              l'œuvre que Dieu a faite dans votre vie.
            </p>
            <button
              type="button"
              className={`${styles.btnPrimary} ${styles.successCta}`}
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className={styles.body}>
              <form id="temForm" className={styles.form} onSubmit={submit}>
                <p className={styles.lede}>
                  Tous les témoignages sont relus par l'équipe pastorale avant
                  publication. La date est enregistrée automatiquement à l'envoi.
                </p>

                <div className={styles.row}>
                  <label className={styles.field}>
                    <span className={styles.label}>Prénom *</span>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      disabled={status === 'submitting'}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.label}>Nom *</span>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      disabled={status === 'submitting'}
                    />
                  </label>
                </div>

                <div className={styles.row}>
                  <label className={styles.field}>
                    <span className={styles.label}>
                      Email <span className={styles.hint}>· facultatif</span>
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="prenom@example.com"
                      disabled={status === 'submitting'}
                    />
                  </label>
                  <label className={styles.field}>
                    <span className={styles.label}>
                      Téléphone <span className={styles.hint}>· facultatif</span>
                    </span>
                    <input
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      disabled={status === 'submitting'}
                    />
                  </label>
                </div>

                <label className={styles.field}>
                  <span className={styles.label}>
                    Ville <span className={styles.hint}>· facultatif</span>
                  </span>
                  <input
                    type="text"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder="Vitry-sur-Seine"
                    disabled={status === 'submitting'}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>
                    Votre témoignage *
                    <span className={styles.hint}>· minimum 30 caractères</span>
                  </span>
                  <textarea
                    rows={8}
                    required
                    minLength={30}
                    maxLength={10000}
                    value={texte}
                    onChange={(e) => setTexte(e.target.value)}
                    placeholder="Racontez librement ce que Dieu a fait dans votre vie…"
                    disabled={status === 'submitting'}
                  />
                  <span className={styles.counter}>
                    {texte.length} / 10 000
                  </span>
                </label>

                <div className={styles.field}>
                  <span className={styles.label}>
                    Photos
                    <span className={styles.hint}>
                      · facultatif · jusqu'à {MAX_PHOTOS} photos, {MAX_PHOTO_MB} Mo chacune
                    </span>
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFiles(e.target.files)}
                    disabled={status === 'submitting' || photos.length >= MAX_PHOTOS}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    className={styles.fileBtn}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={status === 'submitting' || photos.length >= MAX_PHOTOS}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Ajouter une photo
                  </button>
                  {photos.length > 0 && (
                    <ul className={styles.photoList}>
                      {photos.map((p, i) => (
                        <li key={`${p.name}-${i}`}>
                          <span className={styles.photoName}>{p.name}</span>
                          <span className={styles.photoSize}>
                            {(p.size / 1024 / 1024).toFixed(1)} Mo
                          </span>
                          <button
                            type="button"
                            className={styles.photoRemove}
                            onClick={() => removePhoto(i)}
                            aria-label={`Retirer ${p.name}`}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Honeypot caché — vrais visiteurs ne le voient pas. */}
                <div className={styles.honeypot} aria-hidden="true">
                  <label>
                    Ne pas remplir
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </label>
                </div>

                {errorMsg && <p className={styles.error}>{errorMsg}</p>}
              </form>
            </div>

            <div className={styles.foot}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={onClose}
                disabled={status === 'submitting'}
              >
                Annuler
              </button>
              {captchaKey ? <HCaptcha ref={captchaRef} sitekey={captchaKey} onVerify={setCaptchaToken} onExpire={() => setCaptchaToken('')} onError={() => setCaptchaToken('')} /> : <p role="status">Le formulaire est temporairement indisponible.</p>}
                <button
                type="submit"
                form="temForm"
                className={styles.btnPrimary}
                disabled={!canSubmit}
              >
                {status === 'submitting' ? 'Envoi en cours…' : 'Envoyer le témoignage'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
