/**
 * Multi-language Support Configuration
 * Supports Hindi, Telugu, Tamil, and English
 */

const translations = {
    en: {
        // Navigation
        home: "Home",
        about: "About",
        elections: "Elections",
        results: "Results",
        contact: "Contact",
        adminPanel: "Admin Panel",
        login: "Login",
        register: "Register",
        logout: "Logout",
        welcome: "Welcome",
        selectLanguage: "Select Language",
        
        // Hero Section
        heroTitle: "Secure Online Voting with Face Recognition",
        heroSubtitle: "Cast your vote from anywhere, anytime with our secure and transparent voting platform enhanced with biometric verification.",
        voteNow: "Vote Now",
        
        // Features
        featuresTitle: "Why Choose SecureVote?",
        secureEncrypted: "Secure & Encrypted",
        secureDesc: "Military-grade encryption ensures your vote remains confidential and tamper-proof.",
        faceRecognition: "Face Recognition",
        faceDesc: "Advanced biometric verification to ensure one person, one vote.",
        aiAssistant: "AI Assistant",
        aiDesc: "Get instant help with our AI chatbot for any voting-related queries.",
        idAuth: "ID-Based Authentication",
        idDesc: "Secure login using your Voter ID or Student ID with age verification.",
        
        // Elections
        activeElections: "Active Elections",
        electionStatus: "Status",
        totalVoters: "Total Voters",
        votesCast: "Votes Cast",
        participation: "Participation",
        candidates: "Candidates",
        
        // Results
        electionResults: "Election Results",
        liveResults: "Live Results",
        completedElections: "Completed Elections",
        upcomingElections: "Upcoming Elections",
        votes: "votes",
        winner: "Winner",
        viewFullResults: "View Full Results",
        starts: "Starts",
        facultyElectionDesc: "Election for faculty senate representatives",
        alumniElectionDesc: "Election for alumni association board members",
        
        // Contact
        contactUs: "Contact Us",
        getInTouch: "Get in touch with our support team",
        ourOffice: "Our Office",
        phone: "Phone",
        email: "Email",
        supportHours: "Support Hours",
        sendMessage: "Send us a Message",
        fullName: "Full Name",
        emailAddress: "Email Address",
        subject: "Subject",
        message: "Message",
        send: "Send Message",
        businessHours: "Mon-Fri: 9:00 AM - 6:00 PM",
        weekdays: "Monday - Friday: 9AM - 6PM",
        saturday: "Saturday: 10AM - 4PM",
        sunday: "Sunday: Closed",
        
        // Auth Modal
        loginToAccount: "Login to Your Account",
        voterId: "Voter ID / Student ID",
        createAccount: "Create New Account",
        dateOfBirth: "Date of Birth",
        gender: "Gender",
        male: "Male",
        female: "Female",
        other: "Other",
        faceRegistration: "Face Registration",
        captureFace: "Capture Face",
        completeRegistration: "Complete Registration",
        castYourVote: "Cast Your Vote",
        
        // Placeholders
        enterYourId: "Enter your ID",
        enterFullName: "Enter your full name",
        enterEmail: "Enter your email",
        
        // Chatbot
        chatbotWelcome: "Hello! I'm your VoteAssistant. How can I help you with the voting process today?",
        askAboutVoting: "Ask me about voting...",
        
        // Footer
        companyDesc: "Making democratic participation accessible, secure, and convenient for everyone.",
        quickLinks: "Quick Links",
        copyright: "All rights reserved."
    },

    hi: {
        // Navigation
        home: "होम",
        about: "के बारे में",
        elections: "चुनाव",
        results: "परिणाम",
        contact: "संपर्क",
        adminPanel: "एडमिन पैनल",
        login: "लॉगिन",
        register: "रजिस्टर",
        logout: "लॉगआउट",
        welcome: "स्वागत है",
        selectLanguage: "भाषा चुनें",
        
        // Hero Section
        heroTitle: "फेस रिकग्निशन के साथ सुरक्षित ऑनलाइन वोटिंग",
        heroSubtitle: "बायोमेट्रिक सत्यापन से सुसज्जित हमारे सुरक्षित और पारदर्शी वोटिंग प्लेटफॉर्म के साथ कहीं से भी, कभी भी वोट डालें।",
        voteNow: "अभी वोट करें",
        
        // Features
        featuresTitle: "सिक्योरवोट क्यों चुनें?",
        secureEncrypted: "सुरक्षित और एन्क्रिप्टेड",
        secureDesc: "मिलिट्री-ग्रेड एन्क्रिप्शन सुनिश्चित करता है कि आपका वोट गोपनीय और टैम्पर-प्रूफ रहे।",
        faceRecognition: "फेस रिकग्निशन",
        faceDesc: "एक व्यक्ति, एक वोट सुनिश्चित करने के लिए उन्नत बायोमेट्रिक सत्यापन।",
        aiAssistant: "AI असिस्टेंट",
        aiDesc: "वोटिंग संबंधी किसी भी प्रश्न के लिए तुरंत मदद प्राप्त करें।",
        idAuth: "आईडी-आधारित प्रमाणीकरण",
        idDesc: "आयु सत्यापन के साथ आपके वोटर आईडी या स्टूडेंट आईडी का उपयोग करके सुरक्षित लॉगिन।",
        
        // Elections
        activeElections: "सक्रिय चुनाव",
        electionStatus: "स्थिति",
        totalVoters: "कुल मतदाता",
        votesCast: "डाले गए वोट",
        participation: "भागीदारी",
        candidates: "उम्मीदवार",
        
        // Results
        electionResults: "चुनाव परिणाम",
        liveResults: "लाइव परिणाम",
        completedElections: "पूर्ण चुनाव",
        upcomingElections: "आगामी चुनाव",
        votes: "वोट",
        winner: "विजेता",
        viewFullResults: "पूर्ण परिणाम देखें",
        starts: "शुरू",
        facultyElectionDesc: "फैकल्टी सीनेट प्रतिनिधियों के लिए चुनाव",
        alumniElectionDesc: "एलुमनी एसोसिएशन बोर्ड सदस्यों के लिए चुनाव",
        
        // Contact
        contactUs: "हमसे संपर्क करें",
        getInTouch: "हमारी सहायता टीम से संपर्क करें",
        ourOffice: "हमारा कार्यालय",
        phone: "फोन",
        email: "ईमेल",
        supportHours: "समर्थन घंटे",
        sendMessage: "हमें एक संदेश भेजें",
        fullName: "पूरा नाम",
        emailAddress: "ईमेल पता",
        subject: "विषय",
        message: "संदेश",
        send: "संदेश भेजें",
        businessHours: "सोम-शुक्र: सुबह 9:00 - शाम 6:00",
        weekdays: "सोमवार - शुक्रवार: सुबह 9 - शाम 6",
        saturday: "शनिवार: सुबह 10 - शाम 4",
        sunday: "रविवार: बंद",
        
        // Auth Modal
        loginToAccount: "अपने अकाउंट में लॉगिन करें",
        voterId: "वोटर आईडी / छात्र आईडी",
        createAccount: "नया अकाउंट बनाएं",
        dateOfBirth: "जन्म तिथि",
        gender: "लिंग",
        male: "पुरुष",
        female: "महिला",
        other: "अन्य",
        faceRegistration: "फेस रजिस्ट्रेशन",
        captureFace: "फेस कैप्चर करें",
        completeRegistration: "रजिस्ट्रेशन पूरा करें",
        castYourVote: "अपना वोट डालें",
        
        // Placeholders
        enterYourId: "अपना आईडी दर्ज करें",
        enterFullName: "अपना पूरा नाम दर्ज करें",
        enterEmail: "अपना ईमेल दर्ज करें",
        
        // Chatbot
        chatbotWelcome: "नमस्ते! मैं आपका वोटअसिस्टेंट हूं। आज वोटिंग प्रक्रिया में मैं आपकी कैसे मदद कर सकता हूं?",
        askAboutVoting: "मुझसे वोटिंग के बारे में पूछें...",
        
        // Footer
        companyDesc: "लोकतांत्रिक भागीदारी को सभी के लिए सुलभ, सुरक्षित और सुविधाजनक बनाना।",
        quickLinks: "त्वरित लिंक",
        copyright: "सर्वाधिकार सुरक्षित।"
    },

    te: {
        // Navigation
        home: "హోమ్",
        about: "గురించి",
        elections: "ఎన్నికలు",
        results: "ఫలితాలు",
        contact: "సంప్రదించండి",
        adminPanel: "అడ్మిన్ ప్యానెల్",
        login: "లాగిన్",
        register: "నమోదు",
        logout: "లాగ్అవుట్",
        welcome: "స్వాగతం",
        selectLanguage: "భాష ఎంచుకోండి",
        
        // Hero Section
        heroTitle: "ఫేస్ రికగ్నిషన్తో సురక్షిత ఆన్లైన్ వోటింగ్",
        heroSubtitle: "బయోమెట్రిక్ ధృవీకరణతో మెరుగైన మా సురక్షిత మరియు పారదర్శక వోటింగ్ ప్లాట్ఫారమ్తో ఎక్కడ నుండైనా, ఎప్పుడైనా మీ వోట్ను వేయండి.",
        voteNow: "ఇప్పుడే వోట్ వేయండి",
        
        // Features
        featuresTitle: "సిక్యూర్వోట్ ఎందుకు ఎంచుకోవాలి?",
        secureEncrypted: "సురక్షితమైన & ఎన్క్రిప్టెడ్",
        secureDesc: "మిలిటరీ-గ్రేడ్ ఎన్క్రిప్షన్ మీ వోట్ గోప్యంగా మరియు ట్యాంపర్-ప్రూఫ్గా ఉండేలా నిర్ధారిస్తుంది.",
        faceRecognition: "ఫేస్ రికగ్నిషన్",
        faceDesc: "ఒక వ్యక్తి, ఒక వోట్ నిర్ధారించడానికి అధునాతన బయోమెట్రిక్ ధృవీకరణ.",
        aiAssistant: "AI అసిస్టెంట్",
        aiDesc: "వోటింగ్ సంబంధిత ఏవైనా ప్రశ్నలకు తక్షణ సహాయం పొందండి.",
        idAuth: "ID-ఆధారిత ప్రమాణీకరణ",
        idDesc: "వయోసు ధృవీకరణతో మీ వోటర్ ID లేదా స్టూడెంట్ ID ఉపయోగించి సురక్షిత లాగిన్.",
        
        // Elections
        activeElections: "సక్రియ ఎన్నికలు",
        electionStatus: "స్థితి",
        totalVoters: "మొత్తం వోటర్లు",
        votesCast: "వోట్లు వేయబడ్డాయి",
        participation: "పాల్గొనడం",
        candidates: "అభ్యర్థులు",
        
        // Results
        electionResults: "ఎన్నికల ఫలితాలు",
        liveResults: "లైవ్ ఫలితాలు",
        completedElections: "పూర్తయిన ఎన్నికలు",
        upcomingElections: "రాబోయే ఎన్నికలు",
        votes: "వోట్లు",
        winner: "విజేత",
        viewFullResults: "పూర్తి ఫలితాలు చూడండి",
        starts: "మొదలవుతుంది",
        facultyElectionDesc: "ఫ్యాకల్టీ సెనేట్ ప్రతినిధుల కోసం ఎన్నిక",
        alumniElectionDesc: "ఆలుమ్నీ అసోసియేషన్ బోర్డు సభ్యుల కోసం ఎన్నిక",
        
        // Contact
        contactUs: "మమ్మల్ని సంప్రదించండి",
        getInTouch: "మా సపోర్ట్ టీమ్తో సంప్రదించండి",
        ourOffice: "మా ఆఫీస్",
        phone: "ఫోన్",
        email: "ఇమెయిల్",
        supportHours: "సపోర్ట్ గంటలు",
        sendMessage: "మాకు సందేశం పంపండి",
        fullName: "పూర్తి పేరు",
        emailAddress: "ఇమెయిల్ చిరునామా",
        subject: "విషయం",
        message: "సందేశం",
        send: "సందేశం పంపండి",
        businessHours: "సోమ-శుక్ర: ఉదయం 9:00 - సాయంత్రం 6:00",
        weekdays: "సోమవారం - శుక్రవారం: ఉదయం 9 - సాయంత్రం 6",
        saturday: "శనివారం: ఉదయం 10 - సాయంత్రం 4",
        sunday: "ఆదివారం: మూసివేయబడింది",
        
        // Auth Modal
        loginToAccount: "మీ ఖాతాలోకి లాగిన్ అవ్వండి",
        voterId: "వోటర్ ID / విద్యార్థి ID",
        createAccount: "కొత్త ఖాతా సృష్టించండి",
        dateOfBirth: "పుట్టిన తేదీ",
        gender: "లింగం",
        male: "పురుషుడు",
        female: "స్త్రీ",
        other: "ఇతర",
        faceRegistration: "ఫేస్ నమోదు",
        captureFace: "ఫేస్ క్యాప్చర్ చేయండి",
        completeRegistration: "నమోదును పూర్తి చేయండి",
        castYourVote: "మీ వోట్ వేయండి",
        
        // Placeholders
        enterYourId: "మీ ID నమోదు చేయండి",
        enterFullName: "మీ పూర్తి పేరు నమోదు చేయండి",
        enterEmail: "మీ ఇమెయిల్ నమోదు చేయండి",
        
        // Chatbot
        chatbotWelcome: "నమస్కారం! నేను మీ వోట్ అసిస్టెంట్. ఈరోజు వోటింగ్ ప్రక్రియలో నేను మీకు ఎలా సహాయపడగలను?",
        askAboutVoting: "నన్ను వోటింగ్ గురించి అడగండి...",
        
        // Footer
        companyDesc: "ప్రజాస్వామ్య భాగస్వామ్యాన్ని అందరికీ అందుబాటులో, సురక్షితంగా మరియు సౌకర్యవంతంగా చేయడం.",
        quickLinks: "త్వరిత లింకులు",
        copyright: "సర్వ హక్కులు ప్రత్యేకించి సంరక్షించబడినవి."
    },

    ta: {
        // Navigation
        home: "முகப்பு",
        about: "பற்றி",
        elections: "தேர்தல்கள்",
        results: "முடிவுகள்",
        contact: "தொடர்பு",
        adminPanel: "நிர்வாக பேனல்",
        login: "உள்நுழை",
        register: "பதிவு",
        logout: "வெளியேறு",
        welcome: "வரவேற்கிறோம்",
        selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்",
        
        // Hero Section
        heroTitle: "முக அங்கீகாரத்துடன் பாதுகாப்பான ஆன்லைன் வாக்களிப்பு",
        heroSubtitle: "பயோமெட்ரிக் சரிபார்ப்புடன் மேம்படுத்தப்பட்ட எங்கள் பாதுகாப்பான மற்றும் வெளிப்படையான வாக்களிப்பு தளத்துடன் எங்கிருந்தும், எப்போதும் வாக்களிக்கவும்.",
        voteNow: "இப்போது வாக்களிக்கவும்",
        
        // Features
        featuresTitle: "ஏன் SecureVote ஐ தேர்வு செய்ய வேண்டும்?",
        secureEncrypted: "பாதுகாப்பான மற்றும் குறியாக்கம் செய்யப்பட்ட",
        secureDesc: "மிலிட்டரி-கிரேடு குறியாக்கம் உங்கள் வாக்கு ரகசியமாகவும், திருத்த முடியாததாகவும் இருக்கும் என்பதை உறுதி செய்கிறது.",
        faceRecognition: "முக அங்கீகாரம்",
        faceDesc: "ஒரு நபர், ஒரு வாக்கு என்பதை உறுதி செய்ய மேம்பட்ட பயோமெட்ரிக் சரிபார்ப்பு.",
        aiAssistant: "AI உதவியாளர்",
        aiDesc: "வாக்களிப்பு தொடர்பான எந்தவொரு கேள்விகளுக்கும் உடனடி உதவி பெறவும்.",
        idAuth: "அடையாள அட்டை-அடிப்படையிலான அங்கீகாரம்",
        idDesc: "வயது சரிபார்ப்புடன் உங்கள் வாக்காளர் அடையாள அட்டை அல்லது மாணவர் அடையாள அட்டையைப் பயன்படுத்தி பாதுகாப்பான உள்நுழைவு.",
        
        // Elections
        activeElections: "செயலில் உள்ள தேர்தல்கள்",
        electionStatus: "நிலை",
        totalVoters: "மொத்த வாக்காளர்கள்",
        votesCast: "வாக்குகள் அளிக்கப்பட்டன",
        participation: "பங்கேற்பு",
        candidates: "வேட்பாளர்கள்",
        
        // Results
        electionResults: "தேர்தல் முடிவுகள்",
        liveResults: "நேரடி முடிவுகள்",
        completedElections: "முடிந்த தேர்தல்கள்",
        upcomingElections: "வரவிருக்கும் தேர்தல்கள்",
        votes: "வாக்குகள்",
        winner: "வெற்றியாளர்",
        viewFullResults: "முழு முடிவுகளைக் காண்க",
        starts: "தொடங்குகிறது",
        facultyElectionDesc: "ஆசிரியர் சட்டமன்றப் பிரதிநிதிகளுக்கான தேர்தல்",
        alumniElectionDesc: "முன்னாள் மாணவர் சங்க குழு உறுப்பினர்களுக்கான தேர்தல்",
        
        // Contact
        contactUs: "எங்களை தொடர்பு கொள்ள",
        getInTouch: "எங்கள் ஆதரவு குழுவை தொடர்பு கொள்ள",
        ourOffice: "எங்கள் அலுவலகம்",
        phone: "தொலைபேசி",
        email: "மின்னஞ்சல்",
        supportHours: "ஆதரவு நேரங்கள்",
        sendMessage: "எங்களுக்கு ஒரு செய்தியை அனுப்பவும்",
        fullName: "முழு பெயர்",
        emailAddress: "மின்னஞ்சல் முகவரி",
        subject: "விஷயம்",
        message: "செய்தி",
        send: "செய்தியை அனுப்பவும்",
        businessHours: "திங்கள்-வெள்ளி: காலை 9:00 - மாலை 6:00",
        weekdays: "திங்கள் - வெள்ளி: காலை 9 - மாலை 6",
        saturday: "சனி: காலை 10 - மாலை 4",
        sunday: "ஞாயிறு: மூடப்பட்டுள்ளது",
        
        // Auth Modal
        loginToAccount: "உங்கள் கணக்கில் உள்நுழைக",
        voterId: "வாக்காளர் அடையாள அட்டை / மாணவர் அடையாள அட்டை",
        createAccount: "புதிய கணக்கை உருவாக்கவும்",
        dateOfBirth: "பிறந்த தேதி",
        gender: "பாலினம்",
        male: "ஆண்",
        female: "பெண்",
        other: "மற்றவை",
        faceRegistration: "முக பதிவு",
        captureFace: "முகத்தை பிடிக்கவும்",
        completeRegistration: "பதிவை முடிக்கவும்",
        castYourVote: "உங்கள் வாக்கை அளிக்கவும்",
        
        // Placeholders
        enterYourId: "உங்கள் அடையாள அட்டையை உள்ளிடவும்",
        enterFullName: "உங்கள் முழு பெயரை உள்ளிடவும்",
        enterEmail: "உங்கள் மின்னஞ்சலை உள்ளிடவும்",
        
        // Chatbot
        chatbotWelcome: "வணக்கம்! நான் உங்கள் வாக்கு உதவியாளர். இன்று வாக்களிப்பு செயல்முறையில் நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
        askAboutVoting: "வாக்களிப்பு பற்றி என்னைக் கேளுங்கள்...",
        
        // Footer
        companyDesc: "ஜனநாயக பங்கேற்பை அனைவருக்கும் அணுகக்கூடிய, பாதுகாப்பான மற்றும் வசதியானதாக மாற்றுதல்.",
        quickLinks: "விரைவு இணைப்புகள்",
        copyright: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை."
    }
};

class LanguageManager {
    constructor() {
        this.currentLang = this.getSavedLanguage() || 'en';
        this.init();
    }

    init() {
        this.createLanguageSelector();
        this.applyLanguage(this.currentLang);
        this.setupEventListeners();
    }

    createLanguageSelector() {
        const headerContent = document.querySelector('.header-content');
        if (!headerContent) return;

        // Create language selector container
        const languageContainer = document.createElement('div');
        languageContainer.className = 'language-container';
        languageContainer.innerHTML = `
            <div class="language-selector">
                <button class="language-toggle" aria-label="Select language" title="${translations[this.currentLang].selectLanguage}">
                    <i class="fas fa-globe"></i>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="language-dropdown">
                    <div class="language-list">
                        <button class="language-option ${this.currentLang === 'en' ? 'active' : ''}" data-lang="en">
                            <span class="language-flag">🇺🇸</span>
                            <span class="language-name">English</span>
                        </button>
                        <button class="language-option ${this.currentLang === 'hi' ? 'active' : ''}" data-lang="hi">
                            <span class="language-flag">🇮🇳</span>
                            <span class="language-name">हिन्दी</span>
                        </button>
                        <button class="language-option ${this.currentLang === 'te' ? 'active' : ''}" data-lang="te">
                            <span class="language-flag">🇮🇳</span>
                            <span class="language-name">తెలుగు</span>
                        </button>
                        <button class="language-option ${this.currentLang === 'ta' ? 'active' : ''}" data-lang="ta">
                            <span class="language-flag">🇮🇳</span>
                            <span class="language-name">தமிழ்</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Insert language selector at the end of header content
        headerContent.appendChild(languageContainer);
    }

    setupEventListeners() {
        // Language dropdown toggle
        document.addEventListener('click', (e) => {
            const languageToggle = e.target.closest('.language-toggle');
            const languageOption = e.target.closest('.language-option');
            
            if (languageToggle) {
                const selector = languageToggle.closest('.language-selector');
                selector.classList.toggle('active');
                e.stopPropagation();
            } else if (languageOption) {
                const lang = languageOption.getAttribute('data-lang');
                this.switchLanguage(lang);
                document.querySelector('.language-selector')?.classList.remove('active');
            } else {
                // Close dropdown when clicking outside
                document.querySelectorAll('.language-selector').forEach(selector => {
                    selector.classList.remove('active');
                });
            }
        });

        // Close dropdown on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.language-selector').forEach(selector => {
                    selector.classList.remove('active');
                });
            }
        });
    }

    switchLanguage(lang) {
        if (this.currentLang === lang) return;
        
        this.currentLang = lang;
        this.saveLanguage(lang);
        this.applyLanguage(lang);
        this.updateLanguageSelector();
    }

    applyLanguage(lang) {
        const translation = translations[lang];
        if (!translation) return;

        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translation[key]) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = translation[key];
                } else {
                    element.textContent = translation[key];
                }
            }
        });

        // Update elements with data-i18n-placeholder attribute
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translation[key]) {
                element.placeholder = translation[key];
            }
        });

        // Update page title
        document.title = `SecureVote - ${translation.heroTitle || 'Online Voting System'}`;

        // Update HTML lang attribute
        document.documentElement.lang = lang;

        // Update language toggle title
        const languageToggle = document.querySelector('.language-toggle');
        if (languageToggle) {
            languageToggle.title = translation.selectLanguage;
        }

        // Trigger custom event for dynamic content
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang, translation: translation }
        }));
    }

    updateLanguageSelector() {
        // Update active state in language options
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-lang') === this.currentLang) {
                option.classList.add('active');
            }
        });

        // Update language toggle title
        const languageToggle = document.querySelector('.language-toggle');
        if (languageToggle) {
            languageToggle.title = translations[this.currentLang].selectLanguage;
        }
    }

    getSavedLanguage() {
        return localStorage.getItem('preferredLanguage');
    }

    saveLanguage(lang) {
        localStorage.setItem('preferredLanguage', lang);
    }
}

// Initialize language manager
document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
});