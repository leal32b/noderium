import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

type CardLinkProps = {
  title: string;
  description: ReactNode;
  to: string;
  meta?: ReactNode;
};

function CardLink({title, description, to, meta}: CardLinkProps) {
  return (
    <Link className={clsx('card', styles.card)} to={to}>
      <div className="card__body">
        <Heading as="h3" className={styles.cardTitle}>
          {title}
        </Heading>
        <p className={styles.cardDescription}>{description}</p>
      </div>
      <div className={clsx('card__footer', styles.cardFooter)}>
        <span className={styles.cardCta}>Open →</span>
        {meta ? <span className={styles.cardMeta}>{meta}</span> : null}
      </div>
    </Link>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx(styles.hero, styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroGrid}>
          <div className={styles.heroLeft}>
            <div className={styles.heroEyebrow}>Noderium</div>
            <Heading as="h1" className={styles.heroTitle}>
              A local-first knowledge system for connected thinking.
            </Heading>
            <p className={styles.heroSubtitle}>
              {siteConfig.tagline}
            </p>
            <p className={styles.heroLead}>
              This site captures the strategy and research behind Noderium — so
              Product, Design, and Engineering can align faster, ship with
              confidence, and keep the experience{' '}
              <strong>simple</strong>, <strong>transparent</strong>, and{' '}
              <strong>user-owned</strong>.
            </p>

            <div className={styles.heroActions}>
              <Link
                className={clsx(
                  'button button--primary button--lg',
                  styles.primaryCta,
                )}
                to="/docs/discovery/market-research/market-research-index">
                Start with Discovery
              </Link>
              <Link
                className={clsx('button button--secondary button--lg')}
                to="/docs/discovery/market-research/design-strategy-brief">
                Read the Strategy Brief
              </Link>
              <Link
                className={clsx(
                  'button button--outline button--secondary button--lg',
                  styles.ghostCta,
                )}
                href="https://github.com/leal32b/noderium">
                GitHub
              </Link>
            </div>

            <div className={styles.badges} aria-label="Core pillars">
              <span className={styles.badge}>Local-first</span>
              <span className={styles.badge}>Conversational</span>
              <span className={styles.badge}>Trust by design</span>
              <span className={styles.badge}>Onboarding &lt; 10min</span>
              <span className={styles.badge}>Open formats</span>
            </div>
          </div>

          <aside className={clsx('card', styles.heroRight)} aria-label="Atalhos">
            <div className="card__body">
              <Heading as="h2" className={styles.quickTitle}>
                Start in 10 minutes
              </Heading>
              <ol className={styles.quickList}>
                <li>
                  Read the <strong>Market Research</strong> index.
                </li>
                <li>
                  Pick a role and follow the recommended path (PM/Design/Eng).
                </li>
                <li>
                  Turn decisions into execution with a single, shared narrative.
                </li>
              </ol>
            </div>
            <div className={clsx('card__footer', styles.quickFooter)}>
              <Link
                className={styles.inlineLink}
                to="/docs/discovery/market-research/research-summary">
                Workshop summary →
              </Link>
              <Link
                className={styles.inlineLink}
                to="/docs/discovery/market-research/design-strategy-brief">
                Strategy brief →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Noderium documentation and research: discovery, strategy, and decision-ready context.">
      <HomepageHeader />
      <main>
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <Heading as="h2" className={styles.sectionTitle}>
                Reading path (Discovery)
              </Heading>
              <p className={styles.sectionSubtitle}>
                The docs are structured to reduce uncertainty and accelerate
                decisions — without “feature theatre”.
              </p>
            </div>

            <div className={styles.grid}>
              <CardLink
                title="Market Research (Index)"
                to="/docs/discovery/market-research/market-research-index"
                description={
                  <>
                    How to use the documents by phase (alignment → design
                    direction → PRD → validation).
                  </>
                }
                meta="Recomendado"
              />
              <CardLink
                title="Design Strategy Brief"
                to="/docs/discovery/market-research/design-strategy-brief"
                description={
                  <>
                    Executive summary: five pillars, core principles, and a
                    suggested MVP scope (2026-ready).
                  </>
                }
              />
              <CardLink
                title="Research Summary (Workshop)"
                to="/docs/discovery/market-research/research-summary"
                description={
                  <>
                    Workshop-ready insights: abandonment drivers, unmet needs,
                    differentiation, and “what not to build”.
                  </>
                }
              />
              <CardLink
                title="Strategic Market Research"
                to="/docs/discovery/market-research/market-research"
                description={
                  <>
                    The full doc: market landscape, 2025/2026 trends,
                    state-of-the-art expectations, and design implications.
                  </>
                }
              />
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.sectionAlt)}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <Heading as="h2" className={styles.sectionTitle}>
                What “state of the art” means in 2026
              </Heading>
              <p className={styles.sectionSubtitle}>
                Open-source communities celebrate products that reduce friction
                and criticize bloated UIs, lock-in, and AI without transparency.
                Noderium treats this as a baseline.
              </p>
            </div>

            <div className={styles.kpiRow}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiValue}>&lt; 10min</div>
                <div className={styles.kpiLabel}>Time to first value</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiValue}>&gt; 80%</div>
                <div className={styles.kpiLabel}>Search success rate</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiValue}>70%</div>
                <div className={styles.kpiLabel}>90-day retention</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiValue}>0 tax</div>
                <div className={styles.kpiLabel}>Invisible maintenance</div>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={clsx('card', styles.principleCard)}>
                <div className="card__body">
                  <Heading as="h3" className={styles.cardTitle}>
                    Conversation over navigation
                  </Heading>
                  <p className={styles.cardDescription}>
                    Less hierarchy, more intent: the primary flow is a dialogue
                    with your knowledge — not hunting through folders.
                  </p>
                </div>
              </div>
              <div className={clsx('card', styles.principleCard)}>
                <div className="card__body">
                  <Heading as="h3" className={styles.cardTitle}>
                    Trust through transparency
                  </Heading>
                  <p className={styles.cardDescription}>
                    Every suggestion must show source and context. No black box,
                    no hallucinations as UX.
                  </p>
                </div>
              </div>
              <div className={clsx('card', styles.principleCard)}>
                <div className="card__body">
                  <Heading as="h3" className={styles.cardTitle}>
                    Ownership feels like freedom
                  </Heading>
                  <p className={styles.cardDescription}>
                    Local-first, open formats, and an obvious exit. Users
                    shouldn’t “rent” their own thinking.
                  </p>
                </div>
              </div>
              <div className={clsx('card', styles.principleCard)}>
                <div className="card__body">
                  <Heading as="h3" className={styles.cardTitle}>
                    Beauty over features
                  </Heading>
                  <p className={styles.cardDescription}>
                    Intentional scope, impeccable details, and accessibility by
                    default — because “simple” is the hardest thing.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.sectionCtaRow}>
              <Link
                className={clsx('button button--primary', styles.primaryCta)}
                to="/docs/discovery/market-research/design-strategy-brief">
                Read the principles (Strategy Brief)
              </Link>
              <Link
                className="button button--secondary"
                to="/docs/discovery/market-research/market-research">
                See 2025/2026 expectations (Research)
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
