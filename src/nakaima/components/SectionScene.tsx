import React from 'react';
import type {NakaimaSection} from '../data';
import {CosmicBackdrop} from './CosmicBackdrop';
import {KineticAccent} from './KineticAccent';
import {LyricSubtitle} from './LyricSubtitle';

export const SectionScene: React.FC<{section: NakaimaSection}> = ({section}) => {
  return (
    <>
      <CosmicBackdrop section={section} />
      <KineticAccent
        sectionStartSec={section.startSec}
        accents={section.accents}
        accent={section.accent}
        accentSoft={section.accentSoft}
      />
      <LyricSubtitle sectionId={section.id} sectionStartSec={section.startSec} accent={section.accent} />
    </>
  );
};
