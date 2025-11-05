// Create a new file: src/utils/seedInstitutions.js
import { db } from '../services/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export const seedInstitutions = async () => {
  const institutions = [
    {
      id: '8AXHqRizsRYKnC8t1nkz',
      name: 'National University of Lesotho',
      location: 'Roma, Lesotho',
      description: 'Premier higher education institution in Lesotho offering various undergraduate and postgraduate programs.',
      email: 'admissions@nul.ls',
      phone: '+266 22340601',
      website: 'https://www.nul.ls',
      status: 'active',
      type: 'public',
      accreditation: 'fully_accredited',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'iHbJJZKBZuN54W9gox9S',
      name: 'Limkokwing University of Creative Technology',
      location: 'Maseru, Lesotho',
      description: 'International university focusing on creative industries and technology education with global campuses.',
      email: 'info@limkokwing.ls',
      phone: '+266 22313721',
      website: 'https://www.limkokwing.ls',
      status: 'active',
      type: 'private',
      accreditation: 'fully_accredited',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'esdjtrLIHrsyfqaCgL5Q',
      name: 'Botho University',
      location: 'Maseru, Lesotho',
      description: 'Private university specializing in business, computing and accounting programs with international standards.',
      email: 'admissions@bothocollege.ls',
      phone: '+266 22325832',
      website: 'https://www.bothocollege.ls',
      status: 'active',
      type: 'private',
      accreditation: 'fully_accredited',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'PoRBPDBiYxE0KnkOWwOh',
      name: 'Lesotho College of Education',
      location: 'Maseru, Lesotho',
      description: 'Premier teacher training institution producing qualified educators for Lesotho schools and colleges.',
      email: 'info@lce.ac.ls',
      phone: '+266 22320761',
      website: 'https://www.lce.ac.ls',
      status: 'active',
      type: 'public',
      accreditation: 'fully_accredited',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'LHSe8kRizsRYknC8t1nkA',
      name: 'Lesotho Agricultural College',
      location: 'Maseru, Lesotho',
      description: 'Specialized institution focusing on agricultural sciences and farming technologies.',
      email: 'admissions@agricollege.ls',
      phone: '+266 22315678',
      website: 'https://www.agricollege.ls',
      status: 'active',
      type: 'public',
      accreditation: 'fully_accredited',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  try {
    for (const institution of institutions) {
      await setDoc(doc(db, 'institutions', institution.id), institution);
      console.log(`✅ Added institution: ${institution.name}`);
    }
    console.log('🎉 All institutions seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding institutions:', error);
  }
};

// Run this function once to seed your database
// seedInstitutions();