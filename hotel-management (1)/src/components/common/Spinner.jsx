import PropTypes from 'prop-types';
import './Spinner.css';

/**
 * Spinner Component
 * Displays a simple CSS loading spinner.
 * 
 * Props:
 *  - size (string): 'sm' | 'md' | 'lg' (default: 'md') - Controls the size of the spinner.
 *  - color (string): CSS color value (default: uses CSS variable --primary-color or a fallback)
 *  - thickness (string): Border thickness (default: '2px')
 */
const Spinner = ({ size = 'md', color, thickness = '2px' }) => {
  const spinnerStyle = {
    borderColor: color ? `${color} transparent transparent transparent` : undefined,
    borderWidth: thickness,
  };

  // Add specific class for size
  const sizeClass = `spinner-${size}`;

  return (
    <div 
      className={`spinner ${sizeClass}`}
      style={spinnerStyle}
      role="status" 
      aria-live="polite"
      aria-label="Đang tải"
    ></div>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  color: PropTypes.string,
  thickness: PropTypes.string,
};

export default Spinner; 