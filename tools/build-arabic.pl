#!/usr/bin/perl
# Builds ar.html from index.html by swapping each English string for its Arabic one.
# Run from the project folder after changing index.html:   perl tools/build-arabic.pl
# Any English string that is no longer found is reported, so nothing is silently left untranslated.
use strict; use warnings;

open(my $in, '<:raw', 'index.html') or die "index.html: $!";
my $html = do { local $/; <$in> }; close $in;
$html =~ s/\r\n/\n/g;

# The structured-data block stays in English (it is read by search engines, not people).
my @keep;
$html =~ s{(<script type="application/ld\+json">.*?</script>)}{ push @keep, $1; "\x00KEEP$#keep\x00" }se;

my @pairs = (
  # ---------- document head ----------
  ['<html lang="en">', '<html lang="ar" dir="rtl">'],
  ['Visra Capital Group — an AI-driven private equity and wealth management firm structured in the UAE, dedicated to building enduring wealth for high-net-worth individuals and family offices.',
   'فيسرا كابيتال غروب — شركة ملكية خاصة وإدارة ثروات يقودها الذكاء الاصطناعي، مؤسَّسة في دولة الإمارات، وتكرّس عملها لبناء ثروة دائمة للأفراد ذوي الملاءة المالية العالية والمكاتب العائلية.'],
  ['<title>Visra Capital Group — AI-Driven Private Equity &amp; Wealth Management</title>',
   '<title>فيسرا كابيتال غروب — ملكية خاصة وإدارة ثروات يقودهما الذكاء الاصطناعي</title>'],
  ['<meta property="og:title" content="Visra Capital Group" />', '<meta property="og:title" content="فيسرا كابيتال غروب" />'],
  ['AI-driven private equity & wealth management for high-net-worth individuals. Structured in the UAE.',
   'ملكية خاصة وإدارة ثروات يقودهما الذكاء الاصطناعي للأفراد ذوي الملاءة المالية العالية. مؤسَّسة في دولة الإمارات.'],
  ['<meta property="og:locale" content="en_GB" />', '<meta property="og:locale" content="ar_AE" />'],
  ['<meta property="og:locale:alternate" content="ar_AE" />', '<meta property="og:locale:alternate" content="en_GB" />'],
  # the Arabic page is its own address for search engines and link previews
  ['<meta property="og:url" content="https://visracapitalaiteam-creator.github.io/visracapitaladvance/" />',
   '<meta property="og:url" content="https://visracapitalaiteam-creator.github.io/visracapitaladvance/ar.html" />'],
  ['<link rel="canonical" href="https://visracapitalaiteam-creator.github.io/visracapitaladvance/" />',
   '<link rel="canonical" href="https://visracapitalaiteam-creator.github.io/visracapitaladvance/ar.html" />'],
  ['Visra Capital Group — Private capital, guided by intelligence.', 'فيسرا كابيتال غروب — رأس مال خاص، يقوده الذكاء.'],
  ['family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap',
   'family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap'],

  # ---------- header ----------
  ['Skip to content', 'تخطَّ إلى المحتوى'],
  ['aria-label="Visra Capital Group, home"', 'aria-label="فيسرا كابيتال غروب، الصفحة الرئيسية"'],
  ['aria-label="Primary"', 'aria-label="القائمة الرئيسية"'],
  ['aria-label="Open menu"', 'aria-label="فتح القائمة"'],
  ['<a class="nav__lang" href="ar.html" lang="ar" hreflang="ar">العربية</a>', '<a class="nav__lang" href="index.html" lang="en" hreflang="en">English</a>'],
  ['>Approach</a>', '>نهجنا</a>'],
  ['>Services</a>', '>خدماتنا</a>'],
  ['>Intelligence</a>', '>الذكاء</a>'],
  ['>Portfolio</a>', '>المحفظة</a>'],
  ['>Contact</a>', '>تواصل معنا</a>'],
  ['>Request access</a>', '>اطلب التواصل</a>'],
  ['<span>Request access</span>', '<span>اطلب التواصل</span>'],

  # ---------- client conveniences ----------
  ['aria-label="Quick actions"', 'aria-label="إجراءات سريعة"'],
  ['<span>Copy email</span>', '<span>نسخ البريد الإلكتروني</span>'],
  ['<span>Save contact</span>', '<span>حفظ جهة الاتصال</span>'],
  ['<span>Share</span>', '<span>مشاركة</span>'],
  ['<span>Print overview</span>', '<span>طباعة نبذة</span>'],
  ['aria-label="Back to top"', 'aria-label="العودة إلى الأعلى"'],
  ['<meta name="apple-mobile-web-app-title" content="Visra" />', '<meta name="apple-mobile-web-app-title" content="فيسرا" />'],

  # ---------- hero ----------
  ['AI-Driven Solutions', 'حلول يقودها الذكاء الاصطناعي'],
  ['Private capital,<br />guided by <em>intelligence</em>.', 'رأس مال خاص،<br />يقوده <em>الذكاء</em>.'],
  ['Visra Capital Group unites disciplined private-equity investing with bespoke wealth management — powered by proprietary AI and directed by partners who have built and scaled companies. Structured in the UAE, for high-net-worth individuals and family offices worldwide.',
   'تجمع فيسرا كابيتال غروب بين الاستثمار المنضبط في الملكية الخاصة وإدارة الثروات المصمَّمة لكل عميل — مدعومةً بذكاء اصطناعي خاص بنا، وبإدارة شركاء أسّسوا شركات ونمّوها. مؤسَّسة في دولة الإمارات، لخدمة الأفراد ذوي الملاءة المالية العالية والمكاتب العائلية حول العالم.'],
  ['Request a private consultation', 'اطلب استشارة خاصة'],
  ['Explore our approach', 'تعرّف على نهجنا'],
  ['<span>Discretionary mandates</span>', '<span>تفويضات إدارة تقديرية</span>'],
  ['<span>Absolute confidentiality</span>', '<span>سرّية تامة</span>'],
  ['<span>Global reach</span>', '<span>حضور عالمي</span>'],
  ['<span>AI-Driven Intelligence</span>', '<span>استثمار يقوده الذكاء الاصطناعي</span>'],
  ['<span>Discretionary Mandates</span>', '<span>تفويضات تقديرية</span>'],
  ['<span>UAE-Structured</span>', '<span>مؤسَّسة في الإمارات</span>'],
  ['<span>Institutional Standards</span>', '<span>معايير مؤسسية</span>'],
  ['<span>Absolute Confidentiality</span>', '<span>سرّية تامة</span>'],

  # ---------- philosophy ----------
  ['</span>Our philosophy</p>', '</span>فلسفتنا</p>'],
  ['<span>The discipline of a machine.</span>', '<span>انضباط الآلة.</span>'],
  ['<span>The judgment of <em>experience</em>.</span>', '<span>وحكمة <em>الخبرة</em>.</span>'],
  ['We built Visra on a simple conviction: the best investment decisions come from pairing relentless, unbiased analysis with the wisdom of people who have done this before.',
   'تأسّست فيسرا على قناعة بسيطة: أفضل القرارات الاستثمارية تأتي من الجمع بين تحليل دؤوب غير منحاز وحكمة من خاضوا هذا المجال من قبل.'],
  ['Technology finds the signal — our partners decide what to do with it.', 'التقنية ترصد الإشارة — وشركاؤنا يقرّرون ما يُفعل بها.'],
  ['Machine precision, human judgment', 'دقّة الآلة وحكمة الإنسان'],
  ['Proprietary AI surfaces the few opportunities worth pursuing across thousands. Seasoned partners make every final call — no decision is left to the model alone.',
   'يرصد ذكاؤنا الاصطناعي الخاص الفرص القليلة الجديرة بالمتابعة من بين الآلاف. ويتّخذ شركاؤنا المتمرّسون كل قرار نهائي — فلا يُترك أي قرار للنموذج وحده.'],
  ['Aligned for the long term', 'التزام على المدى الطويل'],
  ['We think in decades, not quarters, and structure every mandate so our interests move in the same direction as yours. Enduring wealth is built patiently.',
   'نفكّر بالعقود لا بالأرباع السنوية، ونصمّم كل تفويض بحيث تسير مصالحنا في اتجاه مصالحكم. فالثروة الدائمة تُبنى بالصبر.'],
  ['Built in the UAE, global in reach', 'تأسّست في الإمارات، بحضور عالمي'],
  ['A modern, remote-first firm headquartered in the Emirates and operating to institutional standards — serving discerning clients wherever they are in the world.',
   'شركة حديثة تعمل عن بُعد، مقرّها الإمارات وتلتزم بالمعايير المؤسسية — تخدم عملاءها المميّزين أينما كانوا في العالم.'],
  ['aria-hidden="true">Dubai</span>', 'aria-hidden="true">دبي</span>'],
  ['Headquartered in Dubai', 'مقرّنا في دبي'],
  ['Serving discerning clients, wherever they are in the world.', 'نخدم عملاءنا المميّزين أينما كانوا في العالم.'],

  # ---------- services ----------
  ['</span>What we do<span', '</span>ما نقدّمه<span'],
  ['Four disciplines, one standard of care.', 'أربعة تخصّصات، ومعيار واحد للعناية.'],
  ['<span class="service__kicker">Private Equity</span>', '<span class="service__kicker">الملكية الخاصة</span>'],
  ['We source, structure, and scale companies.', 'نختار الشركات ونهيكلها وننمّيها.'],
  ['We take meaningful positions in companies with real potential and guide management to compound value, from first diligence through to a disciplined exit.',
   'نستحوذ على حصص مؤثّرة في شركات ذات إمكانات حقيقية، ونرافق إداراتها لتنمية القيمة، من الفحص الأوّلي حتى تخارج منضبط.'],
  ['AI-powered deal sourcing &amp; diligence', 'رصد الصفقات وفحصها بالذكاء الاصطناعي'],
  ['Hands-on operating value creation', 'خلق القيمة عبر المشاركة التشغيلية المباشرة'],
  ['Disciplined, well-timed exits', 'تخارج منضبط في التوقيت المناسب'],
  ['<span class="service__kicker">Wealth Management</span>', '<span class="service__kicker">إدارة الثروات</span>'],
  ['Your capital, thoughtfully composed.', 'ثروتكم، مُدارة بعناية.'],
  ['A bespoke plan for every client, shaped around your goals and your risk, and monitored around the clock by our supercomputer-backed market intelligence.',
   'خطة مصمَّمة لكل عميل وفق أهدافه ومستوى المخاطر الذي يقبله، تراقبها على مدار الساعة منظومتنا لتحليل الأسواق المدعومة بالحواسيب الفائقة.'],
  ['Bespoke, multi-asset portfolio construction', 'بناء محافظ مخصّصة متعدّدة الأصول'],
  ['Tax-aware structuring &amp; wealth transfer', 'هيكلة تراعي الضرائب وانتقال الثروة'],
  ['Supercomputer-backed risk modelling', 'نمذجة المخاطر بالحواسيب الفائقة'],
  ['<span class="service__kicker">Trading &amp; Markets</span>', '<span class="service__kicker">التداول والأسواق</span>'],
  ['Systematic execution across markets.', 'تنفيذ منهجي عبر الأسواق.'],
  ['The discipline of systematic trading applied to every mandate — how each position is entered, hedged, and unwound as market conditions shift.',
   'انضباط التداول المنهجي مطبَّقًا على كل تفويض — كيف يُفتح كل مركز ويُتحوَّط له ويُغلق مع تغيّر أحوال السوق.'],
  ['Timed entries &amp; exits, weighed on liquidity', 'دخول وخروج مدروسا التوقيت وفق السيولة'],
  ['Continuous hedging of concentrated exposures', 'تحوّط مستمر للانكشافات المركَّزة'],
  ['Signal-led rebalancing between funding events', 'إعادة توازن تقودها الإشارات بين جولات التمويل'],
  ['<span class="service__kicker">Family Office</span>', '<span class="service__kicker">المكتب العائلي</span>'],
  ["Your family's wealth, fully looked after.", 'ثروة عائلتكم، في رعاية كاملة.'],
  ['A single point of trust for everything beyond the portfolio, from governance and succession to the day-to-day details of family life.',
   'جهة واحدة موثوقة لكل ما يتجاوز المحفظة، من الحوكمة وتعاقب الأجيال إلى تفاصيل الحياة اليومية للعائلة.'],
  ['Consolidated reporting &amp; governance', 'تقارير موحَّدة وحوكمة'],
  ['Succession &amp; estate planning', 'تخطيط التعاقب والتركات'],
  ['Concierge &amp; lifestyle services', 'خدمات الكونسيرج ونمط الحياة'],

  # ---------- intelligence ----------
  ['</span>The intelligence layer</p>', '</span>منظومة الذكاء</p>'],
  ['AI that works quietly <br class="hide-mobile" />behind every decision.', 'ذكاء اصطناعي يعمل بهدوء <br class="hide-mobile" />خلف كل قرار.'],
  ["Underpinned by dedicated supercomputing infrastructure, a single proprietary system operates across both sides of the firm — sourcing opportunities, monitoring risk, and keeping portfolios aligned to their objectives. It is built to inform our partners' judgment, never to replace it.",
   'بدعم من بنية حوسبة فائقة مخصَّصة، تعمل منظومة واحدة خاصة بنا عبر جانبَي الشركة — ترصد الفرص، وتراقب المخاطر، وتُبقي المحافظ متوافقة مع أهدافها. صُمِّمت لتدعم حكم شركائنا، لا لتحلّ محلّه.'],
  ['>Stage 01<', '>المرحلة 01<'], ['>Stage 02<', '>المرحلة 02<'], ['>Stage 03<', '>المرحلة 03<'], ['>Stage 04<', '>المرحلة 04<'],
  ['<h3>Signal &amp; sourcing</h3>', '<h3>الرصد واستقطاب الفرص</h3>'],
  ["Models scan thousands of companies and markets to surface the few opportunities that merit our partners' attention.",
   'تمسح النماذج آلاف الشركات والأسواق لتُبرز الفرص القليلة التي تستحق اهتمام شركائنا.'],
  ['<h3>Continuous risk monitoring</h3>', '<h3>مراقبة مستمرة للمخاطر</h3>'],
  ['Positions are watched continuously rather than reviewed quarter to quarter, so exposures are understood as conditions change.',
   'تُراقَب المراكز باستمرار لا مرّة كل ربع سنة، فتُفهم الانكشافات مع تغيّر الظروف.'],
  ['<h3>Adaptive allocation</h3>', '<h3>توزيع متكيّف للأصول</h3>'],
  ['Allocations are recalibrated as the landscape shifts — always proposed by the system, always ratified by people.',
   'يُعاد ضبط التوزيع مع تغيّر المشهد — تقترحه المنظومة دائمًا، ويعتمده الإنسان دائمًا.'],
  ['<h3>Human oversight</h3>', '<h3>إشراف بشري</h3>'],
  ['Every meaningful decision is reviewed and approved by the investment committee. Accountability stays with the partners.',
   'كل قرار مهمّ تراجعه لجنة الاستثمار وتعتمده. والمسؤولية تبقى على عاتق الشركاء.'],

  # ---------- portfolio ----------
  ['</span>Portfolio</p>', '</span>المحفظة</p>'],
  ['Where we build conviction.', 'حيث نبني قناعاتنا.'],
  ['We concentrate on sectors where technology, capital, and timing intersect — the arenas our intelligence and our partners understand most deeply. These focus areas shape how we deploy capital on behalf of our clients.',
   'نركّز على القطاعات التي تلتقي فيها التقنية ورأس المال والتوقيت — المجالات التي تفهمها منظومتنا وشركاؤنا بأعمق صورة. وهذه المجالات توجّه طريقة توظيفنا لرأس المال نيابةً عن عملائنا.'],
  ['Artificial Intelligence &amp; Deep Tech', 'الذكاء الاصطناعي والتقنيات العميقة'],
  ['Foundational models, automation, and the compute infrastructure that powers them.', 'النماذج الأساسية والأتمتة وبنية الحوسبة التي تشغّلها.'],
  ['Financial Services &amp; Fintech', 'الخدمات المالية والتقنية المالية'],
  ['Platforms modernising how capital moves, lends, and settles across markets.', 'منصّات تحدّث طريقة انتقال رأس المال وإقراضه وتسويته عبر الأسواق.'],
  ['Healthcare &amp; Life Sciences', 'الرعاية الصحية وعلوم الحياة'],
  ['Companies advancing diagnostics, therapeutics, and the science of longevity.', 'شركات تطوّر التشخيص والعلاج وعلوم طول العمر.'],
  ['Real Assets &amp; Infrastructure', 'الأصول الحقيقية والبنية التحتية'],
  ['Durable, income-generating assets that anchor a portfolio through cycles.', 'أصول متينة مدرّة للدخل تمنح المحفظة ثباتها عبر الدورات الاقتصادية.'],
  ['Consumer &amp; Digital Commerce', 'المستهلك والتجارة الرقمية'],
  ['Brands and platforms defining how the next generation discovers and spends.', 'علامات ومنصّات ترسم طريقة اكتشاف الجيل القادم وإنفاقه.'],
  ['Energy Transition', 'تحوّل الطاقة'],
  ['The technologies and assets decarbonising the global economy.', 'التقنيات والأصول التي تخفّض انبعاثات الكربون في الاقتصاد العالمي.'],
  ['Representative focus areas that guide our strategy — not an offer of securities or a record of holdings.',
   'مجالات تركيز تمثيلية توجّه استراتيجيتنا — وليست عرضًا لأوراق مالية ولا سجلًّا لحيازاتنا.'],

  # ---------- how we work ----------
  ['</span>How we work<span', '</span>كيف نعمل<span'],
  ['>How we work</a>', '>كيف نعمل</a>'],
  ['From first conversation to lasting stewardship.', 'من المحادثة الأولى إلى رعاية دائمة.'],
  ['<h3 class="step__title">Introduction</h3>', '<h3 class="step__title">التعارف</h3>'],
  ['It begins with a private enquiry. A partner responds personally and in confidence.', 'تبدأ العلاقة باستفسار خاص، يردّ عليه أحد الشركاء شخصيًا وبسرّية.'],
  ['<h3 class="step__title">Discovery</h3>', '<h3 class="step__title">الاستماع</h3>'],
  ['We listen first — to your goals, your appetite for risk, and the life your wealth should fund.', 'نستمع أولًا — إلى أهدافكم، ومدى تقبّلكم للمخاطر، والحياة التي تريدون لثروتكم أن تموّلها.'],
  ['<h3 class="step__title">Mandate</h3>', '<h3 class="step__title">التفويض</h3>'],
  ['A bespoke plan is shaped around you, with our interests structured to move in the same direction as yours.', 'تُصاغ خطة خاصة بكم، وتُهيكَل مصالحنا لتسير في اتجاه مصالحكم.'],
  ['<h3 class="step__title">Stewardship</h3>', '<h3 class="step__title">الرعاية المستمرة</h3>'],
  ['Your capital is monitored continuously by our intelligence layer, with every meaningful decision ratified by our partners.', 'تراقب منظومة الذكاء لدينا رأس مالكم باستمرار، ويعتمد شركاؤنا كل قرار مهمّ.'],

  # ---------- faq ----------
  ['</span>Questions</p>', '</span>أسئلة شائعة</p>'],
  ['>Questions</a>', '>أسئلة شائعة</a>'],
  ['What clients ask us first.', 'ما يسألنا عنه العملاء أولًا.'],
  ["If yours isn't here, ask it privately — a partner will answer.", 'إن لم تجدوا سؤالكم هنا، فاطرحوه علينا بسرّية — وسيجيبكم أحد الشركاء.'],
  ['Who does Visra work with?', 'من هم عملاء فيسرا؟'],
  ['High-net-worth individuals and family offices, wherever they are in the world. We work with a limited number of clients, by introduction and enquiry.',
   'الأفراد ذوو الملاءة المالية العالية والمكاتب العائلية، أينما كانوا في العالم. نعمل مع عدد محدود من العملاء، عبر التعريف والاستفسار المباشر.'],
  ['What does Visra do?', 'ماذا تقدّم فيسرا؟'],
  ['Four disciplines under one standard of care: private equity, wealth management, trading and markets, and family office services.',
   'أربعة تخصّصات بمعيار واحد للعناية: الملكية الخاصة، وإدارة الثروات، والتداول والأسواق، وخدمات المكتب العائلي.'],
  ['How is AI used in your decisions?', 'كيف يُستخدم الذكاء الاصطناعي في قراراتكم؟'],
  ["A single proprietary system surfaces opportunities, monitors risk continuously, and proposes how allocations should adapt. It is built to inform our partners' judgment, never to replace it — every final call is made by people.",
   'منظومة واحدة خاصة بنا ترصد الفرص، وتراقب المخاطر باستمرار، وتقترح كيف يتكيّف توزيع الأصول. صُمِّمت لتدعم حكم شركائنا لا لتحلّ محلّه — فكل قرار نهائي يتّخذه إنسان.'],
  ['Where is Visra based?', 'أين يقع مقرّ فيسرا؟'],
  ['We are structured in the United Arab Emirates and headquartered in Dubai — a modern, remote-first firm serving clients worldwide.',
   'نحن مؤسَّسون في دولة الإمارات العربية المتحدة ومقرّنا دبي — شركة حديثة تعمل عن بُعد وتخدم عملاء حول العالم.'],
  ['Is my enquiry confidential?', 'هل استفساري سرّي؟'],
  ['Yes. Every enquiry is treated in strict confidence, and we never share your details.', 'نعم. نتعامل مع كل استفسار بسرّية تامة، ولا نشارك بياناتكم مع أحد.'],
  ['How do I begin?', 'كيف أبدأ؟'],
  ["Send a <a href=\"#contact\">private enquiry</a>. Tell us a little about what you're building toward, and a partner will respond personally.",
   'أرسلوا <a href="#contact">استفسارًا خاصًا</a>. حدّثونا قليلًا عمّا تسعون إليه، وسيردّ عليكم أحد الشركاء شخصيًا.'],

  # ---------- manifesto ----------
  ['aria-label="Our conviction"', 'aria-label="قناعتنا"'],
  ['We believe capital should be compounded with <em>care</em>&nbsp;— guided by <em>intelligence</em>, and always answerable to <em>people</em>.',
   'نؤمن بأن رأس المال يجب أن يُنمّى <em>بعناية</em>&nbsp;— يقوده <em>الذكاء</em>، ويبقى دائمًا مسؤولًا أمام <em>الإنسان</em>.'],
  ['</span>Visra Capital Group<span', '</span>فيسرا كابيتال غروب<span'],

  # ---------- contact ----------
  ['</span>Request access</p>', '</span>طلب التواصل</p>'],
  ['Begin a private conversation.', 'ابدأ محادثة خاصة.'],
  ["We work with a limited number of clients by introduction and enquiry. Tell us a little about what you're building toward, and a partner will respond personally and in confidence.",
   'نعمل مع عدد محدود من العملاء عبر التعريف والاستفسار المباشر. حدّثونا قليلًا عمّا تسعون إليه، وسيردّ عليكم أحد الشركاء شخصيًا وبسرّية.'],
  ['<li>Reviewed personally by a partner</li>', '<li>يراجعه أحد الشركاء شخصيًا</li>'],
  ['<li>Held in strict confidence</li>', '<li>يُحفظ بسرّية تامة</li>'],
  ['<li>By introduction or enquiry</li>', '<li>عبر التعريف أو الاستفسار</li>'],
  ['<span>Dubai, United Arab Emirates</span>', '<span>دبي، الإمارات العربية المتحدة</span>'],
  ['<span class="footer__muted">Dubai, United Arab Emirates</span>', '<span class="footer__muted">دبي، الإمارات العربية المتحدة</span>'],
  ['<span class="form__kicker">Private enquiry</span>', '<span class="form__kicker">استفسار خاص</span>'],
  ['Strictly confidential', 'سرّي للغاية'],
  ['Your enquiry is ready to send.', 'استفساركم جاهز للإرسال.'],
  ['Your email app is opening with your message addressed to us — press send there to deliver it in confidence. Nothing opened? Write to us at',
   'يُفتح الآن تطبيق البريد الإلكتروني لديكم ورسالتكم موجَّهة إلينا — اضغطوا «إرسال» هناك لتصلنا بسرّية. لم يُفتح شيء؟ راسلونا على'],
  ['<label for="name">Full name ', '<label for="name">الاسم الكامل '],
  ['<label for="company">Company / family office <span class="opt">(optional)</span>', '<label for="company">الشركة / المكتب العائلي <span class="opt">(اختياري)</span>'],
  ['<label for="email">Email ', '<label for="email">البريد الإلكتروني '],
  ['<input type="email" id="email"', '<input type="email" dir="ltr" id="email"'],
  ['<legend>Area of interest</legend>', '<legend>مجال الاهتمام</legend>'],
  ['value="Private Equity" /><span>Private Equity</span>', 'value="الملكية الخاصة" /><span>الملكية الخاصة</span>'],
  ['value="Wealth Management" /><span>Wealth Management</span>', 'value="إدارة الثروات" /><span>إدارة الثروات</span>'],
  ['value="Trading &amp; Markets" /><span>Trading &amp; Markets</span>', 'value="التداول والأسواق" /><span>التداول والأسواق</span>'],
  ['value="Family Office" /><span>Family Office</span>', 'value="المكتب العائلي" /><span>المكتب العائلي</span>'],
  ['value="Not sure yet" /><span>Not sure yet</span>', 'value="لم أحدّد بعد" /><span>لم أحدّد بعد</span>'],
  ['<label for="message">How can we help? ', '<label for="message">كيف يمكننا مساعدتكم؟ '],
  ["Send enquiry\n", "إرسال الاستفسار\n"],
  ['Your enquiry is treated in strict confidence. We never share your details.', 'نتعامل مع استفساركم بسرّية تامة، ولا نشارك بياناتكم مع أحد.'],

  # ---------- footer ----------
  ['AI-driven private equity and wealth management for individuals and families who think in generations, not quarters.',
   'ملكية خاصة وإدارة ثروات يقودهما الذكاء الاصطناعي، لأفراد وعائلات يفكّرون بالأجيال لا بالأرباع السنوية.'],
  ['aria-label="Explore"', 'aria-label="استكشف"'],
  ['<h4>Explore</h4>', '<h4>استكشف</h4>'],
  ['aria-label="Get in touch"', 'aria-label="تواصل معنا"'],
  ['<h4>Get in touch</h4>', '<h4>تواصل معنا</h4>'],
  ['Visra Capital Group. All rights reserved.', 'فيسرا كابيتال غروب. جميع الحقوق محفوظة.'],
  ['<a class="footer__link" href="privacy.html">Privacy</a>', '<a class="footer__link" href="privacy-ar.html">الخصوصية</a>'],
  ['<a class="footer__link" href="ar.html" lang="ar" hreflang="ar">العربية</a>', '<a class="footer__link" href="index.html" lang="en" hreflang="en">English</a>'],
  ['This website is for informational purposes only and does not constitute an offer, solicitation, or investment advice. Investing involves risk, including the possible loss of capital. Structured in the United Arab Emirates.',
   'هذا الموقع لأغراض معلوماتية فقط، ولا يشكّل عرضًا أو دعوة أو مشورة استثمارية. ينطوي الاستثمار على مخاطر، منها احتمال خسارة رأس المال. مؤسَّسة في دولة الإمارات العربية المتحدة.'],
);

my @missing;
for my $p (@pairs) {
  my ($en, $ar) = @$p;
  my $n = ($html =~ s/\Q$en\E/$ar/g);
  push @missing, $en unless $n;
}

$html =~ s/\x00KEEP(\d+)\x00/$keep[$1]/g;

open(my $out, '>:raw', 'ar.html') or die "ar.html: $!";
print $out $html; close $out;

if (@missing) {
  print "NOT FOUND (", scalar(@missing), "):\n";
  print "  - ", substr($_, 0, 90), "\n" for @missing;
  exit 1;
}
print "ar.html written: ", scalar(@pairs), " strings translated\n";
