import React, { useEffect, useState } from 'react';

interface AdminTopProgressBarProps {
  isNavigating: boolean;
}

export const AdminTopProgressBar: React.FC<AdminTopProgressBarProps> = ({ isNavigating }) => {
  const [progress, setProgress] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;

    if (isNavigating) {
      setVisible(true);
      setProgress(25);
      t1 = setTimeout(() => {
        setProgress(75);
      }, 80);
    } else if (visible) {
      setProgress(100);
      t2 = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 240);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isNavigating, visible]);

  if (!visible && progress === 0) return null;

  return (
    <div className="cmd-top-progress-container" aria-hidden="true">
      <div 
        className="cmd-top-progress-bar"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
};
