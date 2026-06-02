import React from 'react';
import { PageSection } from '../types';

interface DynamicSectionProps {
  section: PageSection;
}

const DynamicSection: React.FC<DynamicSectionProps> = ({ section }) => {
  const { config } = section;

  // Compile styles
  const wrapperStyle: React.CSSProperties = {
    backgroundColor: config.bgColor || 'transparent',
    backgroundImage: config.bgUrl ? `url(${config.bgUrl})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    color: config.textColor || 'inherit',
    fontFamily: config.fontFamily || 'inherit',
    position: 'relative',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'black',
    opacity: config.overlayStyle ? Number(config.overlayStyle) : 0,
    zIndex: 1
  };

  // Padding classes
  const paddingMap = {
    small: 'py-8',
    medium: 'py-16 md:py-24',
    large: 'py-24 md:py-32',
  };
  const paddingClass = paddingMap[config.padding as keyof typeof paddingMap] || 'py-16 md:py-24';

  return (
    <section 
      className={`w-full overflow-hidden ${config.animation !== 'none' ? `animate-${config.animation}` : ''}`} 
      style={wrapperStyle}
      id={`section-${section.id}`}
    >
      {/* Overlay */}
      {config.bgUrl && <div style={overlayStyle} />}

      {/* Content Container */}
      <div className={`relative z-10 max-w-7xl mx-auto px-6 ${paddingClass}`}>
        <div 
           className="w-full max-w-none prose prose-lg !text-current [&_h1]:!text-current [&_h2]:!text-current [&_h3]:!text-current [&_p]:!text-current [&_a]:!text-current"
           dangerouslySetInnerHTML={{ __html: config.content }}
        />
      </div>
    </section>
  );
};

export default DynamicSection;
