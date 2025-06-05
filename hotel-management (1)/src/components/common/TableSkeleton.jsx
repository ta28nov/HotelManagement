import React from 'react';
import './TableSkeleton.css';

/**
 * TableSkeleton Component
 *
 * Displays a skeleton loading state for tables.
 *
 * Props:
 * - columns (number | Array<string | object>): Number of columns or an array of column definitions.
 *                                               If array, can use it to estimate widths or headers.
 * - rows (number, optional): Number of skeleton rows to display. Defaults to 5.
 * - className (string, optional): Additional class name for the container.
 * - showHeader (boolean, optional): Whether to show a skeleton header row. Defaults to true.
 */
const TableSkeleton = ({ columns, rows = 5, className = '', showHeader = true }) => {
  const numCols = Array.isArray(columns) ? columns.length : typeof columns === 'number' ? columns : 5; // Default to 5 columns if invalid prop

  const renderSkeletonCell = (key) => (
    <td key={key}>
      <div className="skeleton-line"></div>
    </td>
  );

  const renderSkeletonRow = (key) => (
    <tr key={key}>
      {Array.from({ length: numCols }).map((_, index) => renderSkeletonCell(index))}
    </tr>
  );

  return (
    <div className={`skeleton-table-container ${className}`}>
      <table className="skeleton-table">
        {showHeader && (
          <thead>
            <tr>
              {Array.from({ length: numCols }).map((_, index) => (
                <th key={index}>
                  <div className="skeleton-line skeleton-header"></div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, index) => renderSkeletonRow(index))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton; 