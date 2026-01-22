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
              Your second brain, finally free.
            </Heading>
            <p className={styles.heroSubtitle}>
              {siteConfig.tagline}
            </p>
            <p className={styles.heroLead}>
              Noderium is an AI-native, local-first knowledge system that resolves the fundamental tensions 
              of personal knowledge management. Capture in seconds. Zero maintenance. Talk to your knowledge.
            </p>

            <div className={styles.heroActions}>
              <Link
                className={clsx(
                  'button button--primary button--lg',
                  styles.primaryCta,
                )}
                to="/docs/introduction/vision">
                Read the Vision
              </Link>
              <Link
                className={clsx('button button--secondary button--lg')}
                to="/docs/getting-started/installation">
                Get Started
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
              <span className={styles.badge}>AI-native</span>
              <span className={styles.badge}>Zero maintenance</span>
              <span className={styles.badge}>Conversational</span>
              <span className={styles.badge}>Open source</span>
            </div>
          </div>

          <aside className={clsx('card', styles.heroRight)} aria-label="Quick links">
            <div className="card__body">
              <Heading as="h2" className={styles.quickTitle}>
                Start in 10 minutes
              </Heading>
              <ol className={styles.quickList}>
                <li>
                  Understand <strong>why Noderium exists</strong> (Vision)
                </li>
                <li>
                  Learn the <strong>5 design pillars</strong> that make it work
                </li>
                <li>
                  Install and <strong>capture your first note</strong>
                </li>
              </ol>
            </div>
            <div className={clsx('card__footer', styles.quickFooter)}>
              <Link
                className={styles.inlineLink}
                to="/docs/introduction/pillars">
                The Five Pillars →
              </Link>
              <Link
                className={styles.inlineLink}
                to="/docs/introduction/roadmap">
                Product Roadmap →
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
      title="A local-first knowledge system"
      description="Noderium is an AI-native, local-first knowledge management system. Capture in seconds, zero maintenance, talk to your knowledge.">
      <HomepageHeader />
      <main>
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <Heading as="h2" className={styles.sectionTitle}>
                The Three Tensions We Solve
              </Heading>
              <p className={styles.sectionSubtitle}>
                80% of PKM users abandon their tools within 6 months. Not because of missing features—because the cognitive cost exceeds the benefit.
              </p>
            </div>

            <div className={styles.grid}>
              <div className={clsx('card', styles.principleCard)}>
                <div className="card__body">
                  <Heading as="h3" className={styles.cardTitle}>
                    1. The Capture Paradox
                  </Heading>
                  <p className={styles.cardDescription}>
                    You know you need to capture ideas, but manual capture is friction. 
                    <strong> Noderium: Capture in &lt;5 seconds</strong> with ubiquitous entry and auto-enrichment.
                  </p>
                </div>
              </div>
              <div className={clsx('card', styles.principleCard)}>
                <div className="card__body">
                  <Heading as="h3" className={styles.cardTitle}>
                    2. The Maintenance Tax
                  </Heading>
                  <p className={styles.cardDescription}>
                    Users spend 3-5 hours/week organizing—not thinking.
                    <strong> Noderium: Zero maintenance</strong> with AI-driven invisible organization.
                  </p>
                </div>
              </div>
              <div className={clsx('card', styles.principleCard)}>
                <div className="card__body">
                  <Heading as="h3" className={styles.cardTitle}>
                    3. Retrieval Failure
                  </Heading>
                  <p className={styles.cardDescription}>
                    Search has 10% accuracy in personal contexts. Trust erodes.
                    <strong> Noderium: 95%+ success rate</strong> with conversational retrieval.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.sectionCtaRow}>
              <Link
                className={clsx('button button--primary', styles.primaryCta)}
                to="/docs/introduction/vision">
                Read the Full Vision
              </Link>
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.sectionAlt)}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <Heading as="h2" className={styles.sectionTitle}>
                The Five Design Pillars
              </Heading>
              <p className={styles.sectionSubtitle}>
                Architecture, not features. Each pillar reinforces the others to create a system greater than the sum of its parts.
              </p>
            </div>

            <div className={styles.kpiRow}>
              <div className={styles.kpiCard}>
                <div className={styles.kpiValue}>&lt;5 sec</div>
                <div className={styles.kpiLabel}>Capture time</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiValue}>0 hrs</div>
                <div className={styles.kpiLabel}>Weekly maintenance</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiValue}>95%+</div>
                <div className={styles.kpiLabel}>Retrieval success</div>
              </div>
              <div className={styles.kpiCard}>
                <div className={styles.kpiValue}>&lt;10 min</div>
                <div className={styles.kpiLabel}>Time to first value</div>
              </div>
            </div>

            <div className={styles.grid}>
              <CardLink
                title="1. Minimum-Effort Capture"
                to="/docs/introduction/pillars#pillar-1-minimum-effort-capture"
                description={
                  <>
                    Ubiquitous entry, intent recognition, auto-enrichment. From thought to saved in &lt;5 seconds.
                  </>
                }
              />
              <CardLink
                title="2. Invisible Organization"
                to="/docs/introduction/pillars#pillar-2-invisible-organization-ai-driven"
                description={
                  <>
                    AI-driven semantic understanding. Dynamic taxonomy. The system organizes; you just think.
                  </>
                }
              />
              <CardLink
                title="3. Conversational Retrieval"
                to="/docs/introduction/pillars#pillar-3-conversational-retrieval"
                description={
                  <>
                    Talk to your knowledge like a colleague. Intelligent synthesis with transparent sourcing.
                  </>
                }
              />
              <CardLink
                title="4. Ownership & Privacy"
                to="/docs/introduction/pillars#pillar-4-ownership--privacy-local-first"
                description={
                  <>
                    Local-first by default. Open formats. Your data, your machine, your control.
                  </>
                }
              />
              <CardLink
                title="5. Intentional Onboarding"
                to="/docs/introduction/pillars#pillar-5-intentional-onboarding--retention-by-design"
                description={
                  <>
                    Sensible defaults. Guided progression. Aha moment in &lt;10 minutes.
                  </>
                }
              />
              <CardLink
                title="View All Pillars"
                to="/docs/introduction/pillars"
                description={
                  <>
                    See how all five pillars work together to resolve the three fundamental tensions.
                  </>
                }
                meta="Complete guide"
              />
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <Heading as="h2" className={styles.sectionTitle}>
                Documentation
              </Heading>
              <p className={styles.sectionSubtitle}>
                Everything you need to understand, use, and contribute to Noderium.
              </p>
            </div>

            <div className={styles.grid}>
              <CardLink
                title="Vision & Mission"
                to="/docs/introduction/vision"
                description={
                  <>
                    Why Noderium exists. The fundamental problem. Our core beliefs and product vision.
                  </>
                }
                meta="Start here"
              />
              <CardLink
                title="Getting Started"
                to="/docs/getting-started/installation"
                description={
                  <>
                    Installation guide, prerequisites, and your first 10 minutes with Noderium.
                  </>
                }
              />
              <CardLink
                title="Product Roadmap"
                to="/docs/introduction/roadmap"
                description={
                  <>
                    Development phases, timeline, and success metrics. Where we're going.
                  </>
                }
              />
              <CardLink
                title="Market Research"
                to="/docs/discovery/market-research/market-research-index"
                description={
                  <>
                    Competitive landscape, user research, and strategic positioning.
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
                Built with Modern Tech
              </Heading>
              <p className={styles.sectionSubtitle}>
                Designed for extreme performance and developer experience.
              </p>
            </div>

            <div className={styles.grid}>
              <div className={clsx('card', styles.principleCard)}>
                <div className="card__body">
                  <Heading as="h3" className={styles.cardTitle}>
                    Tauri v2
                  </Heading>
                  <p className={styles.cardDescription}>
                    Tiny binaries (~10MB), native security, mobile & desktop from a single codebase.
                  </p>
                </div>
              </div>
              <div className={clsx('card', styles.principleCard)}>
                <div className="card__body">
                  <Heading as="h3" className={styles.cardTitle}>
                    Rust
                  </Heading>
                  <p className={styles.cardDescription}>
                    Zero-copy Markdown parser, async file I/O, memory safety. Blazing fast backend.
                  </p>
                </div>
              </div>
              <div className={clsx('card', styles.principleCard)}>
                <div className="card__body">
                  <Heading as="h3" className={styles.cardTitle}>
                    SolidJS
                  </Heading>
                  <p className={styles.cardDescription}>
                    Fine-grained reactivity without Virtual DOM. Superior performance vs React.
                  </p>
                </div>
              </div>
              <div className={clsx('card', styles.principleCard)}>
                <div className="card__body">
                  <Heading as="h3" className={styles.cardTitle}>
                    SQLite
                  </Heading>
                  <p className={styles.cardDescription}>
                    Relational indexing of knowledge graph. The DB rebuilds itself if deleted—Markdown is truth.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.sectionCtaRow}>
              <Link
                className={clsx('button button--primary', styles.primaryCta)}
                to="/docs/getting-started/installation">
                Get Started
              </Link>
              <Link
                className="button button--secondary"
                href="https://github.com/leal32b/noderium">
                View on GitHub
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
