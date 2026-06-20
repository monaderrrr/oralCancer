export interface QuizQuestion {
  id: string;
  text: string;
  type: 'single' | 'multiple' | 'scale' | 'yesno';
  options?: {
    label: string;
    value: string | number;
  }[];
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
}
export const riskAssessmentQuestions: QuizQuestion[] = [{
  id: 'age',
  text: 'What is your age range?',
  type: 'single',
  options: [{
    label: 'Under 30',
    value: 1
  }, {
    label: '30-45',
    value: 2
  }, {
    label: '46-60',
    value: 3
  }, {
    label: 'Over 60',
    value: 4
  }]
}, {
  id: 'tobacco',
  text: 'Do you use tobacco products (cigarettes, chewing tobacco, etc.)?',
  type: 'single',
  options: [{
    label: 'Never',
    value: 0
  }, {
    label: 'Used to, but quit',
    value: 2
  }, {
    label: 'Yes, occasionally',
    value: 4
  }, {
    label: 'Yes, regularly',
    value: 5
  }]
}, {
  id: 'alcohol',
  text: 'How often do you consume alcohol?',
  type: 'single',
  options: [{
    label: 'Never',
    value: 0
  }, {
    label: 'Occasionally (1-2 drinks/week)',
    value: 1
  }, {
    label: 'Moderately (3-7 drinks/week)',
    value: 3
  }, {
    label: 'Frequently (8+ drinks/week)',
    value: 5
  }]
}, {
  id: 'symptoms',
  text: 'Have you noticed any of these symptoms recently? (Select all that apply)',
  type: 'multiple',
  options: [{
    label: 'Persistent mouth sores',
    value: 3
  }, {
    label: 'Red or white patches',
    value: 3
  }, {
    label: 'Difficulty swallowing',
    value: 4
  }, {
    label: 'Unexplained bleeding',
    value: 4
  }, {
    label: 'None of the above',
    value: 0
  }]
}, {
  id: 'family_history',
  text: 'Is there a history of oral cancer in your family?',
  type: 'yesno',
  options: [{
    label: 'Yes',
    value: 3
  }, {
    label: 'No',
    value: 0
  }]
}, {
  id: 'hygiene',
  text: 'How would you rate your daily oral hygiene routine?',
  type: 'scale',
  min: 1,
  max: 5,
  minLabel: 'Poor',
  maxLabel: 'Excellent'
}];