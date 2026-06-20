// src/mocks/aiResourcesMocks.ts
import { BookOpen, Video, FileText, Activity } from 'lucide-react';

export type ResourceType = 'article' | 'video' | 'infographic';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  type: ResourceType;
  readTime: string;
  thumbnail: string;
  author: string;
  date: string;
  content?: string;
  videoUrl?: string;
  tags: string[];
  riskLevel?: RiskLevel; // يناسب المستخدم حسب نتيجة AI
}

export const categories = ['All', 'Prevention', 'Symptoms', 'Treatment', 'Lifestyle', 'Research'];

export const mockResources: Resource[] = [
  {
    id: '1',
    title: 'Understanding Oral Cancer: Early Signs & Symptoms',
    description: 'Learn how to identify the early warning signs of oral cancer and when to see a doctor.',
    category: 'Symptoms',
    type: 'article',
    readTime: '5 min read',
    thumbnail: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    author: 'Dr. Sarah Chen',
    date: 'Oct 15, 2023',
    tags: ['symptoms', 'early detection', 'guide'],
    riskLevel: 'high',
    content: `
      <h2>Early Detection Saves Lives</h2>
      <p>Oral cancer can often be detected in its early stages. The most common symptoms include...</p>
      <h3>Key Warning Signs</h3>
      <ul>
        <li>Persistent mouth sores that don't heal</li>
        <li>Red or white patches on the gums or lining of the mouth</li>
        <li>Lumps or thickening of the cheek</li>
        <li>Difficulty chewing or swallowing</li>
      </ul>
    `
  },
  {
    id: '2',
    title: '5 Lifestyle Changes to Reduce Your Risk',
    description: 'Simple daily habits that can significantly lower your risk of developing oral health issues.',
    category: 'Prevention',
    type: 'video',
    readTime: '10 min watch',
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',
    author: 'Dr. James Wilson',
    date: 'Oct 12, 2023',
    videoUrl: 'https://example.com/video',
    tags: ['prevention', 'lifestyle', 'diet'],
    riskLevel: 'medium',
  },
  {
    id: '3',
    title: 'The Link Between Tobacco and Oral Health',
    description: 'A comprehensive guide on how tobacco use affects your oral cavity and overall health.',
    category: 'Lifestyle',
    type: 'infographic',
    readTime: '2 min view',
    thumbnail: 'https://images.unsplash.com/photo-1555685812-4b943f3e9942?auto=format&fit=crop&q=80&w=800',
    author: 'Medical Board',
    date: 'Oct 10, 2023',
    tags: ['tobacco', 'risk factors', 'health'],
    riskLevel: 'high',
  },
  {
    id: '4',
    title: 'Latest Advances in Oral Cancer Treatment',
    description: 'Explore the newest technologies and treatment options available today.',
    category: 'Treatment',
    type: 'article',
    readTime: '8 min read',
    thumbnail: 'https://images.unsplash.com/photo-1579684385136-4f8995f52a00?auto=format&fit=crop&q=80&w=800',
    author: 'Dr. Emily Brooks',
    date: 'Oct 05, 2023',
    tags: ['treatment', 'technology', 'research'],
    riskLevel: 'medium',
  },
  {
    id: '5',
    title: 'Nutrition Guide for Oral Health',
    description: 'What to eat to keep your mouth healthy and strong.',
    category: 'Lifestyle',
    type: 'article',
    readTime: '6 min read',
    thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    author: 'Nutritionist Lisa Ray',
    date: 'Sep 28, 2023',
    tags: ['nutrition', 'diet', 'prevention'],
    riskLevel: 'low',
  }
];