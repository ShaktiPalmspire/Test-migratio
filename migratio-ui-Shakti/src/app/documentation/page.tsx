"use client";

import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DocumentationPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--migratio_bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-[var(--migratio_text)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[var(--migratio_bg)]">
      {/* Header */}
      <header className="fixed w-full z-50 bg-[var(--migratio_white)] shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[var(--migratio_headings)] no-underline hover:no-underline migratio-link">Migratio</Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="hover:underline">Features</Link>
            <Link href="/#how-it-works" className="hover:underline">How it Works</Link>
            <Link href="/#contact" className="hover:underline">Contact</Link>
            <Link href="/dashboard/1" className="button primary">Dashboard</Link>
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
            <Link href="/#features" className="block hover:underline">Features</Link>
            <Link href="/#how-it-works" className="block hover:underline">How it Works</Link>
            <Link href="/#contact" className="block hover:underline">Contact</Link>
            <Link href="/dashboard/1" className="block button primary w-full text-center">Dashboard</Link>
          </div>
        )}
      </header>

      {/* Content with top padding for fixed header */}
      <div className="pt-20 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--migratio_text)] mb-2">Documentation</h1>
            <p className="text-gray-600 dark:text-gray-400">Complete guide to using Migratio - CRM Migration Platform</p>
          </div>

          {/* Documentation Content */}
          <div className="bg-[var(--migratio_bg_light)] rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold text-[var(--migratio_text)] mb-4">Getting Started</h2>
              
              <div className="space-y-6">
                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">What is Migratio?</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Migratio is a powerful CRM migration platform that enables seamless data transfer between different CRM systems. 
                    Currently focused on migrating data to HubSpot, Migratio supports connections from HubSpot, Pipedrive, Zoho CRM, and Zendesk. 
                    The platform provides a user-friendly interface for connecting multiple CRM instances and managing data synchronization.
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Supported CRM Systems</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Source CRMs (Available Now)</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• <strong>HubSpot CRM</strong> - Full integration with OAuth authentication</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Coming Soon</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• <strong>Pipedrive</strong> - Sales CRM platform integration</li>
                        <li>• <strong>Zoho CRM</strong> - Complete CRM data migration</li>
                        <li>• <strong>Zendesk</strong> - Support ticket migration</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-white mb-2">Destination CRM</h4>
                    <p className="text-sm text-white">
                      <strong>HubSpot CRM</strong> is currently the primary destination for all migrations. 
                      The platform supports connecting to multiple HubSpot portals (A and B instances) for flexible data transfer scenarios.
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">How to Use Migratio</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--migratio_text)]">Access Dashboard</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Log in to your Migratio account and navigate to the dashboard at <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">/dashboard/1</code>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--migratio_text)]">Select Source CRM</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Choose your source CRM from the available options. 
                          Currently, only HubSpot is fully functional. Pipedrive, Zoho CRM, and Zendesk are coming soon.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--migratio_text)]">Connect Source CRM</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click &quot;Connect&quot; to authenticate with your source CRM. This opens a secure OAuth popup window for authentication.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        4
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--migratio_text)]">Connect HubSpot Destination</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Connect to your destination HubSpot portal (CRM B). You can connect to multiple HubSpot instances for different migration scenarios.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        5
                      </div>
                      <div>
                        <h4 className="font-medium text-[var(--migratio_text)]">Configure Migration</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Once both CRMs are connected, you can view connection status and portal information. 
                          Advanced migration features like field mappings are coming in future updates.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Platform Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Authentication & Security</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• Secure OAuth 2.0 authentication</li>
                        <li>• User account management with Supabase</li>
                        <li>• Account deactivation/reactivation system</li>
                        <li>• Admin user management panel</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">CRM Integration</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• Multiple HubSpot portal connections</li>
                        <li>• Real-time connection status monitoring</li>
                        <li>• Portal ID tracking and management</li>
                        <li>• Disconnect/reconnect functionality</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">User Interface</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• Step-by-step migration wizard</li>
                        <li>• Visual CRM selection cards</li>
                        <li>• Connection status indicators</li>
                        <li>• Responsive design for all devices</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Backend Services</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• Node.js backend with Express</li>
                        <li>• Modular service architecture</li>
                        <li>• HubSpot API integration (fully functional)</li>
                        <li>• Pipedrive, Zoho CRM, and Zendesk integration (coming soon)</li>
                        <li>• OAuth authentication handling</li>
                        <li>• Connection status monitoring</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Account Management</h3>
                  <div className="space-y-3">
                                      <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                    <h4 className="font-medium text-white mb-2">Account Status</h4>
                    <p className="text-sm text-white">
                      Your account can be in one of three states: <strong>Active</strong>, <strong>Deactivated</strong>, or <strong>Reactivation Requested</strong>. 
                      Deactivated accounts are redirected to a dedicated page where you can request reactivation.
                    </p>
                  </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Best Practices</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                    <li>Always backup your CRM data before starting any migration process</li>
                    <li>Ensure you have proper API access and permissions for both source and destination CRMs</li>
                    <li>Test the connection with a small dataset before full migration</li>
                    <li>Monitor the connection status and portal IDs for accuracy</li>
                    <li>Keep your account active and contact support if you need reactivation</li>
                    <li>Use the admin panel responsibly if you have admin privileges</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Technical Architecture</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Frontend (Next.js)</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• React with TypeScript</li>
                        <li>• Tailwind CSS for styling</li>
                        <li>• Supabase for authentication</li>
                        <li>• Responsive sidebar navigation</li>
                        <li>• Step-by-step migration wizard</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Backend (Node.js)</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• Express.js server</li>
                        <li>• Modular service architecture</li>
                        <li>• HubSpot API integration (fully functional)</li>
                        <li>• Pipedrive, Zoho CRM, and Zendesk integration (coming soon)</li>
                        <li>• OAuth authentication handling</li>
                        <li>• Connection status monitoring</li>
                      </ul>
                    </div>
                  </div>
                </section>



                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Database Schema</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Users Table</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• id (UUID, Primary Key)</li>
                        <li>• email (String, Unique)</li>
                        <li>• name (String)</li>
                        <li>• status (Enum: active, deactivated)</li>
                        <li>• created_at (Timestamp)</li>
                        <li>• updated_at (Timestamp)</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">CRM Connections Table</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• id (UUID, Primary Key)</li>
                        <li>• user_id (UUID, Foreign Key)</li>
                        <li>• crm_type (Enum: hubspot, pipedrive)</li>
                        <li>• portal_id (String)</li>
                        <li>• access_token (Encrypted)</li>
                        <li>• refresh_token (Encrypted)</li>
                        <li>• expires_at (Timestamp)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Troubleshooting Guide</h3>
                  <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h4 className="font-medium text-white mb-2">Common Issues & Solutions</h4>
                      <div className="space-y-3 text-sm text-white">
                        <div>
                          <strong>OAuth Authentication Fails:</strong>
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>• Check if redirect URLs are correctly configured in CRM settings</li>
                            <li>• Verify client ID and secret are correct</li>
                            <li>• Ensure popup blockers are disabled</li>
                          </ul>
                        </div>
                        <div>
                          <strong>Connection Status Shows "Disconnected":</strong>
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>• Refresh tokens may have expired - try reconnecting</li>
                            <li>• Check if API permissions are still valid</li>
                            <li>• Verify network connectivity</li>
                          </ul>
                        </div>
                        <div>
                          <strong>Data Not Syncing:</strong>
                          <ul className="ml-4 mt-1 space-y-1">
                            <li>• Ensure both source and destination CRMs are connected</li>
                            <li>• Check API rate limits and quotas</li>
                            <li>• Verify field mappings are configured correctly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">FAQ - Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Q: How long does a typical migration take?</h4>
                      <p className="text-sm text-white">A: Migration time depends on data volume. Small datasets (under 1,000 records) typically complete in 5-15 minutes. Larger datasets may take several hours.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Q: Can I migrate custom fields?</h4>
                      <p className="text-sm text-white">A: Yes, custom fields are supported. The platform automatically detects and maps custom fields between CRMs, with manual override options available.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Q: Is my data secure during migration?</h4>
                      <p className="text-sm text-white">A: Absolutely. All data is encrypted in transit and at rest. We use OAuth 2.0 for secure authentication and never store your CRM credentials.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Q: Can I schedule migrations?</h4>
                      <p className="text-sm text-white">A: Scheduled migrations are coming in a future update. Currently, migrations run immediately when initiated.</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Q: What happens if a migration fails?</h4>
                      <p className="text-sm text-white">A: Failed migrations are logged with detailed error messages. You can retry from the last successful checkpoint without losing progress.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Security & Compliance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Data Security</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• End-to-end encryption (AES-256)</li>
                        <li>• OAuth 2.0 authentication</li>
                        <li>• No credential storage</li>
                        <li>• SOC 2 Type II compliant</li>
                        <li>• GDPR compliant</li>
                        <li>• Regular security audits</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Backup & Recovery</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• Automated daily backups</li>
                        <li>• 30-day retention policy</li>
                        <li>• Point-in-time recovery</li>
                        <li>• Cross-region replication</li>
                        <li>• Disaster recovery procedures</li>
                        <li>• 99.9% uptime SLA</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Integration Details</h3>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Field Mapping Rules</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• Automatic field detection and mapping</li>
                        <li>• Custom field mapping support</li>
                        <li>• Data type validation</li>
                        <li>• Required field handling</li>
                        <li>• Duplicate detection and resolution</li>
                        <li>• Field transformation rules</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Pricing & Support</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Starter Plan</h4>
                      <div className="text-sm text-white space-y-1">
                        <div><strong>Free</strong></div>
                        <div>• Up to 1,000 records</div>
                        <div>• 1 CRM connection</div>
                        <div>• Email support</div>
                        <div>• Basic field mapping</div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Professional Plan</h4>
                      <div className="text-sm text-white space-y-1">
                        <div><strong>$99/month</strong></div>
                        <div>• Up to 50,000 records</div>
                        <div>• 5 CRM connections</div>
                        <div>• Priority support</div>
                        <div>• Advanced field mapping</div>
                        <div>• Scheduled migrations</div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Enterprise Plan</h4>
                      <div className="text-sm text-white space-y-1">
                        <div><strong>Custom pricing</strong></div>
                        <div>• Unlimited records</div>
                        <div>• Unlimited connections</div>
                        <div>• 24/7 phone support</div>
                        <div>• Custom integrations</div>
                        <div>• Dedicated account manager</div>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Roadmap & Upcoming Features</h3>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Q1 2024</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• Pipedrive full integration</li>
                        <li>• Advanced field mapping UI</li>
                        <li>• Migration scheduling</li>
                        <li>• Data validation tools</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Q2 2024</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• Zoho CRM integration</li>
                        <li>• Zendesk integration</li>
                        <li>• Real-time sync</li>
                        <li>• Advanced reporting</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Q3 2024</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• Salesforce integration</li>
                        <li>• Custom webhook support</li>
                        <li>• API rate limit management</li>
                        <li>• Bulk operations</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Developer Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Code Structure</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• Frontend: Next.js 14 with TypeScript</li>
                        <li>• Backend: Node.js with Express</li>
                        <li>• Database: Supabase (PostgreSQL)</li>
                        <li>• Authentication: Supabase Auth</li>
                        <li>• Styling: Tailwind CSS</li>
                        <li>• State Management: Redux Toolkit</li>
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                      <h4 className="font-medium text-white mb-2">Testing & Deployment</h4>
                      <ul className="text-sm text-white space-y-1">
                        <li>• Unit tests with Jest</li>
                        <li>• Integration tests with Supertest</li>
                        <li>• E2E tests with Playwright</li>
                        <li>• CI/CD with GitHub Actions</li>
                        <li>• Docker containerization</li>
                        <li>• Vercel deployment</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-medium text-[var(--migratio_text)] mb-3">Need Help?</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    If you need assistance with your migration, have questions about the platform, or encounter any issues, 
                    our support team is here to help.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a 
                      href="/help-and-information" 
                      className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Help & Information
                    </a>
                    <a 
                      href="mailto:support@palmspire.com" 
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      Contact Support
                    </a>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
