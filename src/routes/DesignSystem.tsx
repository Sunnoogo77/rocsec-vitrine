import { Eyebrow } from '../components/ui/Eyebrow/Eyebrow';
import { Citation } from '../components/ui/Citation/Citation';
import { LivePill } from '../components/ui/LivePill/LivePill';
import { Button } from '../components/ui/Button/Button';
import { HairlineDivider } from '../components/ui/HairlineDivider/HairlineDivider';
import styles from './DesignSystem.module.css';

export default function DesignSystem() {
  return (
    <main id="main-content" className={styles.page} style={{ paddingTop: 'calc(var(--header-h) + 40px)' }}>
      <div className={styles.container}>
        <Eyebrow>Design System — RST</Eyebrow>
        <h1 style={{ fontFamily: 'var(--f-serif)', fontSize: 48, marginTop: 16, marginBottom: 60 }}>
          Composants &amp; Tokens
        </h1>

        {/* ── Palette ──────────────────────────────────── */}
        <Section title="1 — Palette de couleurs">
          <div className={styles.swatches}>
            <Swatch name="--ink" hex="#0C0E14" bg="#0C0E14" fg="#fff" />
            <Swatch name="--ink-2" hex="#2A2E3A" bg="#2A2E3A" fg="#fff" />
            <Swatch name="--ink-3" hex="#6B7280" bg="#6B7280" fg="#fff" />
            <Swatch name="--paper" hex="#FFFFFF" bg="#FFFFFF" fg="#0C0E14" bordered />
            <Swatch name="--paper-2" hex="#F4F1EA" bg="#F4F1EA" fg="#0C0E14" bordered />
            <Swatch name="--accent" hex="#15364B" bg="#15364B" fg="#fff" />
            <Swatch name="--note" hex="#A62020" bg="#A62020" fg="#fff" />
          </div>
          <p className={styles.rule}>
            <strong>Règle sémantique :</strong> Rouge (--note) = vidéo / LIVE / YouTube
            uniquement. Bleu (--accent) = action / identité / don. Encre noire = neutre.
          </p>
        </Section>

        <HairlineDivider />

        {/* ── Typographie ──────────────────────────────── */}
        <Section title="2 — Typographie">
          <div className={styles.typeRows}>
            <TypeRow
              label="--f-serif · Cormorant Garamond"
              usage="Corps éditorial, titres h1–h3, citations, lede"
            >
              <p style={{ fontFamily: 'var(--f-serif)', fontSize: 32, fontWeight: 500, lineHeight: 1.1 }}>
                Une assemblée née<br /><em>d'une fidélité.</em>
              </p>
            </TypeRow>

            <TypeRow
              label="--f-engrave · Cinzel"
              usage="Usage limité : nom de l'assemblée, horaires de culte"
            >
              <p style={{ fontFamily: 'var(--f-engrave)', fontSize: 22, fontWeight: 600, letterSpacing: '0.08em' }}>
                ROC SÉCULAIRE TABERNACLE
              </p>
              <p style={{ fontFamily: 'var(--f-engrave)', fontSize: 20, marginTop: 8, letterSpacing: '0.06em' }}>
                19H00 — 21H00
              </p>
            </TypeRow>

            <TypeRow
              label="--f-num · Bodoni Moda"
              usage="TOUS les chiffres : montants, dates, numéros, durées, %"
            >
              <p style={{ fontFamily: 'var(--f-num)', fontSize: 60, lineHeight: 1, letterSpacing: '-0.01em' }}>
                50 000 €
              </p>
              <p style={{ fontFamily: 'var(--f-num)', fontSize: 36, marginTop: 8 }}>
                12 500 € · 25% · #14 · 09H00
              </p>
            </TypeRow>

            <TypeRow
              label="--f-body · Inter"
              usage="Eyebrow, méta, navigation, boutons, captions, labels"
            >
              <Eyebrow>Eyebrow — Projet Néhémie · 2026</Eyebrow>
              <p style={{ fontFamily: 'var(--f-body)', fontSize: 14, marginTop: 12, color: 'var(--ink-3)' }}>
                Méta — Dimanche 26 avril 2026 · 09H00 · L'ORDRE DE L'ÉGLISE
              </p>
            </TypeRow>
          </div>
        </Section>

        <HairlineDivider />

        {/* ── Boutons ──────────────────────────────────── */}
        <Section title="3 — Boutons">
          <div className={styles.buttonRow}>
            <Button variant="video">▶ LIVE</Button>
            <Button variant="blue">Contribuer</Button>
            <Button variant="secondary">Découvrir l'église</Button>
            <Button variant="line">↓ Audio MP3</Button>
            <Button variant="more">En savoir plus →</Button>
          </div>
          <p className={styles.rule} style={{ marginTop: 20 }}>
            <strong>video</strong> = pill rouge (LIVE, vidéo, YouTube uniquement) ·{' '}
            <strong>blue</strong> = pill bleu (CTA actions, dons) ·{' '}
            <strong>secondary</strong> = pill outline noir ·{' '}
            <strong>line</strong> = rectangle outline (téléchargements) ·{' '}
            <strong>more</strong> = lien inline souligné
          </p>
        </Section>

        <HairlineDivider />

        {/* ── LivePill ─────────────────────────────────── */}
        <Section title="4 — Pastille LIVE">
          <LivePill />
          <p className={styles.rule} style={{ marginTop: 16 }}>
            Point blanc animé (pulsation CSS keyframe). Usage : header, hero, badge vidéo,
            drapeau « Aujourd'hui » chronologie.
          </p>
        </Section>

        <HairlineDivider />

        {/* ── Citations ────────────────────────────────── */}
        <Section title="5 — Citations">
          <div className={styles.citations}>
            <div>
              <Eyebrow style={{ marginBottom: 12 }}>Citation biblique (filet noir)</Eyebrow>
              <Citation
                variant="bibl"
                texte="« Ainsi la foi vient de ce qu'on entend, et ce qu'on entend vient de la parole de Christ. »"
                reference="Romains 10.17"
              />
            </div>
            <div>
              <Eyebrow style={{ marginBottom: 12 }}>Citation Branham (filet rouge)</Eyebrow>
              <Citation
                variant="bran"
                texte="« Le Roc, c'est la révélation. Et sur cette révélation, Jésus a dit : Je bâtirai mon Église. »"
                source="63-0728"
              />
            </div>
            <div>
              <Eyebrow style={{ marginBottom: 12 }}>Citation pull (filet bleu, grande)</Eyebrow>
              <Citation
                variant="pull"
                texte="« Une maison bâtie sur le Roc ne tombe pas. »"
                source="Matthieu 7.24"
              />
            </div>
          </div>
        </Section>

        <HairlineDivider />

        {/* ── HairlineDivider ──────────────────────────── */}
        <Section title="6 — Filets de séparation">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <Eyebrow style={{ marginBottom: 10 }}>Soft — 1px rgba(12,14,20,.15)</Eyebrow>
              <HairlineDivider weight="soft" />
            </div>
            <div>
              <Eyebrow style={{ marginBottom: 10 }}>Major — 1.5px #0C0E14</Eyebrow>
              <HairlineDivider weight="major" />
            </div>
          </div>
        </Section>

        <HairlineDivider />

        {/* ── Eyebrow ──────────────────────────────────── */}
        <Section title="7 — Eyebrow (étiquettes de section)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Eyebrow>Eyebrow par défaut — Encre discrète (--ink-3)</Eyebrow>
            <Eyebrow color="note">Eyebrow rouge — Usage vidéo/live uniquement</Eyebrow>
          </div>
        </Section>

        <HairlineDivider />

        {/* ── Espaces ──────────────────────────────────── */}
        <Section title="8 — Conteneurs de mise en page">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { cls: '.container', max: '1 100px', desc: 'Sections internes' },
              { cls: '.container--wide', max: '1 280px', desc: 'Sections pleine largeur' },
              { cls: '.container--article', max: '760px', desc: 'Page Histoire, récits longs' },
            ].map(({ cls, max, desc }) => (
              <div key={cls} style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
                <code style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--note)', minWidth: 200 }}>
                  {cls}
                </code>
                <span style={{ fontFamily: 'var(--f-num)', fontSize: 16 }}>{max}</span>
                <span style={{ fontFamily: 'var(--f-body)', fontSize: 13, color: 'var(--ink-3)' }}>{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        <div style={{ height: 'var(--space-120)' }} />
      </div>
    </main>
  );
}

/* Helpers internes à cette page uniquement */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ paddingBlock: 'var(--space-48)' }}>
      <h2
        style={{
          fontFamily: 'var(--f-body)',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          marginBottom: 'var(--space-32)',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Swatch({
  name, hex, bg, fg, bordered,
}: {
  name: string; hex: string; bg: string; fg: string; bordered?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 120,
      }}
    >
      <div
        style={{
          width: '100%',
          height: 64,
          background: bg,
          border: bordered ? '1px solid var(--line-soft)' : 'none',
          borderRadius: 'var(--r-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: fg,
          fontFamily: 'var(--f-num)',
          fontSize: 13,
        }}
      >
        {hex}
      </div>
      <span style={{ fontFamily: 'var(--f-body)', fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.1em' }}>
        {name}
      </span>
    </div>
  );
}

function TypeRow({
  label, usage, children,
}: {
  label: string; usage: string; children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: 'var(--space-40)',
        paddingBlock: 'var(--space-24)',
        borderTop: 'var(--border-soft)',
        alignItems: 'start',
      }}
    >
      <div>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: 11, color: 'var(--ink)', fontWeight: 600, letterSpacing: '0.06em' }}>
          {label}
        </p>
        <p style={{ fontFamily: 'var(--f-body)', fontSize: 11, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.5 }}>
          {usage}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
}
