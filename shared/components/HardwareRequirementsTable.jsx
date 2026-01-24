import React from 'react';
import clsx from 'clsx';

/**
 * HardwareRequirementsTable Component
 *
 * Displays hardware requirements in a consistent table format across all modules
 * WCAG 2.1 AA compliant with proper semantic HTML and ARIA labels
 *
 * @param {Object} props
 * @param {Array} props.requirements - Array of requirement objects
 * @param {string} props.caption - Optional table caption
 */
export default function HardwareRequirementsTable({ requirements, caption }) {
  if (!requirements || requirements.length === 0) {
    return null;
  }

  return (
    <table
      className={clsx('hardware-requirements-table', 'table')}
      aria-label={caption || 'Hardware Requirements'}
    >
      {caption && <caption>{caption}</caption>}
      <thead>
        <tr>
          <th scope="col">Component</th>
          <th scope="col">Minimum</th>
          <th scope="col">Recommended</th>
          <th scope="col">Cloud Alternative</th>
        </tr>
      </thead>
      <tbody>
        {requirements.map((req, index) => (
          <tr key={index}>
            <th scope="row">{req.component}</th>
            <td>{req.minimum}</td>
            <td>{req.recommended}</td>
            <td>{req.cloudAlternative || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Example usage:
 *
 * const requirements = [
 *   {
 *     component: 'GPU',
 *     minimum: 'RTX 3060 (8GB VRAM)',
 *     recommended: 'RTX 4070 Ti (12GB VRAM)',
 *     cloudAlternative: 'AWS g5.2xlarge'
 *   },
 *   {
 *     component: 'CPU',
 *     minimum: 'Intel i7 13th Gen',
 *     recommended: 'AMD Ryzen 9',
 *     cloudAlternative: null
 *   }
 * ];
 *
 * <HardwareRequirementsTable
 *   requirements={requirements}
 *   caption="Module 3 Hardware Requirements"
 * />
 */
