import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/intro">
            Get Started →
          </Link>
        </div>
      </div>
    </header>
  );
}

function ModuleCard({title, description, link, weeks}) {
  return (
    <div className="col col--6">
      <div className="card margin--md">
        <div className="card__header">
          <h3>{title}</h3>
          <p className="badge badge--primary">{weeks}</p>
        </div>
        <div className="card__body">
          <p>{description}</p>
        </div>
        <div className="card__footer">
          <Link className="button button--primary button--block" to={link}>
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="A comprehensive educational textbook for Physical AI and Humanoid Robotics">
      <HomepageHeader />
      <main>
        <section className="container margin-vert--lg">
          <div className="row">
            <div className="col">
              <h2 className="text--center">Four Core Modules</h2>
              <p className="text--center margin-bottom--lg">
                A structured 13-week journey from digital AI to embodied intelligence
              </p>
            </div>
          </div>
          <div className="row">
            <ModuleCard
              title="Module 1: ROS 2 Fundamentals"
              description="Learn the Robotic Nervous System - nodes, topics, services, and the foundation of robotic middleware."
              link="/modules/module1-overview"
              weeks="Weeks 1-3"
            />
            <ModuleCard
              title="Module 2: Gazebo & Unity Simulation"
              description="Master the Digital Twin - physics simulation with Gazebo and photorealistic rendering with Unity."
              link="/modules/module2-overview"
              weeks="Weeks 4-6"
            />
            <ModuleCard
              title="Module 3: NVIDIA Isaac Platform"
              description="Build the AI-Robot Brain - Isaac Sim, hardware-accelerated VSLAM, and Nav2 path planning."
              link="/modules/module3-overview"
              weeks="Weeks 7-10"
            />
            <ModuleCard
              title="Module 4: Vision-Language-Action"
              description="Create Multimodal Intelligence - integrate Whisper, GPT-4, and ROS 2 for autonomous robots."
              link="/modules/module4-overview"
              weeks="Weeks 11-13"
            />
          </div>
        </section>

        <section className="hero hero--dark margin-top--lg">
          <div className="container">
            <div className="row">
              <div className="col col--8 col--offset-2">
                <h2 className="text--center">Ready to Begin?</h2>
                <p className="text--center">
                  Start your journey into Physical AI with our comprehensive course materials,
                  hands-on labs, and real-world robotics projects.
                </p>
                <div className="text--center margin-top--md">
                  <Link
                    className="button button--secondary button--lg"
                    to="/getting-started/prerequisites">
                    View Prerequisites
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
