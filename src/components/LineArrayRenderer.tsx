import React from 'react';

interface LineArrayRendererProps {
  lines: string[];
  className?: string;
  hasTrademark?: boolean;
}

export const LineArrayRenderer: React.FC<LineArrayRendererProps> = ({
  lines,
  className = '',
  hasTrademark = false,
}) => {
  return (
    <div className={className}>
      {lines.map((line, idx) => {
        if (hasTrademark && line.includes('®')) {
          const parts = line.split('®');
          return (
            <div key={idx} className="line-item">
              {parts.map((part, pIdx) => (
                <React.Fragment key={pIdx}>
                  {part}
                  {pIdx < parts.length - 1 && (
                    <span
                      className="registered-mark"
                      style={{
                        position: 'relative',
                        top: '-0.35em',
                        fontSize: '0.66em',
                        lineHeight: 0,
                      }}
                    >
                      ®
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          );
        }
        return (
          <div key={idx} className="line-item">
            {line}
          </div>
        );
      })}
    </div>
  );
};
