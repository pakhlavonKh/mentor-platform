export interface Grant {
  id: string;
  title: string;
  country: string;
  type: "bachelor" | "master" | "internship" | "phd";
  funding: "full" | "partial";
  deadline: string;
  description: string;
  link: string;
}

export interface LearningContent {
  id: string;
  title: string;
  type: "video" | "text" | "checklist";
  topic: string;
  description: string;
  duration: string;
  completed?: boolean;
}

export interface TelegramPost {
  id: string;
  title: string;
  description: string;
  source: string;
  link: string;
  date: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  documents: number;
  price: number;
  features: string[];
  popular?: boolean;
}

export const mockGrants: Grant[] = [
  { id: "1", title: "Chevening Scholarship", country: "United Kingdom", type: "master", funding: "full", deadline: "2026-11-01", description: "Fully funded UK government scholarship for outstanding emerging leaders. Covers tuition, living expenses, and flights.", link: "#" },
  { id: "2", title: "DAAD Scholarship", country: "Germany", type: "master", funding: "full", deadline: "2026-10-15", description: "German Academic Exchange Service offers scholarships for postgraduate studies in Germany.", link: "#" },
  { id: "3", title: "Erasmus Mundus Joint Masters", country: "Europe", type: "master", funding: "full", deadline: "2026-01-15", description: "EU-funded scholarship covering tuition, travel, and living costs for joint master programs.", link: "#" },
  { id: "4", title: "Fulbright Program", country: "United States", type: "master", funding: "full", deadline: "2026-10-01", description: "Prestigious US exchange program offering grants for graduate studies and research.", link: "#" },
  { id: "5", title: "Korean Government Scholarship (KGSP)", country: "South Korea", type: "bachelor", funding: "full", deadline: "2026-03-01", description: "Full scholarship for international students to study undergraduate programs in South Korea.", link: "#" },
  { id: "6", title: "Türkiye Bursları", country: "Turkey", type: "bachelor", funding: "full", deadline: "2026-02-20", description: "Turkish government scholarship covering tuition, accommodation, health insurance, and monthly stipend.", link: "#" },
  { id: "7", title: "Swiss Government Excellence Scholarship", country: "Switzerland", type: "phd", funding: "full", deadline: "2026-12-01", description: "For researchers and artists from abroad who wish to pursue research or further studies in Switzerland.", link: "#" },
  { id: "8", title: "MEXT Scholarship", country: "Japan", type: "master", funding: "full", deadline: "2026-04-15", description: "Japanese government scholarship for international students including tuition, allowance, and travel.", link: "#" },
];

export const mockLearning: LearningContent[] = [
  { id: "1", title: "How to Write a Winning Motivation Letter", type: "video", topic: "motivation letter", description: "Step-by-step guide to crafting compelling motivation letters for scholarships.", duration: "15 min", completed: true },
  { id: "2", title: "CV Writing for Scholarship Applications", type: "text", topic: "CV writing", description: "Learn how to structure your CV to stand out in scholarship applications.", duration: "10 min", completed: true },
  { id: "3", title: "Getting Strong Recommendation Letters", type: "text", topic: "recommendation letters", description: "Tips for selecting recommenders and guiding them to write impactful letters.", duration: "8 min", completed: false },
  { id: "4", title: "Motivation Letter Checklist", type: "checklist", topic: "motivation letter", description: "Essential checklist to review before submitting your motivation letter.", duration: "5 min", completed: false },
  { id: "5", title: "Interview Preparation Guide", type: "video", topic: "interview", description: "Common scholarship interview questions and how to answer them confidently.", duration: "20 min", completed: false },
  { id: "6", title: "Research Proposal Writing", type: "text", topic: "research proposal", description: "How to write a compelling research proposal for graduate scholarships.", duration: "12 min", completed: false },
];

export const mockTelegramPosts: TelegramPost[] = [
  { id: "1", title: "New Erasmus+ Call for Applications", description: "Applications for Erasmus+ Joint Master Degrees 2026–2027 are now open. Over 100 programs available across Europe.", source: "ScholarshipHub", link: "#", date: "2026-03-28" },
  { id: "2", title: "DAAD Extended Deadline", description: "The DAAD has extended the application deadline for several programs to November 30th.", source: "GrantAlerts", link: "#", date: "2026-03-26" },
  { id: "3", title: "Free Webinar: How to Apply for Chevening", description: "Join our free webinar this Saturday to learn insider tips for Chevening applications.", source: "EduConnect", link: "#", date: "2026-03-25" },
  { id: "4", title: "Hungarian Government Scholarship Open", description: "Stipendium Hungaricum is accepting applications for bachelor, master, and doctoral programs.", source: "ScholarshipHub", link: "#", date: "2026-03-23" },
];

export const pricingPlans: PricingPlan[] = [
  { id: "single", name: "Single Review", documents: 1, price: 29, features: ["1 document review", "Detailed feedback", "48-hour turnaround", "One revision round"] },
  { id: "advanced", name: "Advanced", documents: 2, price: 49, popular: true, features: ["2 document reviews", "Detailed feedback", "24-hour turnaround", "Two revision rounds", "Priority support"] },
  { id: "full", name: "Full Package", documents: 3, price: 69, features: ["3 document reviews", "Detailed feedback", "24-hour turnaround", "Unlimited revisions", "Priority support", "1-on-1 consultation call"] },
];
