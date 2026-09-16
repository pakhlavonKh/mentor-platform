import { useTranslation } from "react-i18next";
import { PageLayout } from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, FileText, CheckCircle2, Globe, UserCheck, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
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
            <Shield className="w-3.5 h-3.5" />
            {isKz ? "Құқықтық қорғау" : isRu ? "Правовая защита" : "Legal Compliance"}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            {isKz
              ? "Құпиялылық саясаты және дербес деректерді өңдеу"
              : isRu
              ? "Политика конфиденциальности и обработка персональных данных"
              : "Privacy Policy & Personal Data Protection"}
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            {isKz
              ? "Күшіне ену күні: 2026 жылғы 1 қаңтар. Қазақстан Республикасының «Дербес деректер және оларды қорғау туралы» Заңына және халықаралық GDPR стандарттарына сәйкес."
              : isRu
              ? "Дата вступления в силу: 1 января 2026 г. В соответствии с Законом Республики Казахстан «О персональных данных и их защите» и международными стандартами GDPR."
              : "Effective Date: January 1, 2026. Formulated in compliance with the Law of the Republic of Kazakhstan 'On Personal Data and their Protection' and international GDPR standards."}
          </p>
        </motion.div>

        {/* Quick Highlights Card */}
        <Card className="border border-primary/20 bg-primary/5 shadow-soft mb-10">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-foreground text-base">
              <Lock className="w-4 h-4 text-primary" />
              {isKz
                ? "Сіздің негізгі құқықтарыңыз бен кепілдіктер қысқаша"
                : isRu
                ? "Кратко: Ваши главные права и гарантии безопасности"
                : "Executive Summary: Your Rights & Guarantees"}
            </div>
            <ul className="grid sm:grid-cols-2 gap-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  {isKz
                    ? "Сіз жүктеген эсселер мен құжаттар 100% сіздің интеллектуалдық меншігіңіз болып қалады."
                    : isRu
                    ? "Все загруженные эссе и документы остаются вашей 100% интеллектуальной собственностью."
                    : "Uploaded essays and documents remain 100% your intellectual property."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  {isKz
                    ? "Деректер үшінші тұлғаларға жарнамалық мақсатта ешқашан сатылмайды."
                    : isRu
                    ? "Данные никогда не продаются третьим лицам и не используются для спама."
                    : "Data is never sold to third parties or used for external advertising."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  {isKz
                    ? "Құпия сөздер crypt/bcrypt алгоритмдерімен мықты шифрланады."
                    : isRu
                    ? "Пароли надежно шифруются с использованием salted bcrypt."
                    : "Passwords and tokens are strongly hashed and encrypted via salted bcrypt."}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  {isKz
                    ? "Кез келген уақытта аккаунтыңыз бен деректеріңізді толық өшіруді талап ете аласыз."
                    : isRu
                    ? "Вы имеете право запросить полное удаление аккаунта и данных в любой момент."
                    : "You can request complete deletion of your account and files at any time."}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Policy Body */}
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {isKz ? "1. Жалпы ережелер және оператор" : isRu ? "1. Общие положения и оператор данных" : "1. General Provisions & Data Controller"}
            </h2>
            <p>
              {isKz
                ? "Осы Құпиялылық саясаты (бұдан әрі – Саясат) StudyQadam платформасының (бұдан әрі – «Платформа», «Біз») пайдаланушылардың (бұдан әрі – «Пайдаланушы», «Сіз») дербес деректерін жинау, өңдеу, сақтау және қорғау тәртібін белгілейді."
                : isRu
                ? "Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок сбора, обработки, хранения и защиты персональных данных пользователей (далее — «Пользователь», «Вы») платформы StudyQadam (далее — «Платформа», «Мы»)."
                : "This Privacy Policy (hereinafter 'Policy') governs the collection, processing, storage, and protection of personal data of users ('User', 'You') by the StudyQadam educational and mentorship platform ('Platform', 'We')."}
            </p>
            <p>
              {isKz
                ? "Платформада тіркелу арқылы немесе оның қызметтерін пайдалану арқылы Пайдаланушы Қазақстан Республикасының «Дербес деректер және оларды қорғау туралы» 2013 жылғы 21 мамырдағы № 94-V Заңының 8-бабына сәйкес өз дербес деректерін жинауға және өңдеуге сөзсіз, ерікті келісімін береді."
                : isRu
                ? "Регистрируясь на Платформе или используя её сервисы, Пользователь дает свое безусловное и добровольное согласие на сбор и обработку своих персональных данных в соответствии со ст. 8 Закона Республики Казахстан от 21 мая 2013 года № 94-V «О персональных данных и их защите»."
                : "By registering on the Platform or utilizing its services, the User provides explicit, voluntary consent to the processing of their personal data pursuant to Article 8 of the Law of the Republic of Kazakhstan No. 94-V 'On Personal Data and their Protection', as well as applicable international standards."}
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              {isKz ? "2. Өңделетін дербес деректердің тізбесі" : isRu ? "2. Перечень собираемых персональных данных" : "2. Categories of Personal Data Collected"}
            </h2>
            <p>
              {isKz
                ? "Біз Платформаның қызметтерін тиімді көрсету үшін қажетті келесі деректерді өңдейміз:"
                : isRu
                ? "Мы обрабатываем исключительно те данные, которые необходимы для предоставления образовательных и менторских сервисов:"
                : "We process only the categories of data strictly necessary to deliver mentorship, scholarship discovery, and admission review services:"}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>{isKz ? "Тіркеу деректері:" : isRu ? "Учетные данные:" : "Account Data:"}</strong>{" "}
                {isKz
                  ? "Аты-жөні, электрондық пошта мекенжайы, құпия сөздің криптографиялық хэші, аватар бейнесі."
                  : isRu
                  ? "Имя, фамилия, адрес электронной почты, криптографический хэш пароля, изображение профиля."
                  : "First name, last name, email address, cryptographic salted password hash, profile picture."}
              </li>
              <li>
                <strong>{isKz ? "Оқу және өтінім деректері:" : isRu ? "Академические данные:" : "Academic & Submission Data:"}</strong>{" "}
                {isKz
                  ? "Құжат түрі, мақсатты университет немесе бағдарлама атауы, жүктелген мотивациялық хаттар, түйіндемелер (CV), студенттік жазбалар және менторлардың кері байланыс файлдары."
                  : isRu
                  ? "Тип документа, целевой университет или грантовая программа, загруженные мотивационные письма, резюме (CV), черновики и файлы обратной связи от менторов."
                  : "Document type, target university or scholarship program, uploaded motivation letters, personal statements, CVs/resumes, student notes, and mentor feedback files."}
              </li>
              <li>
                <strong>{isKz ? "Байланыс және мессенджер деректері:" : isRu ? "Мессенджеры и коммуникации:" : "Communications & Telegram Data:"}</strong>{" "}
                {isKz
                  ? "Telegram ID және пайдаланушы аты (хабарламалар мен байланыс үшін)."
                  : isRu
                  ? "Telegram ID и username (при привязке аккаунта для получения уведомлений)."
                  : "Telegram ID and username (when linking the Telegram bot for real-time status alerts)."}
              </li>
              <li>
                <strong>{isKz ? "Төлем деректері:" : isRu ? "Платежные реквизиты:" : "Payment Metadata:"}</strong>{" "}
                {isKz
                  ? "Транзакция нөмірі, сатып алынған пакет түрі. Төлем карталарының деректері біздің серверде САҚТАЛМАЙДЫ және сертификатталған PCI-DSS төлем шлюздері арқылы өңделеді."
                  : isRu
                  ? "Идентификатор транзакции, выбранный пакет услуг. Полные данные банковских карт НЕ сохраняются на наших серверах и обрабатываются напрямую через защищенные шлюзы (PCI-DSS)."
                  : "Transaction identifiers and package tiers. Bank card credentials are NEVER stored on our servers and are processed directly through certified PCI-DSS payment gateways."}
              </li>
              <li>
                <strong>{isKz ? "Техникалық деректер:" : isRu ? "Технические логи:" : "Technical & Telemetry Data:"}</strong>{" "}
                {isKz
                  ? "IP мекенжайы, браузер түрі, кіру уақыты, қателіктер журналдары."
                  : isRu
                  ? "IP-адрес, тип браузера, время посещения, сессионные cookies и системные логи."
                  : "IP address, browser type, timestamps, session cookies, and system diagnostic logs."}
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {isKz ? "3. Деректерді өңдеу мақсаты және құқықтық негізі" : isRu ? "3. Цели и правовые основания обработки" : "3. Purpose and Legal Basis of Processing"}
            </h2>
            <p>
              {isKz
                ? "Дербес деректерді өңдеу келесі мақсаттарда жүргізіледі:"
                : isRu
                ? "Обработка персональных данных осуществляется исключительно в целях:"
                : "Personal data is processed strictly for the following purposes:"}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{isKz ? "Пайдаланушыға жеке кабинетке қолжетімділік беру;" : isRu ? "Предоставления доступа к функционалу личного кабинета;" : "Providing access to the user account dashboard;"}</li>
              <li>{isKz ? "Эсселерді, түйіндемелерді тексеру және білікті менторлық кеңес беру;" : isRu ? "Осуществления проверки эссе, резюме и предоставления менторской обратной связи;" : "Performing editorial document reviews, CV feedback, and mentorship guidance;"}</li>
              <li>{isKz ? "Гранттар мен бағдарламалар мерзімдері туралы жеке хабарламалар жіберу;" : isRu ? "Отправки уведомлений о дедлайнах грантов, статусе проверки документов и системных событиях;" : "Notifying students of grant application deadlines and document review statuses;"}</li>
              <li>{isKz ? "Платформаның қауіпсіздігін қамтамасыз ету және алаяқтық әрекеттердің алдын алу." : isRu ? "Обеспечения информационной безопасности и предотвращения мошеннических действий." : "Ensuring platform cybersecurity and preventing unauthorized account abuse."}</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              {isKz ? "4. Авторлық құқық және эссе құпиялылығы" : isRu ? "4. Авторские права и конфиденциальность студенческих эссе" : "4. Intellectual Property & Essay Confidentiality"}
            </h2>
            <div className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2">
              <p className="font-medium text-foreground">
                {isKz
                  ? "Сіздің жұмыстарыңыз 100% сіздікі болып қалады."
                  : isRu
                  ? "Ваши работы остаются исключительно вашей собственностью."
                  : "Your work remains solely your intellectual property."}
              </p>
              <p>
                {isKz
                  ? "Студент жүктеген мотивациялық хаттар, академиялық эсселер және зерттеу ұсыныстары студенттің жеке авторлық құқығы болып табылады. StudyQadam менторлары құжаттарды тек өңдеу және ұсыныстар беру мақсатында ғана пайдаланады. Сіздің құжаттарыңыз үшінші тұлғаларға жарияланбайды немесе берілмейді."
                  : isRu
                  ? "Загружаемые студентом тексты эссе, мотивационных писем и академических резюме являются объектами авторского права студента. Менторы и проверяющие платформы обязуются соблюдать конфиденциальность и использовать материалы исключительно для подготовки рецензии. Работы не публикуются в открытом доступе и не передаются посторонним лицам."
                  : "All motivation letters, personal essays, and application materials uploaded by students remain their exclusive intellectual property. Mentors and reviewers access submissions strictly to provide constructive feedback under non-disclosure obligations. Submissions are never made public or resold."}
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {isKz ? "5. Трансшекаралық тасымалдау және үшінші тараптар" : isRu ? "5. Трансграничная передача и третьи стороны" : "5. Cross-Border Transfers & Third Parties"}
            </h2>
            <p>
              {isKz
                ? "Шетелдік университеттерге түсуге көмек көрсету аясында және бұлтты инфрақұрылымды (мысалы, серверлік қызметтер, Telegram API, электрондық пошта жүйелері) пайдалану кезінде деректер ҚР аумағынан тыс мемлекеттерде орналасқан қауіпсіз серверлер арқылы өңделуі мүмкін. Платформа барлық халықаралық шифрлау стандарттарын сақтайды."
                : isRu
                ? "В рамках оказания услуг по содействию в поступлении в зарубежные учебные заведения и использования облачной инфраструктуры (серверные мощности, Telegram API, почтовые шлюзы) данные могут обрабатываться с использованием защищенных серверов, в том числе за пределами Республики Казахстан, с соблюдением требований о надежном шифровании."
                : "In facilitating international university admissions and utilizing modern cloud services (hosting, email delivery, Telegram API), data may be securely transmitted and stored using industry-standard encrypted channels, in compliance with cross-border transfer requirements."}
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" />
              {isKz ? "6. Пайдаланушының құқықтары және деректерді өшіру" : isRu ? "6. Права Пользователя и удаление данных" : "6. User Rights and Data Deletion"}
            </h2>
            <p>
              {isKz
                ? "Қазақстан Республикасының заңнамасына және халықаралық нормаларға сәйкес, Сіз келесі құқықтарға иесіз:"
                : isRu
                ? "В соответствии с законодательством Республики Казахстан и международными нормами, Вы имеете право:"
                : "In accordance with personal data protection laws, You have the right to:"}
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>{isKz ? "Өз дербес деректеріңіздің бар-жоғын және өңделу тәртібін тексеру;" : isRu ? "Получать информацию о наличии и порядке обработки ваших данных;" : "Access information regarding what personal data is stored about you;"}</li>
              <li>{isKz ? "Деректердің дұрыс еместігі немесе ескіруі кезінде оларды өзгерту немесе толықтыру;" : isRu ? "Требовать изменения или уточнения неполных или неточных данных;" : "Request correction or updating of inaccurate or outdated data;"}</li>
              <li>{isKz ? "Дербес деректерді жинауға берген келісімді кез келген уақытта кері қайтарып алу;" : isRu ? "Отозвать согласие на обработку персональных данных в любой момент;" : "Withdraw your consent to personal data processing at any time;"}</li>
              <li>{isKz ? "Аккаунт пен барлық файлдарды толық өшіруді талап ету («ұмытылу құқығы»)." : isRu ? "Потребовать полного удаления аккаунта и загруженных материалов («право на забвение»)." : "Request permanent deletion of your account and uploaded files ('right to erasure')."}</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {isKz ? "7. Байланыс және сұраныстарды қабылдау" : isRu ? "7. Контакты и обратная связь" : "7. Inquiries & Data Protection Contact"}
            </h2>
            <p>
              {isKz
                ? "Дербес деректерді өңдеу, өзгерту немесе өшіру бойынша кез келген сауалдар бойынша бізге ресми пошта арқылы немесе Telegram арқылы хабарласуға болады:"
                : isRu
                ? "По всем вопросам, связанным с обработкой, изменением или удалением персональных данных, вы можете обратиться в нашу службу поддержки:"
                : "For any questions, requests for data rectification, or account deletion, please reach out to our dedicated support:"}
            </p>
            <div className="p-4 rounded-lg bg-card border border-border text-xs sm:text-sm space-y-1">
              <div><strong>Email:</strong> privacy@studyqadam.kz</div>
              <div><strong>Telegram:</strong> @studyqadam_corporate</div>
              <div><strong>Platform:</strong> StudyQadam Educational Platform</div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
