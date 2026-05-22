import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, action }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
  >
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary tracking-tight">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-theme-muted max-w-xl">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </motion.div>
);

export default PageHeader;
