import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      // Common
      dashboard: 'Dashboard',
      reportIssue: 'Report Issue',
      issues: 'Issues',
      analytics: 'Analytics',
      profile: 'Profile',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      admin: 'Admin',
      
      // Navigation
      nav: {
        home: 'Home',
        issues: 'Issues',
        analytics: 'Analytics',
        dashboard: 'Dashboard',
        report: 'Report Issue',
        profile: 'Profile',
        admin: 'Admin',
        login: 'Login',
        register: 'Register',
        logout: 'Logout'
      },
      
      // Home page
      home: {
        title: 'Welcome to JanataReport',
        subtitle: 'Report civic issues and track their resolution',
        report_issue: 'Report Issue',
        view_issues: 'View Issues',
        analytics: 'Analytics'
      },
      
      // Auth
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        phone: 'Phone',
        password: 'Password',
        confirm_password: 'Confirm Password',
        name: 'Name',
        anonymous: 'Register as Anonymous',
        login_as_anonymous: 'Login as Anonymous',
        forgot_password: 'Forgot Password?',
        dont_have_account: "Don't have an account?",
        already_have_account: 'Already have an account?'
      },
      
      // Status and Priority
      status: {
        open: 'Open',
        in_progress: 'In Progress',
        resolved: 'Resolved',
        verified: 'Verified',
        closed: 'Closed'
      },
      
      priority: {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
        urgent: 'Urgent'
      },
      
      // Issue form fields
      issue: {
        title: 'Issue Title',
        description: 'Description',
        category: 'Category',
        subcategory: 'Subcategory',
        location: 'Location',
        media: 'Media/Attachments',
        priority: 'Priority',
        submit: 'Submit Issue',
        edit: 'Edit Issue',
        update: 'Update Issue',
        cancel: 'Cancel',
        select_category: 'Select a category',
        select_subcategory: 'Select a subcategory',
        location_selected: 'Location selected',
        click_to_select_location: 'Click to select location on map',
        location_selected_title: 'Location Selected',
        change_location: 'Change Location',
        select_location: 'Select Location',
        upload_media: 'Upload photos or videos (max 10MB each)',
        choose_files: 'Choose Files',
        selected_files: 'Selected Files',
        please_select_location: 'Please select a location'
      },

      // Categories
      category: {
        roads: 'Roads & Transportation',
        water: 'Water & Sanitation',
        electricity: 'Electricity',
        waste: 'Waste Management',
        health: 'Health & Safety',
        education: 'Education',
        environment: 'Environment',
        other: 'Other'
      },

      // Subcategories
      subcategory: {
        potholes: 'Potholes',
        street_lights: 'Street Lights',
        traffic_signals: 'Traffic Signals',
        water_supply: 'Water Supply',
        drainage: 'Drainage',
        sewage: 'Sewage',
        power_outage: 'Power Outage',
        electrical_hazards: 'Electrical Hazards',
        garbage_collection: 'Garbage Collection',
        waste_disposal: 'Waste Disposal',
        public_health: 'Public Health',
        safety_hazards: 'Safety Hazards',
        school_infrastructure: 'School Infrastructure',
        teacher_shortage: 'Teacher Shortage',
        pollution: 'Pollution',
        tree_planting: 'Tree Planting',
        general: 'General Issue'
      },
      
      // Navigation
      about: 'About',
      contact: 'Contact',
      help: 'Help',
      
      // Issue related
      reportNewIssue: 'Report New Issue',
      viewAllIssues: 'View All Issues',
      issueStatus: 'Issue Status',
      upvote: 'Upvote',
      comment: 'Comment',
      
      // Status
      open: 'Open',
      inProgress: 'In Progress',
      resolved: 'Resolved',
      verified: 'Verified',
      closed: 'Closed',
      
      // Priority
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      urgent: 'Urgent',
      
      // Categories
      infrastructure: 'Infrastructure',
      utilities: 'Utilities',
      environment: 'Environment',
      safety: 'Safety',
      transportation: 'Transportation',
      healthcare: 'Healthcare',
      education: 'Education',
      governance: 'Governance',
      
      // Admin
      adminPanel: 'Admin Panel',
      manageUsers: 'Manage Users',
      manageCategories: 'Manage Categories',
      manageOfficials: 'Manage Officials',
      systemSettings: 'System Settings',
      
      // Forms
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      
      // Messages
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
      loading: 'Loading...',
      noData: 'No data available',
      
      // Placeholders
      enterEmail: 'Enter your email',
      enterPassword: 'Enter your password',
      enterName: 'Enter your name',
      enterPhone: 'Enter your phone number',
      enterDescription: 'Enter description',
      selectCategory: 'Select category',
      selectSubcategory: 'Select subcategory',
      selectPriority: 'Select priority',
      selectStatus: 'Select status',
      
      // Validation
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email',
      passwordTooShort: 'Password must be at least 6 characters',
      phoneInvalid: 'Please enter a valid phone number',
      
      // Welcome messages
      welcomeToJanataReport: 'Welcome to JanataReport',
      reportCivicIssues: 'Report civic issues and track their resolution',
      getStarted: 'Get Started',
      learnMore: 'Learn More',
      
      // Statistics
      totalIssues: 'Total Issues',
      resolvedIssues: 'Resolved Issues',
      pendingIssues: 'Pending Issues',
      avgResolutionTime: 'Avg. Resolution Time',
      responseRate: 'Response Rate',
      
      // Time
      days: 'days',
      hours: 'hours',
      minutes: 'minutes',
      ago: 'ago',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      thisYear: 'This Year',
      
      // Footer
      footer: {
        copyright: '© 2025 JanataReport. All rights reserved.',
        about: 'About Us',
        contact: 'Contact',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        support: 'Support',
        help: 'Help Center',
        faq: 'FAQ'
      }
    },
    
    hi: {
      // Common
      dashboard: 'डैशबोर्ड',
      reportIssue: 'समस्या रिपोर्ट करें',
      issues: 'समस्याएं',
      analytics: 'विश्लेषण',
      profile: 'प्रोफ़ाइल',
      login: 'लॉगिन',
      register: 'रजिस्टर',
      logout: 'लॉगआउट',
      admin: 'एडमिन',
      
      // Navigation
      nav: {
        home: 'होम',
        issues: 'समस्याएं',
        analytics: 'विश्लेषण',
        dashboard: 'डैशबोर्ड',
        report: 'समस्या रिपोर्ट करें',
        profile: 'प्रोफ़ाइल',
        admin: 'एडमिन',
        login: 'लॉगिन',
        register: 'रजिस्टर',
        logout: 'लॉगआउट'
      },
      
      // Home page
      home: {
        title: 'जनतारिपोर्ट में आपका स्वागत है',
        subtitle: 'नागरिक समस्याओं की रिपोर्ट करें और उनके समाधान को ट्रैक करें',
        report_issue: 'समस्या रिपोर्ट करें',
        view_issues: 'समस्याएं देखें',
        analytics: 'विश्लेषण'
      },
      
      // Auth
      auth: {
        login: 'लॉगिन',
        register: 'रजिस्टर',
        logout: 'लॉगआउट',
        email: 'ईमेल',
        phone: 'फोन',
        password: 'पासवर्ड',
        confirm_password: 'पासवर्ड की पुष्टि करें',
        name: 'नाम',
        anonymous: 'अज्ञात के रूप में रजिस्टर करें',
        login_as_anonymous: 'अज्ञात के रूप में लॉगिन करें',
        forgot_password: 'पासवर्ड भूल गए?',
        dont_have_account: 'खाता नहीं है?',
        already_have_account: 'पहले से खाता है?'
      },
      
      // Status and Priority
      status: {
        open: 'खुला',
        in_progress: 'प्रगति में',
        resolved: 'हल',
        verified: 'सत्यापित',
        closed: 'बंद'
      },
      
      priority: {
        low: 'कम',
        medium: 'मध्यम',
        high: 'उच्च',
        urgent: 'तत्काल'
      },
      
      // Issue form fields
      issue: {
        title: 'समस्या का शीर्षक',
        description: 'विवरण',
        category: 'श्रेणी',
        subcategory: 'उपश्रेणी',
        location: 'स्थान',
        media: 'मीडिया/संलग्नक',
        priority: 'प्राथमिकता',
        submit: 'समस्या सबमिट करें',
        edit: 'समस्या संपादित करें',
        update: 'समस्या अपडेट करें',
        cancel: 'रद्द करें',
        select_category: 'एक श्रेणी चुनें',
        select_subcategory: 'एक उपश्रेणी चुनें',
        location_selected: 'स्थान चुना गया',
        click_to_select_location: 'स्थान चुनने के लिए क्लिक करें',
        location_selected_title: 'स्थान चुना गया',
        change_location: 'स्थान बदलें',
        select_location: 'स्थान चुनें',
        upload_media: 'फोटो या वीडियो अपलोड करें (अधिकतम 10MB प्रत्येक)',
        choose_files: 'फाइलें चुनें',
        selected_files: 'चयनित फाइलें',
        please_select_location: 'कृपया एक स्थान चुनें'
      },

      // Categories
      category: {
        roads: 'सड़कें और परिवहन',
        water: 'पानी और स्वच्छता',
        electricity: 'बिजली',
        waste: 'कचरा प्रबंधन',
        health: 'स्वास्थ्य और सुरक्षा',
        education: 'शिक्षा',
        environment: 'पर्यावरण',
        other: 'अन्य'
      },

      // Subcategories
      subcategory: {
        potholes: 'गड्ढे',
        street_lights: 'स्ट्रीट लाइट्स',
        traffic_signals: 'ट्रैफिक सिग्नल',
        water_supply: 'पानी की आपूर्ति',
        drainage: 'नाली',
        sewage: 'सीवेज',
        power_outage: 'बिजली कटौती',
        electrical_hazards: 'बिजली के खतरे',
        garbage_collection: 'कचरा संग्रह',
        waste_disposal: 'कचरा निपटान',
        public_health: 'सार्वजनिक स्वास्थ्य',
        safety_hazards: 'सुरक्षा खतरे',
        school_infrastructure: 'स्कूल का बुनियादी ढांचा',
        teacher_shortage: 'शिक्षक की कमी',
        pollution: 'प्रदूषण',
        tree_planting: 'पेड़ लगाना',
        general: 'सामान्य समस्या'
      },
      
      // Navigation
      about: 'के बारे में',
      contact: 'संपर्क',
      help: 'सहायता',
      
      // Issue related
      reportNewIssue: 'नई समस्या रिपोर्ट करें',
      viewAllIssues: 'सभी समस्याएं देखें',
      issueStatus: 'समस्या की स्थिति',
      upvote: 'अपवोट',
      comment: 'टिप्पणी',
      
      // Status
      open: 'खुला',
      inProgress: 'प्रगति में',
      resolved: 'हल',
      verified: 'सत्यापित',
      closed: 'बंद',
      
      // Priority
      low: 'कम',
      medium: 'मध्यम',
      high: 'उच्च',
      urgent: 'तत्काल',
      
      // Categories
      infrastructure: 'अवसंरचना',
      utilities: 'उपयोगिताएं',
      environment: 'पर्यावरण',
      safety: 'सुरक्षा',
      transportation: 'परिवहन',
      healthcare: 'स्वास्थ्य सेवा',
      education: 'शिक्षा',
      governance: 'शासन',
      
      // Admin
      adminPanel: 'एडमिन पैनल',
      manageUsers: 'उपयोगकर्ता प्रबंधन',
      manageCategories: 'श्रेणी प्रबंधन',
      manageOfficials: 'अधिकारी प्रबंधन',
      systemSettings: 'सिस्टम सेटिंग्स',
      
      // Forms
      submit: 'जमा करें',
      cancel: 'रद्द करें',
      save: 'सहेजें',
      edit: 'संपादित करें',
      delete: 'हटाएं',
      search: 'खोजें',
      filter: 'फिल्टर',
      sort: 'क्रमबद्ध करें',
      
      // Messages
      success: 'सफलता',
      error: 'त्रुटि',
      warning: 'चेतावनी',
      info: 'जानकारी',
      loading: 'लोड हो रहा है...',
      noData: 'कोई डेटा उपलब्ध नहीं',
      
      // Placeholders
      enterEmail: 'अपना ईमेल दर्ज करें',
      enterPassword: 'अपना पासवर्ड दर्ज करें',
      enterName: 'अपना नाम दर्ज करें',
      enterPhone: 'अपना फोन नंबर दर्ज करें',
      enterDescription: 'विवरण दर्ज करें',
      selectCategory: 'श्रेणी चुनें',
      selectSubcategory: 'उपश्रेणी चुनें',
      selectPriority: 'प्राथमिकता चुनें',
      selectStatus: 'स्थिति चुनें',
      
      // Validation
      required: 'यह फ़ील्ड आवश्यक है',
      invalidEmail: 'कृपया एक वैध ईमेल दर्ज करें',
      passwordTooShort: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
      phoneInvalid: 'कृपया एक वैध फोन नंबर दर्ज करें',
      
      // Welcome messages
      welcomeToJanataReport: 'जनतारिपोर्ट में आपका स्वागत है',
      reportCivicIssues: 'नागरिक समस्याओं की रिपोर्ट करें और उनके समाधान को ट्रैक करें',
      getStarted: 'शुरू करें',
      learnMore: 'और जानें',
      
      // Statistics
      totalIssues: 'कुल समस्याएं',
      resolvedIssues: 'हल की गई समस्याएं',
      pendingIssues: 'लंबित समस्याएं',
      avgResolutionTime: 'औसत समाधान समय',
      responseRate: 'प्रतिक्रिया दर',
      
      // Time
      days: 'दिन',
      hours: 'घंटे',
      minutes: 'मिनट',
      ago: 'पहले',
      today: 'आज',
      yesterday: 'कल',
      thisWeek: 'इस सप्ताह',
      thisMonth: 'इस महीने',
      thisYear: 'इस साल',
      
      // Footer
      footer: {
        copyright: '© 2025 जनतारिपोर्ट। सभी अधिकार सुरक्षित।',
        about: 'हमारे बारे में',
        contact: 'संपर्क करें',
        privacy: 'गोपनीयता नीति',
        terms: 'सेवा की शर्तें',
        support: 'सहायता',
        help: 'सहायता केंद्र',
        faq: 'सामान्य प्रश्न'
      }
    },
    
    te: {
      // Common
      dashboard: 'డ్యాష్‌బోర్డ్',
      reportIssue: 'సమస్యను నివేదించండి',
      issues: 'సమస్యలు',
      analytics: 'విశ్లేషణ',
      profile: 'ప్రొఫైల్',
      login: 'లాగిన్',
      register: 'రిజిస్టర్',
      logout: 'లాగ్‌అవుట్',
      admin: 'అడ్మిన్',
      
      // Navigation
      nav: {
        home: 'హోమ్',
        issues: 'సమస్యలు',
        analytics: 'విశ్లేషణ',
        dashboard: 'డ్యాష్‌బోర్డ్',
        report: 'సమస్యను నివేదించండి',
        profile: 'ప్రొఫైల్',
        admin: 'అడ్మిన్',
        login: 'లాగిన్',
        register: 'రిజిస్టర్',
        logout: 'లాగ్‌అవుట్'
      },
      
      // Home page
      home: {
        title: 'జనతారిపోర్ట్‌కు స్వాగతం',
        subtitle: 'పౌర సమస్యలను నివేదించండి మరియు వాటి పరిష్కారాన్ని ట్రాక్ చేయండి',
        report_issue: 'సమస్యను నివేదించండి',
        view_issues: 'సమస్యలు చూడండి',
        analytics: 'విశ్లేషణ'
      },
      
      // Auth
      auth: {
        login: 'లాగిన్',
        register: 'రిజిస్టర్',
        logout: 'లాగ్‌అవుట్',
        email: 'ఇమెయిల్',
        phone: 'ఫోన్',
        password: 'పాస్‌వర్డ్',
        confirm_password: 'పాస్‌వర్డ్ నిర్ధారించండి',
        name: 'పేరు',
        anonymous: 'అజ్ఞాతంగా నమోదు చేయండి',
        login_as_anonymous: 'అజ్ఞాతంగా లాగిన్ చేయండి',
        forgot_password: 'పాస్‌వర్డ్ మర్చిపోయారా?',
        dont_have_account: 'ఖాతా లేదా?',
        already_have_account: 'ఇప్పటికే ఖాతా ఉందా?'
      },
      
      // Status and Priority
      status: {
        open: 'తెరవబడింది',
        in_progress: 'ప్రగతిలో',
        resolved: 'పరిష్కరించబడింది',
        verified: 'ధృవీకరించబడింది',
        closed: 'మూసివేయబడింది'
      },
      
      priority: {
        low: 'తక్కువ',
        medium: 'మధ్యస్థం',
        high: 'ఎక్కువ',
        urgent: 'తక్షణ'
      },
      
      // Issue form fields
      issue: {
        title: 'సమస్య శీర్షిక',
        description: 'వివరణ',
        category: 'వర్గం',
        subcategory: 'ఉపవర్గం',
        location: 'స్థానం',
        media: 'మీడియా/అటాచ్‌మెంట్‌లు',
        priority: 'ప్రాధాన్యత',
        submit: 'సమస్యను సమర్పించండి',
        edit: 'సమస్యను సవరించండి',
        update: 'సమస్యను నవీకరించండి',
        cancel: 'రద్దు చేయండి',
        select_category: 'ఒక వర్గాన్ని ఎంచుకోండి',
        select_subcategory: 'ఒక ఉపవర్గాన్ని ఎంచుకోండి',
        location_selected: 'స్థానం ఎంచుకోబడింది',
        click_to_select_location: 'స్థానాన్ని ఎంచుకోవడానికి క్లిక్ చేయండి',
        location_selected_title: 'స్థానం ఎంచుకోబడింది',
        change_location: 'స్థానాన్ని మార్చండి',
        select_location: 'స్థానాన్ని ఎంచుకోండి',
        upload_media: 'ఫోటోలు లేదా వీడియోలు అప్‌లోడ్ చేయండి (గరిష్టంగా 10MB ప్రతి ఒక్కటి)',
        choose_files: 'ఫైళ్లను ఎంచుకోండి',
        selected_files: 'ఎంచుకోబడిన ఫైళ్లు',
        please_select_location: 'దయచేసి ఒక స్థానాన్ని ఎంచుకోండి'
      },

      // Categories
      category: {
        roads: 'రోడ్లు మరియు రవాణా',
        water: 'నీరు మరియు పారిశుధ్యం',
        electricity: 'విద్యుత్',
        waste: 'చెత్త నిర్వహణ',
        health: 'ఆరోగ్యం మరియు భద్రత',
        education: 'విద్య',
        environment: 'పర్యావరణం',
        other: 'ఇతర'
      },

      // Subcategories
      subcategory: {
        potholes: 'బోర్లు',
        street_lights: 'వీధి దీపాలు',
        traffic_signals: 'ట్రాఫిక్ సిగ్నల్స్',
        water_supply: 'నీటి సరఫరా',
        drainage: 'డ్రైనేజీ',
        sewage: 'మురుగు',
        power_outage: 'విద్యుత్ కట్',
        electrical_hazards: 'విద్యుత్ ప్రమాదాలు',
        garbage_collection: 'చెత్త సేకరణ',
        waste_disposal: 'చెత్త పారవేయడం',
        public_health: 'ప్రజా ఆరోగ్యం',
        safety_hazards: 'భద్రతా ప్రమాదాలు',
        school_infrastructure: 'పాఠశాల మౌలిక సదుపాయాలు',
        teacher_shortage: 'ఉపాధ్యాయుల కొరత',
        pollution: 'కాలుష్యం',
        tree_planting: 'చెట్లు నాటడం',
        general: 'సాధారణ సమస్య'
      },
      
      // Navigation
      about: 'గురించి',
      contact: 'సంప్రదింపు',
      help: 'సహాయం',
      
      // Issue related
      reportNewIssue: 'కొత్త సమస్యను నివేదించండి',
      viewAllIssues: 'అన్ని సమస్యలను చూడండి',
      issueStatus: 'సమస్య స్థితి',
      upvote: 'అప్‌వోట్',
      comment: 'వ్యాఖ్య',
      
      // Status
      open: 'తెరిచిన',
      inProgress: 'ప్రగతిలో',
      resolved: 'పరిష్కరించబడింది',
      verified: 'ధృవీకరించబడింది',
      closed: 'మూసివేయబడింది',
      
      // Priority
      low: 'తక్కువ',
      medium: 'మధ్యస్థ',
      high: 'ఎక్కువ',
      urgent: 'తక్షణ',
      
      // Categories
      infrastructure: 'మౌలిక సదుపాయాలు',
      utilities: 'ఉపయోగాలు',
      environment: 'పర్యావరణం',
      safety: 'భద్రత',
      transportation: 'రవాణా',
      healthcare: 'ఆరోగ్య సంరక్షణ',
      education: 'విద్య',
      governance: 'పరిపాలన',
      
      // Admin
      adminPanel: 'అడ్మిన్ ప్యానెల్',
      manageUsers: 'వినియోగదారులను నిర్వహించండి',
      manageCategories: 'వర్గాలను నిర్వహించండి',
      manageOfficials: 'అధికారులను నిర్వహించండి',
      systemSettings: 'సిస్టమ్ సెట్టింగ్‌లు',
      
      // Forms
      submit: 'సమర్పించండి',
      cancel: 'రద్దు చేయండి',
      save: 'సేవ్ చేయండి',
      edit: 'సవరించండి',
      delete: 'తొలగించండి',
      search: 'వెతకండి',
      filter: 'ఫిల్టర్',
      sort: 'క్రమబద్ధీకరించండి',
      
      // Messages
      success: 'విజయం',
      error: 'లోపం',
      warning: 'హెచ్చరిక',
      info: 'సమాచారం',
      loading: 'లోడ్ అవుతోంది...',
      noData: 'డేటా లేదు',
      
      // Placeholders
      enterEmail: 'మీ ఇమెయిల్ నమోదు చేయండి',
      enterPassword: 'మీ పాస్‌వర్డ్ నమోదు చేయండి',
      enterName: 'మీ పేరు నమోదు చేయండి',
      enterPhone: 'మీ ఫోన్ నంబర్ నమోదు చేయండి',
      enterDescription: 'వివరణ నమోదు చేయండి',
      selectCategory: 'వర్గాన్ని ఎంచుకోండి',
      selectSubcategory: 'ఉపవర్గాన్ని ఎంచుకోండి',
      selectPriority: 'ప్రాధాన్యతను ఎంచుకోండి',
      selectStatus: 'స్థితిని ఎంచుకోండి',
      
      // Validation
      required: 'ఈ ఫీల్డ్ అవసరం',
      invalidEmail: 'దయచేసి సరైన ఇమెయిల్ నమోదు చేయండి',
      passwordTooShort: 'పాస్‌వర్డ్ కనీసం 6 అక్షరాలుగా ఉండాలి',
      phoneInvalid: 'దయచేసి సరైన ఫోన్ నంబర్ నమోదు చేయండి',
      
      // Welcome messages
      welcomeToJanataReport: 'జనతారిపోర్ట్‌కు స్వాగతం',
      reportCivicIssues: 'పౌర సమస్యలను నివేదించండి మరియు వాటి పరిష్కారాన్ని ట్రాక్ చేయండి',
      getStarted: 'ప్రారంభించండి',
      learnMore: 'మరింత తెలుసుకోండి',
      
      // Statistics
      totalIssues: 'మొత్తం సమస్యలు',
      resolvedIssues: 'పరిష్కరించబడిన సమస్యలు',
      pendingIssues: 'వేచి ఉన్న సమస్యలు',
      avgResolutionTime: 'సగటు పరిష్కార సమయం',
      responseRate: 'ప్రతిస్పందన రేటు',
      
      // Time
      days: 'రోజులు',
      hours: 'గంటలు',
      minutes: 'నిమిషాలు',
      ago: 'క్రితం',
      today: 'ఈరోజు',
      yesterday: 'నిన్న',
      thisWeek: 'ఈ వారం',
      thisMonth: 'ఈ నెల',
      thisYear: 'ఈ సంవత్సరం',
      
      // Footer
      footer: {
        copyright: '© 2025 జనతారిపోర్ట్. అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.',
        about: 'మా గురించి',
        contact: 'సంప్రదించండి',
        privacy: 'గోప్యతా విధానం',
        terms: 'సేవా నిబంధనలు',
        support: 'మద్దతు',
        help: 'సహాయ కేంద్రం',
        faq: 'తరచుగా అడిగే ప్రశ్నలు'
      }
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Return the key if translation not found
      }
    }
    
    return value || key;
  };

  const value = {
    language,
    setLanguage,
    changeLanguage: setLanguage, // Alias for compatibility
    t,
    translations
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;