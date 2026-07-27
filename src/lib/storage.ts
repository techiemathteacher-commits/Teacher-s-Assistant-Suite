import { ClassRoster, AppSettings, ReviewSet } from '../types';

const STORAGE_KEY_ROSTERS = 'teacher_app_rosters_v1';
const STORAGE_KEY_ACTIVE_CLASS = 'teacher_app_active_class_v1';
const STORAGE_KEY_SETTINGS = 'teacher_app_settings_v1';
const STORAGE_KEY_REVIEW_SETS = 'teacher_app_review_sets_v1';

export const INITIAL_REVIEW_SETS: ReviewSet[] = [
  {
    id: 'set-millionaire-1',
    title: 'Who Wants to Be a Millionaire: General Knowledge',
    subject: 'General Trivia',
    description: '15 tiered questions leading up to ₱1,000,000!',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    questions: [
      {
        id: 'm1',
        question: 'What primary color is mixed with yellow to make green?',
        options: ['Blue', 'Red', 'Purple', 'Black'],
        correctIndex: 0,
        explanation: 'Blue and Yellow make Green in standard primary color mixing.',
        millionaireLevel: 1,
        difficulty: 'easy'
      },
      {
        id: 'm2',
        question: 'How many sides does an octagon have?',
        options: ['6', '8', '10', '12'],
        correctIndex: 1,
        explanation: 'An octagon is an 8-sided polygon.',
        millionaireLevel: 2,
        difficulty: 'easy'
      },
      {
        id: 'm3',
        question: 'Which gas do plants absorb during photosynthesis?',
        options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Helium'],
        correctIndex: 2,
        explanation: 'Plants consume Carbon Dioxide (CO2) and release Oxygen.',
        millionaireLevel: 3,
        difficulty: 'easy'
      },
      {
        id: 'm4',
        question: 'What is the largest planet in our Solar System?',
        options: ['Earth', 'Saturn', 'Jupiter', 'Neptune'],
        correctIndex: 2,
        explanation: 'Jupiter is the largest planet in our solar system.',
        millionaireLevel: 4,
        difficulty: 'easy'
      },
      {
        id: 'm5',
        question: 'What is the capital city of the Philippines?',
        options: ['Cebu City', 'Davao City', 'Quezon City', 'Manila'],
        correctIndex: 3,
        explanation: 'Manila is the capital city of the Philippines.',
        millionaireLevel: 5,
        difficulty: 'easy'
      },
      {
        id: 'm6',
        question: 'Which chemical element has the symbol "Na"?',
        options: ['Nickel', 'Sodium', 'Nitrogen', 'Silver'],
        correctIndex: 1,
        explanation: 'Na stands for Natrium, the Latin name for Sodium.',
        millionaireLevel: 6,
        difficulty: 'average'
      },
      {
        id: 'm7',
        question: 'Who painted the Mona Lisa?',
        options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Michelangelo'],
        correctIndex: 2,
        explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century.',
        millionaireLevel: 7,
        difficulty: 'average'
      },
      {
        id: 'm8',
        question: 'What is the hardest natural substance known on Earth?',
        options: ['Titanium', 'Quartz', 'Diamond', 'Graphene'],
        correctIndex: 2,
        explanation: 'Diamond is the hardest naturally occurring substance.',
        millionaireLevel: 8,
        difficulty: 'average'
      },
      {
        id: 'm9',
        question: 'Which planet is known as the "Red Planet"?',
        options: ['Venus', 'Mars', 'Mercury', 'Jupiter'],
        correctIndex: 1,
        explanation: 'Mars is called the Red Planet due to iron oxide on its surface.',
        millionaireLevel: 9,
        difficulty: 'average'
      },
      {
        id: 'm10',
        question: 'What is the longest river in the world?',
        options: ['Amazon River', 'Nile River', 'Mississippi River', 'Yangtze River'],
        correctIndex: 1,
        explanation: 'The Nile River is traditionally recognized as the longest river in the world.',
        millionaireLevel: 10,
        difficulty: 'average'
      },
      {
        id: 'm11',
        question: 'What instrument is used to measure earthquake intensity?',
        options: ['Barometer', 'Seismograph', 'Thermometer', 'Anemometer'],
        correctIndex: 1,
        explanation: 'A seismograph or seismometer records earthquake seismic waves.',
        millionaireLevel: 11,
        difficulty: 'difficult'
      },
      {
        id: 'm12',
        question: 'How many bones are in the adult human body?',
        options: ['206', '210', '198', '250'],
        correctIndex: 0,
        explanation: 'An adult human body typically has 206 bones.',
        millionaireLevel: 12,
        difficulty: 'difficult'
      },
      {
        id: 'm13',
        question: 'Which scientist formulated the laws of motion and universal gravitation?',
        options: ['Albert Einstein', 'Galileo Galilei', 'Sir Isaac Newton', 'Nikola Tesla'],
        correctIndex: 2,
        explanation: 'Sir Isaac Newton formulated the three laws of motion.',
        millionaireLevel: 13,
        difficulty: 'difficult'
      },
      {
        id: 'm14',
        question: 'What is the fastest land animal in the world?',
        options: ['Cheetah', 'Pronghorn Antelope', 'Lion', 'Falcon'],
        correctIndex: 0,
        explanation: 'The cheetah can reach speeds of up to 70 mph (112 km/h).',
        millionaireLevel: 14,
        difficulty: 'difficult'
      },
      {
        id: 'm15',
        question: '₱1,000,000 QUESTION: What is the rarest naturally occurring element in the Earth crust?',
        options: ['Francium', 'Astatine', 'Oganesson', 'Promethium'],
        correctIndex: 1,
        explanation: 'Astatine is considered the rarest naturally occurring element in Earth\'s crust.',
        millionaireLevel: 15,
        difficulty: 'difficult'
      }
    ]
  },
  {
    id: 'set-quizbee-1',
    title: 'Inter-Class Quiz Bee Championship',
    subject: 'Science & Math',
    description: 'Rounds of Easy (10pts), Average (20pts), and Difficult (30pts) questions for team competitions.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    questions: [
      {
        id: 'qb1',
        question: 'What is 15 multiplied by 8?',
        options: ['120', '110', '130', '125'],
        correctIndex: 0,
        difficulty: 'easy',
        points: 10,
        explanation: '15 x 8 = 120'
      },
      {
        id: 'qb2',
        question: 'What is the chemical formula for water?',
        options: ['H2O', 'CO2', 'NaCl', 'O2'],
        correctIndex: 0,
        difficulty: 'easy',
        points: 10,
        explanation: 'H2O consists of 2 Hydrogen atoms and 1 Oxygen atom.'
      },
      {
        id: 'qb3',
        question: 'How many degrees are in a full circle?',
        options: ['180°', '360°', '90°', '270°'],
        correctIndex: 1,
        difficulty: 'easy',
        points: 10,
        explanation: 'A full turn/circle contains 360 degrees.'
      },
      {
        id: 'qb4',
        question: 'What organ pumps blood throughout the human body?',
        options: ['Lungs', 'Brain', 'Heart', 'Kidneys'],
        correctIndex: 2,
        difficulty: 'easy',
        points: 10,
        explanation: 'The heart is the primary muscle pumping blood.'
      },
      {
        id: 'qb5',
        question: 'Find the perimeter of a square with a side length of 7 cm.',
        options: ['28 cm', '49 cm', '14 cm', '21 cm'],
        correctIndex: 0,
        difficulty: 'average',
        points: 20,
        explanation: 'Perimeter = 4 x 7cm = 28cm.'
      },
      {
        id: 'qb6',
        question: 'Which layer of Earth\'s atmosphere contains the ozone layer?',
        options: ['Troposphere', 'Stratosphere', 'Mesosphere', 'Thermosphere'],
        correctIndex: 1,
        difficulty: 'average',
        points: 20,
        explanation: 'The ozone layer is in the stratosphere.'
      },
      {
        id: 'qb7',
        question: 'What is the square root of 256?',
        options: ['14', '16', '18', '12'],
        correctIndex: 1,
        difficulty: 'average',
        points: 20,
        explanation: '16 x 16 = 256.'
      },
      {
        id: 'qb8',
        question: 'What process converts water vapor into liquid water?',
        options: ['Evaporation', 'Sublimation', 'Condensation', 'Transpiration'],
        correctIndex: 2,
        difficulty: 'average',
        points: 20,
        explanation: 'Condensation is the process where gas turns into liquid.'
      },
      {
        id: 'qb9',
        question: 'If 3x + 5 = 20, what is the value of x?',
        options: ['3', '5', '10', '15'],
        correctIndex: 1,
        difficulty: 'difficult',
        points: 30,
        explanation: '3x = 15 => x = 5.'
      },
      {
        id: 'qb10',
        question: 'What speed is equal to approximately 300,000 kilometers per second in a vacuum?',
        options: ['Speed of Sound', 'Speed of Light', 'Escape Velocity', 'Terminal Velocity'],
        correctIndex: 1,
        difficulty: 'difficult',
        points: 30,
        explanation: 'Light travels at approximately 300,000 km/s in vacuum.'
      }
    ]
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  soundVolume: 0.8,
  wheel: {
    spinDuration: 5,
    soundEnabled: true,
    volume: 0.8,
    autoRemoveWinner: false,
    confettiEnabled: true,
  },
};

export const INITIAL_ROSTERS: ClassRoster[] = [
  {
    id: 'roster-5a',
    name: 'Grade 5A - Homeroom',
    gradeOrSubject: 'Grade 5',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    students: [
      { id: 's1', name: 'Alexander Wright', gender: 'M', active: true },
      { id: 's2', name: 'Sophia Martinez', gender: 'F', active: true },
      { id: 's3', name: 'Liam Johnson', gender: 'M', active: true },
      { id: 's4', name: 'Emma Watson', gender: 'F', active: true },
      { id: 's5', name: 'Noah Miller', gender: 'M', active: true },
      { id: 's6', name: 'Olivia Davis', gender: 'F', active: true },
      { id: 's7', name: 'Ethan Garcia', gender: 'M', active: true },
      { id: 's8', name: 'Ava Rodriguez', gender: 'F', active: true },
      { id: 's9', name: 'Lucas Wilson', gender: 'M', active: true },
      { id: 's10', name: 'Isabella Taylor', gender: 'F', active: true },
      { id: 's11', name: 'Mason Anderson', gender: 'M', active: true },
      { id: 's12', name: 'Mia Thomas', gender: 'F', active: true },
      { id: 's13', name: 'Logan White', gender: 'M', active: true },
      { id: 's14', name: 'Charlotte Harris', gender: 'F', active: true },
      { id: 's15', name: 'James Martin', gender: 'M', active: true },
      { id: 's16', name: 'Amelia Clark', gender: 'F', active: true },
    ],
  },
  {
    id: 'roster-sci',
    name: 'Period 3 - Science 101',
    gradeOrSubject: 'Science',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    students: [
      { id: 'sci1', name: 'Benjamin Lee', gender: 'M', active: true },
      { id: 'sci2', name: 'Harper King', gender: 'F', active: true },
      { id: 'sci3', name: 'Elijah Scott', gender: 'M', active: true },
      { id: 'sci4', name: 'Evelyn Green', gender: 'F', active: true },
      { id: 'sci5', name: 'Oliver Adams', gender: 'M', active: true },
      { id: 'sci6', name: 'Abigail Baker', gender: 'F', active: true },
      { id: 'sci7', name: 'Henry Gonzalez', gender: 'M', active: true },
      { id: 'sci8', name: 'Emily Nelson', gender: 'F', active: true },
      { id: 'sci9', name: 'Sebastian Carter', gender: 'M', active: true },
      { id: 'sci10', name: 'Elizabeth Mitchell', gender: 'F', active: true },
      { id: 'sci11', name: 'Jack Perez', gender: 'M', active: true },
      { id: 'sci12', name: 'Avery Roberts', gender: 'F', active: true },
    ],
  },
];

export function loadRostersFromStorage(): ClassRoster[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROSTERS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to parse saved rosters from localStorage:', err);
  }
  saveRostersToStorage(INITIAL_ROSTERS);
  return INITIAL_ROSTERS;
}

export function saveRostersToStorage(rosters: ClassRoster[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ROSTERS, JSON.stringify(rosters));
  } catch (err) {
    console.error('Failed to save rosters to localStorage:', err);
  }
}

export function loadActiveClassId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_ACTIVE_CLASS);
    if (id) return id;
  } catch (e) {
    console.error(e);
  }
  return INITIAL_ROSTERS[0].id;
}

export function saveActiveClassId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_CLASS, id);
  } catch (e) {
    console.error(e);
  }
}

export function loadSettingsFromStorage(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed, wheel: { ...DEFAULT_SETTINGS.wheel, ...parsed.wheel } };
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettingsToStorage(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error(e);
  }
}

export function loadReviewSetsFromStorage(): ReviewSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REVIEW_SETS);
    if (!raw) {
      saveReviewSetsToStorage(INITIAL_REVIEW_SETS);
      return INITIAL_REVIEW_SETS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to parse saved review sets from localStorage:', err);
  }
  saveReviewSetsToStorage(INITIAL_REVIEW_SETS);
  return INITIAL_REVIEW_SETS;
}

export function saveReviewSetsToStorage(sets: ReviewSet[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_REVIEW_SETS, JSON.stringify(sets));
  } catch (err) {
    console.error('Failed to save review sets to localStorage:', err);
  }
}

export function exportAllDataAsJSON(rosters: ClassRoster[], settings: AppSettings, reviewSets?: ReviewSet[]): string {
  const backup = {
    app: 'TeacherAssistantSuite',
    version: 1,
    exportedAt: new Date().toISOString(),
    rosters,
    settings,
    reviewSets,
  };
  return JSON.stringify(backup, null, 2);
}

export function parseDataFromJSON(jsonString: string): { rosters: ClassRoster[]; settings?: AppSettings; reviewSets?: ReviewSet[] } | null {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.rosters && Array.isArray(parsed.rosters)) {
      return {
        rosters: parsed.rosters,
        settings: parsed.settings,
        reviewSets: parsed.reviewSets,
      };
    }
    // If it's a raw list of rosters or array
    if (Array.isArray(parsed)) {
      return { rosters: parsed };
    }
  } catch (e) {
    console.error('Failed to parse JSON backup', e);
  }
  return null;
}
