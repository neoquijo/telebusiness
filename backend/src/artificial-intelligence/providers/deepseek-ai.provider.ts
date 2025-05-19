import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AIProvider } from '../artificial-intelligence.service';
import { AIAnalysisResult, NormalizedMessage } from 'src/filters/models/telegram-message.dto';

// List of main categories for message classification
const MAIN_CATEGORIES = [
  // Travel & Transportation
  'Travel Planning', 'Hotel Booking', 'Flight Tickets', 'Car Rental', 'Airport Transfer', 'Taxi Service', 'Public Transportation', 'Travel Insurance',
  // Real Estate
  'Real Estate Sale', 'Real Estate Rental', 'Commercial Property', 'Real Estate Investment', 'Property Management', 'Home Renovation', 'Interior Design',
  // Jobs & Career
  'Job Vacancy', 'Job Application', 'Resume Writing', 'Career Advice', 'Recruitment', 'Interview', 'Freelance Work', 'Remote Work', 'Part-time Job',
  // Services
  'Legal Services', 'Financial Services', 'Cleaning Services', 'Repair Services', 'Design Services', 'Marketing Services', 'Consulting', 'Education Services',
  'Translation Services', 'Health Services', 'Beauty Services', 'Fitness Services', 'Wedding Services', 'Event Planning', 'Photography Services',
  'Catering Services', 'Delivery Services', 'Installation Services', 'Web Development', 'App Development', 'IT Support', 'Data Entry', 'Virtual Assistant',
  // Products
  'Electronics', 'Furniture', 'Clothing', 'Accessories', 'Books', 'Toys', 'Sports Equipment', 'Musical Instruments', 'Art', 'Collectibles', 'Antiques',
  'Beauty Products', 'Health Products', 'Food Products', 'Beverages', 'Alcohol', 'Tobacco', 'Pets', 'Pet Supplies', 'Automotive', 'Automotive Parts',
  // Business
  'Business Partnership', 'Investment Opportunity', 'Franchise', 'Business Sale', 'Business Services', 'B2B Services', 'B2B Products', 'Manufacturing',
  'Wholesale', 'Retail', 'E-commerce', 'Logistics', 'Supply Chain', 'Import', 'Export', 'Trade', 'Agricultural', 'Industrial',
  // Finance
  'Banking', 'Insurance', 'Investment', 'Cryptocurrency', 'Stock Market', 'Forex', 'Loan', 'Credit', 'Financial Planning', 'Accounting', 'Tax',
  // Technology
  'Software', 'Hardware', 'Cloud Computing', 'Artificial Intelligence', 'Blockchain', 'Cybersecurity', 'Data Science', 'Internet of Things',
  'Mobile Apps', 'Gaming', 'Virtual Reality', 'Augmented Reality', 'Robotics', '3D Printing', 'Tech Support',
  // Education
  'Courses', 'Tutoring', 'Coaching', 'Training', 'Workshops', 'Webinars', 'E-learning', 'Language Learning', 'Academic', 'Research',
  // Health
  'Medical', 'Dental', 'Mental Health', 'Wellness', 'Nutrition', 'Fitness', 'Yoga', 'Meditation', 'Alternative Medicine', 'Healthcare',
  // Entertainment
  'Music', 'Movies', 'Theater', 'Dance', 'Art Exhibitions', 'Performances', 'Concerts', 'Festivals', 'Nightlife', 'Leisure',
  // Community
  'Charity', 'Volunteer', 'Fundraising', 'Community Service', 'Social Groups', 'Religious', 'Political', 'Activism', 'Support Groups',
  // Events
  'Conferences', 'Expos', 'Trade Shows', 'Seminars', 'Networking Events', 'Private Events', 'Public Events', 'Online Events',
  // Personal
  'Personal Announcement', 'Lost and Found', 'Personal Services', 'Dating', 'Friendship', 'Social Interaction',
  // Other
  'Miscellaneous', 'Unclassified', 'Spam', 'Scam', 'Illegal Activity', 'Questionable Content', 'Offtopic'
];

@Injectable()
export class DeepseekAIProvider implements AIProvider {
  private apiKey: string;
  private apiEndpoint: string;

  constructor(private configService: ConfigService) {
    this.apiKey = "sk-cd31d9b1d70f4596b62af31771dfa6b3"
    this.apiEndpoint = this.configService.get<string>('DEEPSEEK_API_ENDPOINT') || 'https://api.deepseek.com/v1/chat/completions';
  }

  async analyzeMessages(messages: NormalizedMessage[], matchGoal?: string): Promise<AIAnalysisResult[]> {
    const results: AIAnalysisResult[] = [];

    // Process each message
    for (const message of messages) {
      try {
        const result = await this.analyzeMessage(message, matchGoal);
        results.push(result);
      } catch (error) {
        console.error(`Error analyzing message ${message.id}:`, error);
      }
    }

    return results;
  }

  private async analyzeMessage(message: NormalizedMessage, matchGoal?: string): Promise<AIAnalysisResult> {
    const prompt = this.createPrompt(message, matchGoal);

    try {
      const response = await axios.post(
        this.apiEndpoint,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an AI assistant that analyzes Telegram messages to categorize them and identify leads.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      const content = response.data.choices[0].message.content;
      const parsedResult = JSON.parse(content);

      return {
        messageId: message.id,
        sender: message.sender,
        user: message.senderUsername || String(message.sender),
        account: String(message.chatId),
        isLead: parsedResult.isLead,
        messageType: parsedResult.messageType,
        mainCategory: parsedResult.mainCategory,
        keywords: parsedResult.keywords,
        lang: parsedResult.lang,
        confidence: parsedResult.confidence,
        isScam: parsedResult.isScam
      };
    } catch (error) {
      console.error('Error calling Deepseek API:', error);
      throw error;
    }
  }

  private createPrompt(message: NormalizedMessage, matchGoal?: string): string {
    return `
Analyze the following Telegram message and extract structured information. The message was sent in a ${message.chatType} titled "${message.chatTitle}".

MESSAGE TEXT:
"${message.text}"

MESSAGE CONTAINS MEDIA: ${message.media && message.media.length > 0 ? 'Yes' : 'No'}

${matchGoal ? `MATCHING GOAL: ${matchGoal}` : ''}

Analyze this message and respond with a JSON object containing:

1. "isLead": boolean - Determine if this message matches the specified goal or appears to be a genuine business opportunity, service request, or valuable contact
2. "messageType": one of ["buyOffer", "saleOffer", "jobOffer", "jobNeeded", "serviceOffer", "offtopic", "serviceNeeded"] - Classify the message intent
3. "mainCategory": string - Choose exactly ONE category from this list that best describes the message content: ${MAIN_CATEGORIES.join(', ')}
4. "keywords": array of strings - Generate at least 10-20 relevant keywords from the message
5. "lang": string - The ISO language code of the message (e.g., "EN", "ES", "RU", "FR")
6. "confidence": number between 0-1 - Your confidence level in this analysis
7. "isScam": boolean - Whether this message shows signs of being a scam or fraud

Respond ONLY with the JSON object, no additional text.
`;
  }
}
