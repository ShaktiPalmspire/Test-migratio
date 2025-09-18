'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import Heading from '../components/Headings/heading';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
      } catch (error) {
        console.error('Error getting session:', error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen w-full bg-[var(--migratio_bg_light)] text-[var(--migratio_text)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[var(--migratio_bg_light)] text-[var(--migratio_text)]">
      {/* Header */}
      <header className="fixed w-full z-50 bg-[var(--migratio_white)] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[var(--migratio_headings)] no-underline hover:no-underline migratio-link">Migratio</Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="hover:underline">Features</Link>
            <Link href="#how-it-works" className="hover:underline">How it Works</Link>
            <Link href="#contact" className="hover:underline">Contact</Link>
            {!isLoggedIn ? (
              <>
                <Link href="/auth/login" className="button primary">Login</Link>
                <Link href="/auth/register" className="button primary">Register</Link>
              </>
            ) : (
                             <Link href="/dashboard/1" className="button primary">Dashboard</Link>
            )}
          </nav>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6 text-[var(--migratio_text)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-[var(--migratio_white)] px-6 py-4 shadow space-y-4">
            <Link href="#features" className="block hover:underline">Features</Link>
            <Link href="#how-it-works" className="block hover:underline">How it Works</Link>
            <Link href="#contact" className="block hover:underline">Contact</Link>
            {!isLoggedIn ? (
              <>
                <Link href="/auth/login" className="block button primary w-full text-center">Login</Link>
                <Link href="/auth/register" className="block button primary w-full text-center">Register</Link>
              </>
            ) : (
                             <Link href="/dashboard/1" className="block button primary w-full text-center">Dashboard</Link>
            )}
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 bg-[var(--migratio_tertiary)]">
        <div className="max-w-[1200px] mx-auto text-center">
          <Heading as="h1" className="text-[var(--migratio_headings)] font-semibold leading-tight mb-6 text-4xl md:text-5xl">
            Seamless CRM Migration to HubSpot
          </Heading>
          <p className="p_large max-w-2xl mx-auto text-[var(--migratio_text)] mb-8">
            Migratio is your dedicated migration assistant — moving CRM data from Pipedrive, Zoho, Zendesk, and Freshsales to HubSpot with no spreadsheets, no hassle, and no data loss.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
                         <Link href="/dashboard/1" className="button primary">Get Started</Link>
            <Link href="/auth/register" className="button secondary">Learn More</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-[var(--migratio_white)]">
        <div className="max-w-[1200px] mx-auto text-center">
          <Heading as="h2" className="text-[var(--migratio_headings)] font-semibold mb-12 text-3xl">
            Why Choose Migratio?
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
            {[
              {
                title: 'API-Driven and Secure',
                desc: 'Built with OAuth and encryption by default. No data is stored — ever.'
              },
              {
                title: 'Full Custom Object Support',
                desc: 'Contacts, companies, deals, notes, tasks, and all custom objects — mapped and migrated.'
              },
              {
                title: 'No CSVs. No Manual Work.',
                desc: 'Fully automated migration experience that’s as easy as logging in and clicking migrate.'
              }
            ].map(({ title, desc }) => (
              <div key={title}>
                <Heading as="h3" className="text-[var(--migratio_headings)] font-medium mb-4">{title}</Heading>
                <p className="p_medium text-[var(--migratio_text)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-[var(--migratio_tertiary)]">
        <div className="max-w-[1200px] mx-auto text-center">
          <Heading as="h2" className="text-[var(--migratio_headings)] font-semibold mb-12 text-3xl">
            How It Works
          </Heading>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            {[
              { title: '1. Connect', desc: 'Authenticate your source CRM and HubSpot using secure OAuth.' },
              { title: '2. Map', desc: 'Customize how standard and custom fields map into HubSpot.' },
              { title: '3. Preview', desc: 'Review a safe preview of the structure before confirming migration.' },
              { title: '4. Migrate', desc: 'Launch batch migration and track progress with logs and reports.' }
            ].map(({ title, desc }) => (
              <div key={title}>
                <Heading as="h4" className="text-[var(--migratio_headings)] font-medium mb-2">{title}</Heading>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 bg-[var(--migratio_white)]">
        <div className="max-w-[800px] mx-auto text-center">
          <Heading as="h2" className="text-[var(--migratio_headings)] font-semibold mb-6 text-3xl">
            Have Questions?
          </Heading>
          <p className="p_large text-[var(--migratio_text)] mb-8">
            We’re here to help with anything related to CRM migration or setting up Migratio.
          </p>
          <Link href="mailto:support@migratio.com" className="button primary">Contact Support</Link>
        </div>
      </section>
    </main>
  );
}
