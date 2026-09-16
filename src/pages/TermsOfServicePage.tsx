import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, AlertCircle, FileCheck, ShieldAlert, BookOpen, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsOfServicePage() {
  const { i18n } = useTranslation();
  const lang = i18n.language || "en";

  const isRu = lang === "ru";
  const isKz = lang === "kz";

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase">
            <Scale className="w-3.5 h-3.5" />
            {isKz ? "Құқықтық келісім" : isRu ? "Юридическое соглашение" : "Legal Agreement"}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            {isKz ? "Пайдаланушы келісімі (Қолдану шарттары)" : isRu ? "Пользовательское соглашение (Условия обслуживания)" : "Terms of Service"}
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            {isKz
              ? "Күшіне ену күні: 2026 жылғы 1 қаңтар. Платформаны пайдаланбас бұрын осы Шарттармен мұқият танысып шығыңыз."
              : isRu
              ? "Дата вступления в силу: 1 января 2026 г. Пожалуйста, внимательно ознакомьтесь с Условиями перед использованием платформы."
              : "Effective Date: January 1, 2026. Please read these Terms carefully before using the StudyQadam platform."}
          </p>
        </motion.div>

        {/* Essential Legal Shield Alert Box */}
        <Card className="border-2 border-amber-500/40 bg-amber-500/5 shadow-soft mb-10">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400 text-base">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {isKz
                ? "Маңызды ескерту: Оқуға түсу немесе грант алу кепілдігі берілмейді"
                : isRu
                ? "Важное уведомление: Отсутствие гарантий поступления и получения грантов"
                : "Crucial Notice: No Admission or Financial Grant Guarantee"}
            </div>
            <p className="text-xs sm:text-sm text-foreground/85 leading-relaxed">
              {isKz
                ? "StudyQadam платформасы тек кеңес беру, ақпараттандыру және редакциялық қызметтер ұсынады. Платформа және оның менторлары ешбір жағдайда кез келген университетке, колледжге немесе жазғы бағдарламаға қабылдануға, сондай-ақ стипендиялар мен гранттарды тағайындауға 100% КЕПІЛДІК БЕРМЕЙДІ. Түпкілікті шешімді тек тиісті білім беру мекемесінің қабылдау комиссиясы қабылдайды."
                : isRu
                ? "Платформа StudyQadam оказывает исключительно консультационные, информационные и редакторские услуги. Платформа и её менторы ни при каких обстоятельствах НЕ ГАРАНТИРУЮТ зачисление в какие-либо учебные заведения, стипендиальные программы или получение виз. Окончательное решение принимается исключительно приемными комиссиями соответствующих институтов."
                : "StudyQadam provides advisory, educational, and editorial review services. Under no circumstances does StudyQadam or its tutors/mentors guarantee admission to any college, university, or summer program, nor does it guarantee the awarding of any grant, fellowship, or visa. Admissions decisions rest solely with the respective independent admissions committees."}
            </p>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              {isKz ? "1. Шарттарды қабылдау және жас шектеуі" : isRu ? "1. Принятие Условий и возрастные ограничения" : "1. Acceptance of Terms & Eligibility"}
            </h2>
            <p>
              {isKz
                ? "Платформада аккаунт ашу, қызметтерге тапсырыс беру немесе веб-сайтты қарау арқылы Сіз осы Шарттармен және Құпиялылық саясатымен толықтай келісетініңізді растайсыз."
                : isRu
                ? "Создавая учетную запись, оформляя заказ на услуги или используя сайт StudyQadam, Вы подтверждаете, что полностью прочитали, поняли и безоговорочно согласны с настоящими Условиями и Политикой конфиденциальности."
                : "By creating an account, purchasing review packages, or browsing the StudyQadam website, you agree to be bound by these Terms of Service and the accompanying Privacy Policy."}
            </p>
            <p>
              {isKz
                ? "Пайдаланушы кем дегенде 16 жасқа толған болуы тиіс немесе кәмелетке толмаған жағдайда ата-анасының немесе заңды өкілінің тікелей келісіміне ие болуы шарт."
                : isRu
                ? "Пользователь должен достичь возраста 16 лет либо, при недостижении указанного возраста, обладать письменным или явным согласием родителей/законных представителей на использование Платформы."
                : "Users must be at least 16 years of age or possess explicit consent from a parent or legal guardian to register and use platform services."}
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {isKz ? "2. Академиялық адалдық және авторлық ережелер" : isRu ? "2. Академическая честность и запрет на мошенничество" : "2. Academic Honesty & Code of Conduct"}
            </h2>
            <p>
              {isKz
                ? "StudyQadam студенттердің өз бетінше жазу дағдыларын дамытуды мақсат етеді. Біз академиялық адалдық қағидаттарын қатаң сақтаймыз:"
                : isRu
                ? "StudyQadam придерживается строгих стандартов академической честности и содействует развитию собственных навыков студентов:"
                : "StudyQadam is committed to fostering authentic student voices and upholding rigorous academic integrity:"}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                {isKz
                  ? "Менторлар мен сарапшылар эссені нөлден бастап СТУДЕНТТІҢ ОРНЫНА ЖАЗБАЙДЫ (гострайтингке тыйым салынады). Қызметтер тек құрылымды түзету, грамматиканы тексеру және сындарлы кеңес беруді қамтиды."
                  : isRu
                  ? "Менторы НЕ пишут эссе вместо студента «с нуля» (гострайтинг строго запрещен). Услуги включают исключительно проверку структуры, логики изложения, грамматики и предоставление рекомендаций."
                  : "Mentors DO NOT author or ghostwrite application essays on behalf of students. Services are strictly limited to editorial review, structural feedback, and admissions mentorship."}
              </li>
              <li>
                {isKz
                  ? "Пайдаланушыға плагиат жасауға немесе басқа адамдардың авторлық жұмыстарын тексеруге жүктеуге тыйым салынады."
                  : isRu
                  ? "Пользователю запрещается загружать чужие работы, нарушать авторские права третьих лиц или использовать плагиат."
                  : "Users are strictly prohibited from submitting plagiarized materials or documents violating third-party intellectual property."}
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              {isKz ? "3. Төлемдер, бағалар және қайтару саясаты" : isRu ? "3. Оплата, тарифы и политика возврата" : "3. Payments, Pricing & Refund Policy"}
            </h2>
            <p>
              {isKz
                ? "Тексеру пакеттерінің бағалары Платформаның «Тарифтер» бөлімінде көрсетілген. Қызметтер цифрлық өнім болғандықтан:"
                : isRu
                ? "Стоимость пакетов проверки документов указана на странице тарифов Платформы. Поскольку услуги носят интеллектуальный и персонализированный характер:"
                : "Document review package fees are clearly listed on the platform's Pricing page. Due to the customized digital nature of mentorship reviews:"}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                {isKz
                  ? "Ментор құжатты тексеруге кіріскеннен кейін немесе кері байланыс берілген соң қаражат қайтарылмайды."
                  : isRu
                  ? "После того как ментор приступил к проверке документа либо предоставил рецензию, оплаченные средства возврату не подлежат."
                  : "Once a mentor has commenced or delivered an editorial review, the associated fee is non-refundable."}
              </li>
              <li>
                {isKz
                  ? "Құжат тексеруге алынғанға дейін студент кез келген уақытта тапсырыстан бас тартып, қаражатты қайтаруды сұрай алады."
                  : isRu
                  ? "Если проверка еще не была начата, студент вправе отменить заказ и запросить возврат средств за вычетом банковских комиссий."
                  : "If a cancellation is requested before review commencement, a refund may be issued minus standard gateway payment processing fees."}
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              {isKz ? "4. Жауапкершілікті шектеу (Limitation of Liability)" : isRu ? "4. Ограничение ответственности (Limitation of Liability)" : "4. Limitation of Liability"}
            </h2>
            <div className="p-4 rounded-lg bg-card border border-border space-y-2">
              <p>
                {isKz
                  ? "Қолданыстағы заңнамамен рұқсат етілген ең жоғары шектерде, StudyQadam, оның құрылтайшылары, қызметкерлері немесе менторлары ешбір жағдайда жанама, кездейсоқ немесе туынды шығындар (соның ішінде оқуға түспеу, гранттан айырылу, жол шығындары немесе моральдық зиян) үшін жауап бермейді."
                  : isRu
                  ? "В максимальной степени, разрешенной применимым законодательством, StudyQadam, его основатели, сотрудники и менторы не несут ответственности за любые косвенные, случайные, сопутствующие убытки, включая, но не ограничиваясь: упущенные образовательные возможности, отказ в зачислении университетом, визовые отказы или моральный вред."
                  : "To the maximum extent permitted by law, StudyQadam, its directors, developers, tutors, and agents shall not be liable for any indirect, special, incidental, punitive, or consequential damages, including loss of university admission opportunities, grant denials, travel expenses, or emotional distress."}
              </p>
              <p>
                {isKz
                  ? "Платформаның жалпы жауапкершілігі соңғы 3 айда нақты төленген сомадан аспайды."
                  : isRu
                  ? "Совокупная ответственность Платформы по любым претензиям ограничивается суммой, фактически уплаченной Пользователем за соответствующую услугу."
                  : "The total aggregate liability of StudyQadam under any claim shall not exceed the actual amount paid by the User for the specific service in question."}
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              {isKz ? "5. Қолданылатын құқық және дауларды шешу" : isRu ? "5. Применимое право и разрешение споров" : "5. Governing Law & Jurisdiction"}
            </h2>
            <p>
              {isKz
                ? "Осы Шарттар Қазақстан Республикасының қолданыстағы материалдық құқығымен реттеледі және түсіндіріледі. Кез келген даулар алдымен өзара келіссөздер және наразылық хаттар арқылы шешіледі. Келісімге келмеген жағдайда, дау Қазақстан Республикасының соттарында қаралады."
                : isRu
                ? "Настоящие Условия регулируются и толкуются в соответствии с действующим законодательством Республики Казахстан. Все споры подлежат досудебному претензионному урегулированию (срок ответа на претензию — 30 календарных дней). В случае недостижения согласия спор передается на рассмотрение в компетентный суд Республики Казахстан."
                : "These Terms are governed by and construed in accordance with the substantive laws of the Republic of Kazakhstan. The parties agree to submit to the pre-trial dispute resolution process (30-day notice period) before initiating court proceedings in the courts of the Republic of Kazakhstan."}
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              {isKz ? "6. Байланыс ақпараты" : isRu ? "6. Контакты и служба поддержки" : "6. Legal Inquiries"}
            </h2>
            <div className="p-4 rounded-lg bg-secondary/40 border border-border text-xs sm:text-sm space-y-1">
              <div><strong>Email:</strong> legal@studyqadam.kz</div>
              <div><strong>Telegram:</strong> @studyqadam_corporate</div>
              <div><strong>Platform:</strong> StudyQadam Mentorship Platform</div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
