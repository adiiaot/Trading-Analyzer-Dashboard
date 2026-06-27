"use client";

import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { FileText } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function TermsPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={container} className="space-y-5 max-w-3xl">
      <motion.div variants={item}>
        <h1 className="text-lg md:text-xl font-bold text-text-primary flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent-gold" /> Terms &amp; Conditions
        </h1>
        <p className="text-sm text-text-muted">Last updated: June 27, 2026</p>
      </motion.div>

      <motion.div variants={item}>
        <Card className="space-y-4 text-sm text-text-secondary leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the AOT Analyzer Bot dashboard and Telegram bot (the &quot;Service&quot;),
              you agree to be bound by these Terms &amp; Conditions. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">2. Description of Service</h2>
            <p>
              AOT provides a real-time XAU/USD trading dashboard with signal generation, trade journaling,
              analytics, AI-powered risk analysis, and educational tools. The Service is for informational
              and educational purposes only and does not constitute financial advice.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">3. No Financial Advice</h2>
            <p>
              <strong>Disclaimer:</strong> All signals, analysis, and recommendations provided by the Service
              are for informational and educational purposes only. They are not intended as investment advice,
              solicitation, or an offer to buy or sell any financial instrument. Trading foreign exchange
              (FX) and commodities carries significant risk. Past performance is not indicative of future
              results. You alone assume the sole responsibility of evaluating the merits and risks associated
              with using any information provided.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">4. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must be at least 18 years old to use the Service.</li>
              <li>You are responsible for maintaining the confidentiality of any credentials.</li>
              <li>You agree not to use the Service for any unlawful purpose.</li>
              <li>You acknowledge that trading involves financial risk and you trade at your own risk.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">5. Intellectual Property</h2>
            <p>
              The Service, including its code, design, signal generation algorithms, and content,
              is proprietary to AOT. You may not copy, modify, distribute, or reverse-engineer any
              part of the Service without explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">6. Limitation of Liability</h2>
            <p>
              In no event shall AOT, its developers, or affiliates be liable for any indirect, incidental,
              special, consequential, or punitive damages arising out of or related to your use of the
              Service, including but not limited to trading losses, data loss, or service interruption.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">7. Service Availability</h2>
            <p>
              We strive for 99.9% uptime but do not guarantee uninterrupted access. The Service may be
              temporarily unavailable for maintenance, updates, or due to factors beyond our control
              (third-party API outages, network issues, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">8. Termination</h2>
            <p>
              We reserve the right to suspend or terminate access to the Service at any time without
              notice for violations of these terms or for any other reason. Upon termination, your
              data may be deleted within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">9. Changes to Terms</h2>
            <p>
              We may update these Terms &amp; Conditions from time to time. Continued use of the Service
              after changes constitutes acceptance of the new terms. We will notify users of material
              changes via the Telegram bot.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-text-primary mb-2">10. Contact</h2>
            <p>
              For questions about these terms, contact us via Telegram
              at <a href="https://t.me/aot_analyzer_bot" target="_blank" rel="noopener noreferrer" className="text-accent-gold hover:underline">@aot_analyzer_bot</a>.
            </p>
          </section>
        </Card>
      </motion.div>
    </motion.div>
  );
}
