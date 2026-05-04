import "dotenv/config";
import "reflect-metadata";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/database.js";
import { Grant } from "../entities/Grant.js";
import { LearningContent } from "../entities/LearningContent.js";
import { TelegramPost } from "../entities/TelegramPost.js";
import { PricingPlan } from "../entities/PricingPlan.js";
import { User } from "../entities/User.js";

const seedDatabase = async () => {
  try {
    // Disable auto-synchronize so initialize() doesn't fail on schema mismatch
    AppDataSource.setOptions({ synchronize: false });
    await AppDataSource.initialize();
    console.log("Database connected");

    // Drop and recreate all tables with new JSONB schema
    await AppDataSource.dropDatabase();
    await AppDataSource.synchronize();
    console.log("✓ Schema synchronized (tables recreated)");

    const grantRepository = AppDataSource.getRepository(Grant);
    const learningRepository = AppDataSource.getRepository(LearningContent);
    const telegramRepository = AppDataSource.getRepository(TelegramPost);
    const pricingRepository = AppDataSource.getRepository(PricingPlan);
    const userRepository = AppDataSource.getRepository(User);

    // Seed users (admin, mentor, student)
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await userRepository.save([
      { email: "admin@studyqadam.kz", password: hashedPassword, firstName: "Admin", lastName: "User", role: "admin" as const },
      { email: "mentor@studyqadam.kz", password: hashedPassword, firstName: "Mentor", lastName: "User", role: "tutor" as const },
      { email: "student@studyqadam.kz", password: hashedPassword, firstName: "Student", lastName: "User", role: "student" as const },
    ]);
    console.log("✓ Users seeded (admin, tutor, student) — password: admin123");

    // Seed grants
    const grants = [
      {
        title: { en: "Chevening Scholarship", ru: "Стипендия Chevening", kz: "Chevening стипендиясы" },
        country: "United Kingdom",
        type: "master" as const,
        funding: "full" as const,
        deadline: "2026-11-01",
        description: {
          en: "Fully funded UK government scholarship for outstanding emerging leaders. Covers tuition, living expenses, and flights.",
          ru: "Полностью финансируемая стипендия правительства Великобритании для выдающихся молодых лидеров. Покрывает обучение, проживание и перелёт.",
          kz: "Көрнекті жас көшбасшыларға арналған Ұлыбритания үкіметінің толық қаржыландырылатын стипендиясы. Оқу, тұру және ұшу шығындарын жабады.",
        },
        link: "#",
      },
      {
        title: { en: "DAAD Scholarship", ru: "Стипендия DAAD", kz: "DAAD стипендиясы" },
        country: "Germany",
        type: "master" as const,
        funding: "full" as const,
        deadline: "2026-10-15",
        description: {
          en: "German Academic Exchange Service offers scholarships for postgraduate studies in Germany.",
          ru: "Германская служба академических обменов предлагает стипендии для магистерских программ в Германии.",
          kz: "Германиялық академиялық алмасу қызметі Германиядағы магистратура бағдарламалары үшін стипендиялар ұсынады.",
        },
        link: "#",
      },
      {
        title: { en: "Erasmus Mundus Joint Masters", ru: "Erasmus Mundus совместные магистерские программы", kz: "Erasmus Mundus бірлескен магистратура" },
        country: "Europe",
        type: "master" as const,
        funding: "full" as const,
        deadline: "2026-01-15",
        description: {
          en: "EU-funded scholarship covering tuition, travel, and living costs for joint master programs.",
          ru: "Стипендия ЕС, покрывающая обучение, проезд и проживание для совместных магистерских программ.",
          kz: "Бірлескен магистратура бағдарламалары үшін оқу, жол және тұру шығындарын жабатын ЕО стипендиясы.",
        },
        link: "#",
      },
      {
        title: { en: "Fulbright Program", ru: "Программа Фулбрайта", kz: "Фулбрайт бағдарламасы" },
        country: "United States",
        type: "master" as const,
        funding: "full" as const,
        deadline: "2026-10-01",
        description: {
          en: "Prestigious US exchange program offering grants for graduate studies and research.",
          ru: "Престижная американская программа обмена, предлагающая гранты для магистратуры и исследований.",
          kz: "Магистратура мен зерттеулерге арналған гранттар ұсынатын беделді АҚШ алмасу бағдарламасы.",
        },
        link: "#",
      },
      {
        title: { en: "Korean Government Scholarship (KGSP)", ru: "Стипендия правительства Кореи (KGSP)", kz: "Корея үкіметінің стипендиясы (KGSP)" },
        country: "South Korea",
        type: "bachelor" as const,
        funding: "full" as const,
        deadline: "2026-03-01",
        description: {
          en: "Full scholarship for international students to study undergraduate programs in South Korea.",
          ru: "Полная стипендия для иностранных студентов на бакалавриат в Южной Корее.",
          kz: "Оңтүстік Кореядағы бакалавриат бағдарламаларына арналған шетелдік студенттерге толық стипендия.",
        },
        link: "#",
      },
      {
        title: { en: "Türkiye Bursları", ru: "Türkiye Bursları (Стипендии Турции)", kz: "Türkiye Bursları (Түркия стипендиялары)" },
        country: "Turkey",
        type: "bachelor" as const,
        funding: "full" as const,
        deadline: "2026-02-20",
        description: {
          en: "Turkish government scholarship covering tuition, accommodation, health insurance, and monthly stipend.",
          ru: "Стипендия правительства Турции, покрывающая обучение, проживание, медицинскую страховку и ежемесячное пособие.",
          kz: "Оқу, тұру, медициналық сақтандыру және ай сайынғы стипендияны жабатын Түркия үкіметінің стипендиясы.",
        },
        link: "#",
      },
      {
        title: { en: "Swiss Government Excellence Scholarship", ru: "Стипендия Швейцарского правительства", kz: "Швейцария үкіметінің стипендиясы" },
        country: "Switzerland",
        type: "phd" as const,
        funding: "full" as const,
        deadline: "2026-12-01",
        description: {
          en: "For researchers and artists from abroad who wish to pursue research or further studies in Switzerland.",
          ru: "Для иностранных исследователей и деятелей искусства, желающих продолжить исследования или учёбу в Швейцарии.",
          kz: "Швейцарияда зерттеу немесе оқуын жалғастырғысы келетін шетелдік зерттеушілер мен суретшілерге арналған.",
        },
        link: "#",
      },
      {
        title: { en: "MEXT Scholarship", ru: "Стипендия MEXT", kz: "MEXT стипендиясы" },
        country: "Japan",
        type: "master" as const,
        funding: "full" as const,
        deadline: "2026-04-15",
        description: {
          en: "Japanese government scholarship for international students including tuition, allowance, and travel.",
          ru: "Стипендия правительства Японии для иностранных студентов, включая обучение, пособие и перелёт.",
          kz: "Оқу, жәрдемақы және жол жүруді қамтитын шетелдік студенттерге арналған Жапония үкіметінің стипендиясы.",
        },
        link: "#",
      },
    ];

    await grantRepository.save(grants);
    console.log("✓ Granted seeded with", grants.length, "records");

    // Seed learning content
    const learningContents = [
      {
        title: { en: "How to Write a Winning Motivation Letter", ru: "Как написать мотивационное письмо", kz: "Мотивациялық хатты қалай жазу керек" },
        type: "video" as const,
        topic: { en: "motivation letter", ru: "мотивационное письмо", kz: "мотивациялық хат" },
        description: {
          en: "Step-by-step guide to crafting compelling motivation letters for scholarships.",
          ru: "Пошаговое руководство по написанию убедительных мотивационных писем для стипендий.",
          kz: "Стипендияларға арналған мотивациялық хаттарды жазудың қадамдық нұсқаулығы.",
        },
        duration: "15 min",
      },
      {
        title: { en: "CV Writing for Scholarship Applications", ru: "Составление резюме для стипендий", kz: "Стипендияға арналған CV жазу" },
        type: "text" as const,
        topic: { en: "CV writing", ru: "написание резюме", kz: "CV жазу" },
        description: {
          en: "Learn how to structure your CV to stand out in scholarship applications.",
          ru: "Узнайте, как оформить резюме, чтобы выделиться среди кандидатов на стипендию.",
          kz: "Стипендиялық өтініштерде ерекшеленетін CV қалай құрылымдау керектігін үйреніңіз.",
        },
        duration: "10 min",
      },
      {
        title: { en: "Getting Strong Recommendation Letters", ru: "Получение рекомендательных писем", kz: "Ұсыныс хаттарын алу" },
        type: "text" as const,
        topic: { en: "recommendation letters", ru: "рекомендательные письма", kz: "ұсыныс хаттары" },
        description: {
          en: "Tips for selecting recommenders and guiding them to write impactful letters.",
          ru: "Советы по выбору рекомендателей и составлению эффективных рекомендательных писем.",
          kz: "Ұсынушыларды таңдау және олардың тиімді хаттар жазуына көмектесу кеңестері.",
        },
        duration: "8 min",
      },
      {
        title: { en: "Motivation Letter Checklist", ru: "Чек-лист мотивационного письма", kz: "Мотивациялық хат тексеру парағы" },
        type: "checklist" as const,
        topic: { en: "motivation letter", ru: "мотивационное письмо", kz: "мотивациялық хат" },
        description: {
          en: "Essential checklist to review before submitting your motivation letter.",
          ru: "Список обязательных пунктов для проверки перед отправкой мотивационного письма.",
          kz: "Мотивациялық хатты жібермес бұрын тексеретін маңызды тізім.",
        },
        duration: "5 min",
      },
      {
        title: { en: "Interview Preparation Guide", ru: "Руководство по подготовке к интервью", kz: "Сұхбатқа дайындық нұсқаулығы" },
        type: "video" as const,
        topic: { en: "interview", ru: "интервью", kz: "сұхбат" },
        description: {
          en: "Common scholarship interview questions and how to answer them confidently.",
          ru: "Типичные вопросы на собеседовании за стипендию и как на них уверенно отвечать.",
          kz: "Стипендия сұхбатының жиі қойылатын сұрақтары және оларға сенімді жауап беру.",
        },
        duration: "20 min",
      },
      {
        title: { en: "Research Proposal Writing", ru: "Написание исследовательского предложения", kz: "Зерттеу ұсынысын жазу" },
        type: "text" as const,
        topic: { en: "research proposal", ru: "исследовательское предложение", kz: "зерттеу ұсынысы" },
        description: {
          en: "How to write a compelling research proposal for graduate scholarships.",
          ru: "Как написать убедительное исследовательское предложение для магистерских стипендий.",
          kz: "Магистратура стипендияларына арналған зерттеу ұсынысын қалай жазу керек.",
        },
        duration: "12 min",
      },
    ];

    await learningRepository.save(learningContents);
    console.log("✓ Learning content seeded with", learningContents.length, "records");

    // Seed telegram posts
    const telegramPosts = [
      {
        title: { en: "New Erasmus+ Call for Applications", ru: "Новый конкурс заявок Erasmus+", kz: "Erasmus+ жаңа өтінімдер қабылдауы" },
        description: {
          en: "Applications for Erasmus+ Joint Master Degrees 2026–2027 are now open. Over 100 programs available across Europe.",
          ru: "Приём заявок на совместные магистерские программы Erasmus+ 2026–2027 открыт. Более 100 программ по всей Европе.",
          kz: "Erasmus+ 2026–2027 бірлескен магистратура бағдарламаларына өтінімдер қабылдау басталды. Еуропа бойынша 100-ден астам бағдарлама.",
        },
        source: "ScholarshipHub",
        link: "#",
        date: "2026-03-28",
      },
      {
        title: { en: "DAAD Extended Deadline", ru: "DAAD продлил сроки", kz: "DAAD мерзімді ұзартты" },
        description: {
          en: "The DAAD has extended the application deadline for several programs to November 30th.",
          ru: "DAAD продлил срок подачи заявок по нескольким программам до 30 ноября.",
          kz: "DAAD бірнеше бағдарлама бойынша өтінім мерзімін 30 қарашаға дейін ұзартты.",
        },
        source: "GrantAlerts",
        link: "#",
        date: "2026-03-26",
      },
      {
        title: { en: "Free Webinar: How to Apply for Chevening", ru: "Бесплатный вебинар: подача на Chevening", kz: "Тегін вебинар: Chevening-ке өтінім беру" },
        description: {
          en: "Join our free webinar this Saturday to learn insider tips for Chevening applications.",
          ru: "Присоединяйтесь к бесплатному вебинару в субботу и узнайте секреты подачи на Chevening.",
          kz: "Сенбіде біздің тегін вебинарға қосылыңыз және Chevening-ке өтінім берудің құпияларын біліңіз.",
        },
        source: "EduConnect",
        link: "#",
        date: "2026-03-25",
      },
      {
        title: { en: "Hungarian Government Scholarship Open", ru: "Открыта стипендия правительства Венгрии", kz: "Венгрия үкіметінің стипендиясы ашылды" },
        description: {
          en: "Stipendium Hungaricum is accepting applications for bachelor, master, and doctoral programs.",
          ru: "Stipendium Hungaricum принимает заявки на бакалавриат, магистратуру и докторантуру.",
          kz: "Stipendium Hungaricum бакалавриат, магистратура және докторантура бағдарламаларына өтінімдерді қабылдайды.",
        },
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
        name: { en: "Single Review", ru: "Одна проверка", kz: "Бір тексеру" },
        documents: 1,
        price: 29,
        popular: false,
        features: {
          en: ["1 document review", "Detailed feedback", "48-hour turnaround", "One revision round"],
          ru: ["Проверка 1 документа", "Подробная обратная связь", "Срок — 48 часов", "Один раунд правок"],
          kz: ["1 құжатты тексеру", "Толық кері байланыс", "48 сағатта орындалады", "Бір түзету раунды"],
        },
      },
      {
        name: { en: "Advanced", ru: "Продвинутый", kz: "Кеңейтілген" },
        documents: 2,
        price: 49,
        popular: true,
        features: {
          en: ["2 document reviews", "Detailed feedback", "24-hour turnaround", "Two revision rounds", "Priority support"],
          ru: ["Проверка 2 документов", "Подробная обратная связь", "Срок — 24 часа", "Два раунда правок", "Приоритетная поддержка"],
          kz: ["2 құжатты тексеру", "Толық кері байланыс", "24 сағатта орындалады", "Екі түзету раунды", "Басым қолдау"],
        },
      },
      {
        name: { en: "Full Package", ru: "Полный пакет", kz: "Толық пакет" },
        documents: 3,
        price: 69,
        popular: false,
        features: {
          en: ["3 document reviews", "Detailed feedback", "24-hour turnaround", "Unlimited revisions", "Priority support", "1-on-1 consultation call"],
          ru: ["Проверка 3 документов", "Подробная обратная связь", "Срок — 24 часа", "Безлимитные правки", "Приоритетная поддержка", "Персональная консультация"],
          kz: ["3 құжатты тексеру", "Толық кері байланыс", "24 сағатта орындалады", "Шексіз түзетулер", "Басым қолдау", "Жеке кеңес беру"],
        },
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
