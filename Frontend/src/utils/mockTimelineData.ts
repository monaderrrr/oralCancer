import { TimelineEventData } from '../components/timeline/TimelineEvent';
import { Recommendation } from '../components/timeline/RecommendationItem';
export const mockTimelineEvents: TimelineEventData[] = [{
  id: '1',
  type: 'scan',
  title: 'AI Oral Scan Completed',
  description: 'Comprehensive oral cavity scan analyzed. No immediate concerns detected. Risk level: Low.',
  date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  // 2 days ago
  status: 'Low Risk',
  urgency: 'low',
  metadata: {
    riskScore: 15,
    areas: 'All regions clear'
  }
}, {
  id: '2',
  type: 'recommendation',
  title: 'Follow-up Scan Recommended',
  description: 'Plan your next routine screening in 3 months to maintain optimal oral health monitoring.',
  date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  status: 'Pending',
  urgency: 'low'
}, {
  id: '3',
  type: 'message',
  title: 'Dr. Sarah Johnson replied',
  description: 'Your recent scan results look good. Continue with regular oral hygiene practices.',
  date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  // 5 days ago
  status: 'Read'
}, {
  id: '4',
  type: 'symptom',
  title: 'Symptom Reported: Mouth Ulcer',
  description: 'Small ulcer on inner cheek. Duration: 3 days. Pain level: Mild. Monitoring for changes.',
  date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  // 1 week ago
  status: 'Monitoring',
  urgency: 'medium'
}, {
  id: '5',
  type: 'message',
  title: 'Virtual Consultation Completed',
  description: 'Discussed scan results and preventive care strategies with Dr. Sarah Johnson.',
  date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  // 2 weeks ago
  status: 'Completed'
}, {
  id: '6',
  type: 'scan',
  title: 'Initial Screening Scan',
  description: 'First comprehensive oral health assessment. Baseline established for future comparisons.',
  date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
  // 3 weeks ago
  status: 'Completed',
  urgency: 'low'
}, {
  id: '7',
  type: 'recommendation',
  title: 'Lifestyle Recommendation',
  description: 'Consider reducing tobacco use and increasing vitamin C intake for better oral health.',
  date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
  status: 'In Progress',
  urgency: 'medium'
}, {
  id: '8',
  type: 'message',
  title: 'Welcome Message from Care Team',
  description: 'Welcome to OralScan AI! Your care team is here to support your oral health journey.',
  date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
  // 4 weeks ago
  status: 'Read'
}];
export const mockRecommendations: Recommendation[] = [{
  id: 'r1',
  title: 'Plan Follow-up Scan',
  description: 'Your last scan was 2 days ago. Plan your next routine screening in 3 months.',
  urgency: 'high',
  category: 'scan',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  // 1 week from now
  completed: false
}, {
  id: 'r2',
  title: 'Find Dental Specialist',
  description: 'Annual dental examination recommended. Find a verified dentist in your area.',
  urgency: 'medium',
  category: 'followup',
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  // 2 weeks
  completed: false
}, {
  id: 'r3',
  title: 'Review Lifestyle Recommendations',
  description: 'Complete the lifestyle assessment to receive personalized oral health tips.',
  urgency: 'low',
  category: 'lifestyle',
  completed: false
}, {
  id: 'r4',
  title: 'Respond to Dr. Johnson',
  description: 'Dr. Sarah Johnson has questions about your recent symptoms. Reply to continue consultation.',
  urgency: 'high',
  category: 'followup',
  dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
  // 2 days
  completed: false
}, {
  id: 'r5',
  title: 'Update Medical History',
  description: 'Keep your medical profile current by adding any recent health changes or medications.',
  urgency: 'low',
  category: 'followup',
  completed: false
}];
export const mockTodaysActions = [{
  id: 'a1',
  type: 'message' as const,
  title: 'Reply to Dr. Johnson',
  time: 'Waiting for response',
  urgent: true
}, {
  id: 'a2',
  type: 'task' as const,
  title: 'Complete Health Questionnaire',
  time: 'Due today',
  urgent: false
}];
