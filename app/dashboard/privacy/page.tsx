"use client";

import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Shield } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function PrivacyPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5 max-w-3xl">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent-gold" /> Privacy Policy
        </h1>
        <p className="text-sm text-text-muted">Last updated: June 27, 2026</p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">1. Introduction</h2>
            <p>
              AOT Analyzer Bot (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates the AOT trading dashboard and
              Telegram bot (collectively, the &quot;Service&quot;). This Privacy Policy explains how we collect, use,
              and protect your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">2. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account Data:</strong> Telegram user ID and username when you interact with our bot.</li>
              <li><strong>Trade Data:</strong> Journal entries, trade logs, and analytics you voluntarily submit.</li>
              <li><strong>Usage Data:</strong> Page views, feature interactions, and chart analysis requests.</li>
              <li><strong>Local Storage:</strong> Dashboard preferences (theme, sidebar state, balance) stored in your browser.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain the Service (real-time dashboard, signal delivery, journal storage).</li>
              <li>To generate personalized risk analysis and trading insights via AI models.</li>
              <li>To improve the Service through aggregated analytics (Vercel Analytics, no personal data).</li>
              <li>To communicate with you via Telegram for signal updates and bot interactions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">4. Data Storage &amp; Security</h2>
            <p>
              Trade data and journal entries are stored in Google Firestore with encryption at rest.
              We implement industry-standard security measures including Firebase Security Rules that
              restrict access to your personal data. Your balance and preferences are stored locally
              in your browser and are never transmitted to our servers unless explicitly submitted.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">5. Third-Party Services</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Google Firebase</strong> (Firestore, authentication) — data storage and sync.</li>
              <li><strong>NVIDIA NIM</strong> — AI-powered risk analysis and chart vision analysis.</li>
              <li><strong>Vercel</strong> — hosting and analytics (anonymized).</li>
              <li><strong>Telegram</strong> — bot messaging platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">6. Data Retention</h2>
            <p>
              You can delete your journal entries and trade data at any time through the dashboard.
              Backup data in Firestore may be retained for up to 30 days after deletion.
              Telegram message history is subject to Telegram&apos;s own data retention policies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">7. Your Rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access and export your data at any time.</li>
              <li>Delete your account and associated data by contacting us.</li>
              <li>Opt out of analytics via browser settings (Do Not Track).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">8. Contact</h2>
            <p>
              For privacy-related inquiries, contact us via the Telegram bot
              at <a href="https://t.me/aot_analyzer_bot" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:underline">@aot_analyzer_bot</a>.
            </p>
          </section>
        </Card>
      </motion.div>
    </motion.div>
  );
}
