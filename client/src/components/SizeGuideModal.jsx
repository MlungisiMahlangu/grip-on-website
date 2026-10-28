import { useEffect, useRef } from 'react';

export default function SizeGuideModal({ onClose }) {
  const overlayRef = useRef(null);

  // Close on Escape key.
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Close on overlay click.
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose();
  }

  return (
    <div className="size-guide-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="size-guide-modal" role="dialog" aria-modal="true" aria-label="Size guide">
        <button className="size-guide-close" onClick={onClose} aria-label="Close size guide">
          &times;
        </button>
        <h3>Size Guide</h3>
        <table>
          <thead>
            <tr>
              <th>Size</th>
              <th>Chest (cm)</th>
              <th>Length (cm)</th>
              <th>Sleeve (cm)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>S</td>
              <td>96</td>
              <td>68</td>
              <td>20</td>
            </tr>
            <tr>
              <td>M</td>
              <td>102</td>
              <td>71</td>
              <td>21</td>
            </tr>
            <tr>
              <td>L</td>
              <td>108</td>
              <td>74</td>
              <td>22</td>
            </tr>
            <tr>
              <td>XL</td>
              <td>114</td>
              <td>77</td>
              <td>23</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
