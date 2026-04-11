import "reflect-metadata";
import { AppDataSource } from "../config/database.js";
import { Grant } from "../entities/Grant.js";
import { LearningContent } from "../entities/LearningContent.js";
import { TelegramPost } from "../entities/TelegramPost.js";
import { PricingPlan } from "../entities/PricingPlan.js";

const seedDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database connected");

    const grantRepository = AppDataSource.getRepository(Grant);
    const learningRepository = AppDataSource.getRepository(LearningContent);
    const telegramRepository = AppDataSource.getRepository(TelegramPost);
    const pricingRepository = AppDataSource.getRepository(PricingPlan);

    // Clear existing data
    await grantRepository.clear();
    await learningRepository.clear();
    await telegramRepository.clear();
    await pricingRepository.clear();

    // Seed grants
    const grants = [
      {
        title: "Chevening Scholarship",
        country: "United Kingdom",
        type: "master" as const,
        funding: "full" as const,
        deadline: "2026-11-01",
        description:
          "Fully funded UK government scholarship for outstanding emerging leaders. Covers tuition, living expenses, and flights.",
        link: "#",
      },
      {
        title: "DAAD Scholarship",
        country: "Germany",
        type: "master" as const,
        funding: "full" as const,
        deadline: "2026-10-15",
        description:
          "German Academic Exchange Service offers scholarships for postgraduate studies in Germany.",
        link: "#",
      },
      {
        title: "Erasmus Mundus Joint Masters",
        country: "Europe",
        type: "master" as const,
        funding: "full" as const,
        deadline: "2026-01-15",
        description:
          "EU-funded scholarship covering tuition, travel, and living costs for joint master programs.",
        link: "#",
      },
      {
        title: "Fulbright Program",
        country: "United States",
        type: "master" as const,
        funding: "full" as const,
        deadline: "2026-10-01",
        description:
          "Prestigious US exchange program offering grants for graduate studies and research.",
        link: "#",
      },
      {
        title: "Korean Government Scholarship (KGSP)",
        country: "South Korea",
        type: "bachelor" as const,
        funding: "full" as const,
        deadline: "2026-03-01",
        description:
          "Full scholarship for international students to study undergraduate programs in South Korea.",
        link: "#",
      },
      {
        title: "Türkiye Bursları",
        country: "Turkey",
        type: "bachelor" as const,
        funding: "full" as const,
        deadline: "2026-02-20",
        description:
          "Turkish government scholarship covering tuition, accommodation, health insurance, and monthly stipend.",
        link: "#",
      },
      {
        title: "Swiss Government Excellence Scholarship",
        country: "Switzerland",
        type: "phd" as const,
        funding: "full" as const,
        deadline: "2026-12-01",
        description:
          "For researchers and artists from abroad who wish to pursue research or further studies in Switzerland.",
        link: "#",
      },
      {
        title: "MEXT Scholarship",
        country: "Japan",
        type: "master" as const,
        funding: "full" as const,
        deadline: "2026-04-15",
        description:
          "Japanese government scholarship for international students including tuition, allowance, and travel.",
        link: "#",
      },
    ];

    await grantRepository.save(grants);
    console.log("✓ Granted seeded with", grants.length, "records");

    // Seed learning content
    const learningContents = [
      {
        title: "How to Write a Winning Motivation Letter",
        type: "video" as const,
        topic: "motivation letter",
        description:
          "Step-by-step guide to crafting compelling motivation letters for scholarships.",
        duration: "15 min",
      },
      {
        title: "CV Writing for Scholarship Applications",
        type: "text" as const,
        topic: "CV writing",
        description:
          "Learn how to structure your CV to stand out in scholarship applications.",
        duration: "10 min",
      },
      {
        title: "Getting Strong Recommendation Letters",
        type: "text" as const,
        topic: "recommendation letters",
        description:
          "Tips for selecting recommenders and guiding them to write impactful letters.",
        duration: "8 min",
      },
      {
        title: "Motivation Letter Checklist",
        type: "checklist" as const,
        topic: "motivation letter",
        description:
          "Essential checklist to review before submitting your motivation letter.",
        duration: "5 min",
      },
      {
        title: "Interview Preparation Guide",
        type: "video" as const,
        topic: "interview",
        description:
          "Common scholarship interview questions and how to answer them confidently.",
        duration: "20 min",
      },
      {
        title: "Research Proposal Writing",
        type: "text" as const,
        topic: "research proposal",
        description:
          "How to write a compelling research proposal for graduate scholarships.",
        duration: "12 min",
      },
    ];

    await learningRepository.save(learningContents);
    console.log("✓ Learning content seeded with", learningContents.length, "records");

    // Seed telegram posts
    const telegramPosts = [
      {
        title: "New Erasmus+ Call for Applications",
        description:
          "Applications for Erasmus+ Joint Master Degrees 2026–2027 are now open. Over 100 programs available across Europe.",
        source: "ScholarshipHub",
        link: "#",
        date: "2026-03-28",
      },
      {
        title: "DAAD Extended Deadline",
        description:
          "The DAAD has extended the application deadline for several programs to November 30th.",
        source: "GrantAlerts",
        link: "#",
        date: "2026-03-26",
      },
      {
        title: "Free Webinar: How to Apply for Chevening",
        description:
          "Join our free webinar this Saturday to learn insider tips for Chevening applications.",
        source: "EduConnect",
        link: "#",
        date: "2026-03-25",
      },
      {
        title: "Hungarian Government Scholarship Open",
        description:
          "Stipendium Hungaricum is accepting applications for bachelor, master, and doctoral programs.",
        source: "ScholarshipHub",
        link: "#",
        date: "2026-03-23",
      },
    ];

    await telegramRepository.save(telegramPosts);
    console.log("✓ Telegram posts seeded with", telegramPosts.length, "records");

    // Seed pricing plans
    const pricingPlans = [
      {
        name: "Single Review",
        documents: 1,
        price: 29,
        popular: false,
        features: ["1 document review", "Detailed feedback", "48-hour turnaround", "One revision round"],
      },
      {
        name: "Advanced",
        documents: 2,
        price: 49,
        popular: true,
        features: [
          "2 document reviews",
          "Detailed feedback",
          "24-hour turnaround",
          "Two revision rounds",
          "Priority support",
        ],
      },
      {
        name: "Full Package",
        documents: 3,
        price: 69,
        popular: false,
        features: [
          "3 document reviews",
          "Detailed feedback",
          "24-hour turnaround",
          "Unlimited revisions",
          "Priority support",
          "1-on-1 consultation call",
        ],
      },
    ];

    await pricingRepository.save(pricingPlans);
    console.log("✓ Pricing plans seeded with", pricingPlans.length, "records");

    console.log("\n✓ Database seeding completed successfully!");
    await AppDataSource.destroy();
  } catch (error) {
    console.error("✗ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
