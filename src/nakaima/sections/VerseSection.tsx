import React from 'react';
import type {NakaimaSection} from '../data';
import {SectionScene} from '../components/SectionScene';

export const VerseSection: React.FC<{section: NakaimaSection}> = ({section}) => {
  return <SectionScene section={section} />;
};
