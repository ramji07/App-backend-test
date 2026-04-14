require('dotenv').config();
const mongoose = require('mongoose');
const BibleBook = require('../models/BibleBook');
const Verse = require('../models/Verse');
const DailyVerse = require('../models/DailyVerse');

const bibleBooks = [
  // Old Testament
  { name: 'Genesis', abbreviation: 'GEN', testament: 'old', order: 1, chapters: 50, nameTranslations: { en: 'Genesis', hi: 'उत्पत्ति', fr: 'Genèse', es: 'Génesis', de: 'Genesis' } },
  { name: 'Exodus', abbreviation: 'EXO', testament: 'old', order: 2, chapters: 40, nameTranslations: { en: 'Exodus', hi: 'निर्गमन', fr: 'Exode', es: 'Éxodo', de: 'Exodus' } },
  { name: 'Leviticus', abbreviation: 'LEV', testament: 'old', order: 3, chapters: 27, nameTranslations: { en: 'Leviticus', hi: 'लैव्यव्यवस्था', fr: 'Lévitique', es: 'Levítico', de: 'Levitikus' } },
  { name: 'Numbers', abbreviation: 'NUM', testament: 'old', order: 4, chapters: 36, nameTranslations: { en: 'Numbers', hi: 'गिनती', fr: 'Nombres', es: 'Números', de: 'Numeri' } },
  { name: 'Deuteronomy', abbreviation: 'DEU', testament: 'old', order: 5, chapters: 34, nameTranslations: { en: 'Deuteronomy', hi: 'व्यवस्थाविवरण', fr: 'Deutéronome', es: 'Deuteronomio', de: 'Deuteronomium' } },
  { name: 'Joshua', abbreviation: 'JOS', testament: 'old', order: 6, chapters: 24, nameTranslations: { en: 'Joshua', hi: 'यहोशू', fr: 'Josué', es: 'Josué', de: 'Josua' } },
  { name: 'Judges', abbreviation: 'JDG', testament: 'old', order: 7, chapters: 21, nameTranslations: { en: 'Judges', hi: 'न्यायियों', fr: 'Juges', es: 'Jueces', de: 'Richter' } },
  { name: 'Ruth', abbreviation: 'RUT', testament: 'old', order: 8, chapters: 4, nameTranslations: { en: 'Ruth', hi: 'रूत', fr: 'Ruth', es: 'Rut', de: 'Rut' } },
  { name: '1 Samuel', abbreviation: '1SA', testament: 'old', order: 9, chapters: 31, nameTranslations: { en: '1 Samuel', hi: '1 शमूएल', fr: '1 Samuel', es: '1 Samuel', de: '1 Samuel' } },
  { name: '2 Samuel', abbreviation: '2SA', testament: 'old', order: 10, chapters: 24, nameTranslations: { en: '2 Samuel', hi: '2 शमूएल', fr: '2 Samuel', es: '2 Samuel', de: '2 Samuel' } },
  { name: '1 Kings', abbreviation: '1KI', testament: 'old', order: 11, chapters: 22, nameTranslations: { en: '1 Kings', hi: '1 राजा', fr: '1 Rois', es: '1 Reyes', de: '1 Könige' } },
  { name: '2 Kings', abbreviation: '2KI', testament: 'old', order: 12, chapters: 25, nameTranslations: { en: '2 Kings', hi: '2 राजा', fr: '2 Rois', es: '2 Reyes', de: '2 Könige' } },
  { name: 'Psalms', abbreviation: 'PSA', testament: 'old', order: 19, chapters: 150, nameTranslations: { en: 'Psalms', hi: 'भजन संहिता', fr: 'Psaumes', es: 'Salmos', de: 'Psalmen' } },
  { name: 'Proverbs', abbreviation: 'PRO', testament: 'old', order: 20, chapters: 31, nameTranslations: { en: 'Proverbs', hi: 'नीतिवचन', fr: 'Proverbes', es: 'Proverbios', de: 'Sprüche' } },
  { name: 'Isaiah', abbreviation: 'ISA', testament: 'old', order: 23, chapters: 66, nameTranslations: { en: 'Isaiah', hi: 'यशायाह', fr: 'Ésaïe', es: 'Isaías', de: 'Jesaja' } },
  { name: 'Jeremiah', abbreviation: 'JER', testament: 'old', order: 24, chapters: 52, nameTranslations: { en: 'Jeremiah', hi: 'यिर्मयाह', fr: 'Jérémie', es: 'Jeremías', de: 'Jeremia' } },
  // New Testament
  { name: 'Matthew', abbreviation: 'MAT', testament: 'new', order: 40, chapters: 28, nameTranslations: { en: 'Matthew', hi: 'मत्ती', fr: 'Matthieu', es: 'Mateo', de: 'Matthäus' } },
  { name: 'Mark', abbreviation: 'MRK', testament: 'new', order: 41, chapters: 16, nameTranslations: { en: 'Mark', hi: 'मरकुस', fr: 'Marc', es: 'Marcos', de: 'Markus' } },
  { name: 'Luke', abbreviation: 'LUK', testament: 'new', order: 42, chapters: 24, nameTranslations: { en: 'Luke', hi: 'लूका', fr: 'Luc', es: 'Lucas', de: 'Lukas' } },
  { name: 'John', abbreviation: 'JHN', testament: 'new', order: 43, chapters: 21, nameTranslations: { en: 'John', hi: 'यूहन्ना', fr: 'Jean', es: 'Juan', de: 'Johannes' } },
  { name: 'Acts', abbreviation: 'ACT', testament: 'new', order: 44, chapters: 28, nameTranslations: { en: 'Acts', hi: 'प्रेरितों के काम', fr: 'Actes', es: 'Hechos', de: 'Apostelgeschichte' } },
  { name: 'Romans', abbreviation: 'ROM', testament: 'new', order: 45, chapters: 16, nameTranslations: { en: 'Romans', hi: 'रोमियों', fr: 'Romains', es: 'Romanos', de: 'Römer' } },
  { name: '1 Corinthians', abbreviation: '1CO', testament: 'new', order: 46, chapters: 16, nameTranslations: { en: '1 Corinthians', hi: '1 कुरिन्थियों', fr: '1 Corinthiens', es: '1 Corintios', de: '1 Korinther' } },
  { name: '2 Corinthians', abbreviation: '2CO', testament: 'new', order: 47, chapters: 13, nameTranslations: { en: '2 Corinthians', hi: '2 कुरिन्थियों', fr: '2 Corinthiens', es: '2 Corintios', de: '2 Korinther' } },
  { name: 'Galatians', abbreviation: 'GAL', testament: 'new', order: 48, chapters: 6, nameTranslations: { en: 'Galatians', hi: 'गलातियों', fr: 'Galates', es: 'Gálatas', de: 'Galater' } },
  { name: 'Ephesians', abbreviation: 'EPH', testament: 'new', order: 49, chapters: 6, nameTranslations: { en: 'Ephesians', hi: 'इफिसियों', fr: 'Éphésiens', es: 'Efesios', de: 'Epheser' } },
  { name: 'Philippians', abbreviation: 'PHP', testament: 'new', order: 50, chapters: 4, nameTranslations: { en: 'Philippians', hi: 'फिलिप्पियों', fr: 'Philippiens', es: 'Filipenses', de: 'Philipper' } },
  { name: 'Colossians', abbreviation: 'COL', testament: 'new', order: 51, chapters: 4, nameTranslations: { en: 'Colossians', hi: 'कुलुस्सियों', fr: 'Colossiens', es: 'Colosenses', de: 'Kolosser' } },
  { name: '1 Thessalonians', abbreviation: '1TH', testament: 'new', order: 52, chapters: 5, nameTranslations: { en: '1 Thessalonians', hi: '1 थिस्सलुनीकियों', fr: '1 Thessaloniciens', es: '1 Tesalonicenses', de: '1 Thessalonicher' } },
  { name: '2 Thessalonians', abbreviation: '2TH', testament: 'new', order: 53, chapters: 3, nameTranslations: { en: '2 Thessalonians', hi: '2 थिस्सलुनीकियों', fr: '2 Thessaloniciens', es: '2 Tesalonicenses', de: '2 Thessalonicher' } },
  { name: '1 Timothy', abbreviation: '1TI', testament: 'new', order: 54, chapters: 6, nameTranslations: { en: '1 Timothy', hi: '1 तीमुथियुस', fr: '1 Timothée', es: '1 Timoteo', de: '1 Timotheus' } },
  { name: '2 Timothy', abbreviation: '2TI', testament: 'new', order: 55, chapters: 4, nameTranslations: { en: '2 Timothy', hi: '2 तीमुथियुस', fr: '2 Timothée', es: '2 Timoteo', de: '2 Timotheus' } },
  { name: 'Hebrews', abbreviation: 'HEB', testament: 'new', order: 58, chapters: 13, nameTranslations: { en: 'Hebrews', hi: 'इब्रानियों', fr: 'Hébreux', es: 'Hebreos', de: 'Hebräer' } },
  { name: 'James', abbreviation: 'JAS', testament: 'new', order: 59, chapters: 5, nameTranslations: { en: 'James', hi: 'याकूब', fr: 'Jacques', es: 'Santiago', de: 'Jakobus' } },
  { name: '1 Peter', abbreviation: '1PE', testament: 'new', order: 60, chapters: 5, nameTranslations: { en: '1 Peter', hi: '1 पतरस', fr: '1 Pierre', es: '1 Pedro', de: '1 Petrus' } },
  { name: '2 Peter', abbreviation: '2PE', testament: 'new', order: 61, chapters: 3, nameTranslations: { en: '2 Peter', hi: '2 पतरस', fr: '2 Pierre', es: '2 Pedro', de: '2 Petrus' } },
  { name: '1 John', abbreviation: '1JN', testament: 'new', order: 62, chapters: 5, nameTranslations: { en: '1 John', hi: '1 यूहन्ना', fr: '1 Jean', es: '1 Juan', de: '1 Johannes' } },
  { name: 'Revelation', abbreviation: 'REV', testament: 'new', order: 66, chapters: 22, nameTranslations: { en: 'Revelation', hi: 'प्रकाशितवाक्य', fr: 'Apocalypse', es: 'Apocalipsis', de: 'Offenbarung' } },
];

const sampleVerses = [
  {
    book: 'John', chapter: 3, verseNumber: 16, testament: 'new',
    text: {
      en: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
      hi: 'क्योंकि परमेश्वर ने जगत से ऐसा प्रेम रखा कि उसने अपना एकलौता पुत्र दे दिया, ताकि जो कोई उस पर विश्वास करे, वह नाश न हो, परन्तु अनन्त जीवन पाए।',
      fr: 'Car Dieu a tant aimé le monde qu\'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu\'il ait la vie éternelle.',
      es: 'Porque de tal manera amó Dios al mundo, que ha dado a su Hijo unigénito, para que todo aquel que en él cree, no se pierda, mas tenga vida eterna.',
      de: 'Denn Gott hat die Welt so sehr geliebt, dass er seinen einzigen Sohn hingab, damit jeder, der an ihn glaubt, nicht verloren gehe, sondern ewiges Leben habe.',
    },
  },
  {
    book: 'Psalms', chapter: 23, verseNumber: 1, testament: 'old',
    text: {
      en: 'The Lord is my shepherd; I shall not want.',
      hi: 'यहोवा मेरा चरवाहा है; मुझे किसी वस्तु की घटी न होगी।',
      fr: 'L\'Éternel est mon berger: je ne manquerai de rien.',
      es: 'El SEÑOR es mi pastor; nada me faltará.',
      de: 'Der HERR ist mein Hirte; mir wird nichts mangeln.',
    },
  },
  {
    book: 'Philippians', chapter: 4, verseNumber: 13, testament: 'new',
    text: {
      en: 'I can do all things through Christ who strengthens me.',
      hi: 'मैं उस मसीह के द्वारा जो मुझे सामर्थ देता है सब कुछ कर सकता हूँ।',
      fr: 'Je puis tout par celui qui me fortifie.',
      es: 'Todo lo puedo en Cristo que me fortalece.',
      de: 'Ich vermag alles durch den, der mich stärkt, Christus.',
    },
  },
  {
    book: 'Romans', chapter: 8, verseNumber: 28, testament: 'new',
    text: {
      en: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
      hi: 'और हम जानते हैं, कि जो लोग परमेश्वर से प्रेम रखते हैं, उनके लिये सब बातें मिलकर भलाई ही को उत्पन्न करती हैं।',
      fr: 'Et nous savons que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein.',
      es: 'Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien, esto es, a los que conforme a su propósito son llamados.',
      de: 'Wir wissen aber, dass denen, die Gott lieben, alle Dinge zum Besten dienen.',
    },
  },
  {
    book: 'Proverbs', chapter: 3, verseNumber: 5, testament: 'old',
    text: {
      en: 'Trust in the Lord with all your heart and lean not on your own understanding.',
      hi: 'अपने सारे मन से यहोवा पर भरोसा रखना, और अपनी समझ का सहारा न लेना।',
      fr: 'Confie-toi en l\'Éternel de tout ton coeur, et ne t\'appuie pas sur ta sagesse.',
      es: 'Fíate de Jehová de todo tu corazón, y no te apoyes en tu propia prudencia.',
      de: 'Vertrau auf den HERRN von ganzem Herzen und verlass dich nicht auf dein Verständnis.',
    },
  },
  {
    book: 'Isaiah', chapter: 40, verseNumber: 31, testament: 'old',
    text: {
      en: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.',
      hi: 'परन्तु जो यहोवा की बाट जोहते हैं, वे नया बल प्राप्त करते जाएंगे; वे उकाबों की नाईं उड़ेंगे, वे दौड़ेंगे और श्रमित न होंगे, वे चलेंगे और थकेंगे नहीं।',
      fr: 'Mais ceux qui se confient en l\'Éternel renouvellent leur force. Ils prennent leur essor comme les aigles.',
      es: 'Pero los que esperan a Jehová tendrán nuevas fuerzas; levantarán alas como las águilas.',
      de: 'Aber die auf den HERRN harren, gewinnen neue Kraft. Sie fahren auf mit Flügeln wie Adler.',
    },
  },
  {
    book: 'Jeremiah', chapter: 29, verseNumber: 11, testament: 'old',
    text: {
      en: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
      hi: 'यहोवा की यह वाणी है: मैं जानता हूँ कि मेरे मन में तुम्हारे लिये क्या विचार हैं, वे शान्ति के विचार हैं विपत्ति के नहीं, इसलिये कि तुम्हारा भविष्य और आशा बनी रहे।',
      fr: 'Car je connais les projets que j\'ai formés sur vous, dit l\'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et une espérance.',
      es: 'Porque yo sé los pensamientos que tengo acerca de vosotros, dice Jehová, pensamientos de paz, y no de mal, para daros el fin que esperáis.',
      de: 'Denn ich kenne meine Gedanken, die ich über euch hege, spricht der HERR: Gedanken des Friedens und nicht des Unheils.',
    },
  },
  {
    book: 'Matthew', chapter: 5, verseNumber: 3, testament: 'new',
    text: {
      en: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.',
      hi: 'धन्य हैं वे जो मन के दीन हैं, क्योंकि स्वर्ग का राज्य उन्हीं का है।',
      fr: 'Heureux les pauvres en esprit, car le royaume des cieux est à eux!',
      es: 'Bienaventurados los pobres en espíritu, porque de ellos es el reino de los cielos.',
      de: 'Selig sind die geistlich Armen; denn das Himmelreich ist ihr.',
    },
  },
  {
    book: 'Genesis', chapter: 1, verseNumber: 1, testament: 'old',
    text: {
      en: 'In the beginning God created the heavens and the earth.',
      hi: 'आदि में परमेश्वर ने आकाश और पृथ्वी की सृष्टि की।',
      fr: 'Au commencement, Dieu créa les cieux et la terre.',
      es: 'En el principio creó Dios los cielos y la tierra.',
      de: 'Am Anfang schuf Gott Himmel und Erde.',
    },
  },
  {
    book: 'Psalms', chapter: 23, verseNumber: 4, testament: 'old',
    text: {
      en: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.',
      hi: 'चाहे मैं मृत्यु की छाया की तराई में से होकर चलूँ, तौभी बुराई से न डरूँगा, क्योंकि तू मेरे साथ है।',
      fr: 'Quand je marche dans la vallée de l\'ombre de la mort, Je ne crains aucun mal, car tu es avec moi.',
      es: 'Aunque ande en valle de sombra de muerte, no temeré mal alguno, porque tú estarás conmigo.',
      de: 'Und ob ich schon wanderte im finstern Tal, fürchte ich kein Unglück; denn du bist bei mir.',
    },
  },
  {
    book: 'John', chapter: 1, verseNumber: 1, testament: 'new',
    text: {
      en: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
      hi: 'आदि में वचन था, वचन परमेश्वर के साथ था, और वचन परमेश्वर था।',
      fr: 'Au commencement était la Parole, et la Parole était avec Dieu, et la Parole était Dieu.',
      es: 'En el principio era el Verbo, y el Verbo era con Dios, y el Verbo era Dios.',
      de: 'Im Anfang war das Wort, und das Wort war bei Gott, und Gott war das Wort.',
    },
  },
  {
    book: 'Romans', chapter: 3, verseNumber: 23, testament: 'new',
    text: {
      en: 'For all have sinned and fall short of the glory of God.',
      hi: 'इसलिये कि सब ने पाप किया है और परमेश्वर की महिमा से रहित हैं।',
      fr: 'Car tous ont péché et sont privés de la gloire de Dieu.',
      es: 'Por cuanto todos pecaron, y están destituidos de la gloria de Dios.',
      de: 'Denn alle haben gesündigt und die Herrlichkeit Gottes verloren.',
    },
  },
  {
    book: 'Matthew', chapter: 28, verseNumber: 19, testament: 'new',
    text: {
      en: 'Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit.',
      hi: 'इसलिये तुम जाकर सब जातियों के लोगों को चेला बनाओ, और उन्हें पिता और पुत्र और पवित्र आत्मा के नाम से बपतिस्मा दो।',
      fr: 'Allez donc et faites de toutes les nations des disciples, les baptisant au nom du Père, du Fils et du Saint-Esprit.',
      es: 'Por tanto, id, y haced discípulos a todas las naciones, bautizándolos en el nombre del Padre, y del Hijo, y del Espíritu Santo.',
      de: 'Darum geht hin und macht zu Jüngern alle Völker: Tauft sie auf den Namen des Vaters und des Sohnes und des Heiligen Geistes.',
    },
  },
  {
    book: 'Ephesians', chapter: 2, verseNumber: 8, testament: 'new',
    text: {
      en: 'For it is by grace you have been saved, through faith—and this is not from yourselves, it is the gift of God.',
      hi: 'क्योंकि विश्वास के द्वारा अनुग्रह ही से तुम्हारा उद्धार हुआ है, और यह तुम्हारी ओर से नहीं, वरन् परमेश्वर का दान है।',
      fr: 'Car c\'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c\'est le don de Dieu.',
      es: 'Porque por gracia sois salvos por medio de la fe; y esto no de vosotros, pues es don de Dios.',
      de: 'Denn aus Gnade seid ihr gerettet durch den Glauben, und das nicht aus euch – Gottes Gabe ist es.',
    },
  },
  {
    book: '1 John', chapter: 4, verseNumber: 8, testament: 'new',
    text: {
      en: 'Whoever does not love does not know God, because God is love.',
      hi: 'जो प्रेम नहीं रखता, वह परमेश्वर को नहीं जानता, क्योंकि परमेश्वर प्रेम है।',
      fr: 'Celui qui n\'aime pas n\'a pas connu Dieu, car Dieu est amour.',
      es: 'El que no ama, no ha conocido a Dios; porque Dios es amor.',
      de: 'Wer nicht liebt, hat Gott nicht erkannt; denn Gott ist Liebe.',
    },
  },
];

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: 5 });
  console.log('✅ Connected to MongoDB');
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding Bible books...');
    await BibleBook.deleteMany({});
    await BibleBook.insertMany(bibleBooks);
    console.log(`✅ ${bibleBooks.length} books seeded.`);

    console.log('🌱 Seeding sample verses...');
    await Verse.deleteMany({});
    await Verse.insertMany(sampleVerses);
    console.log(`✅ ${sampleVerses.length} verses seeded.`);

    console.log('🌱 Seeding daily verses...');
    await DailyVerse.deleteMany({});
    const today = new Date().toISOString().split('T')[0];
    const jonVerse = await Verse.findOne({ book: 'John', chapter: 3, verseNumber: 16 });
    if (jonVerse) {
      await DailyVerse.create({
        date: today,
        verse: jonVerse._id,
        theme: 'God\'s Love',
        devotional: {
          en: 'Today, reflect on the infinite love of God. No matter what you face, remember that you are loved unconditionally.',
          hi: 'आज, परमेश्वर के अनंत प्रेम पर विचार करें। चाहे आप कुछ भी सामना करें, याद रखें कि आप बिना शर्त प्यार किए जाते हैं।',
          fr: 'Aujourd\'hui, réfléchissez à l\'amour infini de Dieu. Quoi que vous affrontiez, souvenez-vous que vous êtes aimés inconditionnellement.',
        },
      });
    }
    console.log('✅ Daily verse seeded.');

    console.log('\n🎉 Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
};

seedData();
