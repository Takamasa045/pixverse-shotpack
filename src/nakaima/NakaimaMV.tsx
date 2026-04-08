import '@fontsource/bebas-neue/400.css';
import '@fontsource/noto-sans-jp/500.css';
import '@fontsource/noto-sans-jp/700.css';
import React from 'react';
import {Audio} from '@remotion/media';
import {AbsoluteFill, Sequence, staticFile} from 'remotion';
import {
  getSectionStartFrame,
  nakaimaSections,
  sectionDurationInFrames,
  type NakaimaSection,
} from './data';
import {GlobalChrome} from './components/GlobalChrome';
import {BridgeSection} from './sections/BridgeSection';
import {HookSection} from './sections/HookSection';
import {IntroSection} from './sections/IntroSection';
import {OutroSection} from './sections/OutroSection';
import {VerseSection} from './sections/VerseSection';

const componentForSection = (section: NakaimaSection) => {
  switch (section.variant) {
    case 'intro':
      return IntroSection;
    case 'hook':
      return HookSection;
    case 'verse':
      return VerseSection;
    case 'bridge':
      return BridgeSection;
    case 'outro':
      return OutroSection;
    default:
      return VerseSection;
  }
};

export const NakaimaMV: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: '#02040a'}}>
      <Audio src={staticFile('nakaima/audio/nakaima.wav')} />

      {nakaimaSections.map((section) => {
        const Component = componentForSection(section);

        return (
          <Sequence
            key={section.id}
            from={getSectionStartFrame(section)}
            durationInFrames={sectionDurationInFrames(section)}
            layout="none"
          >
            <Component section={section} />
          </Sequence>
        );
      })}

      <GlobalChrome />
    </AbsoluteFill>
  );
};
