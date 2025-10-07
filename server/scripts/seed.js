require('dotenv').config();
const { sequelize, Category, Subcategory } = require('../models');

const mapping = {
  "Roads & Transport": {
    "Potholes": ["Corporator", "Municipal Engineer", "Contractor", "MLA", "MP"],
    "Broken Footpaths": ["Corporator", "Municipal Engineer", "Contractor"],
    "Streetlights not working": ["Corporator", "Municipal Engineer", "Electricity Department"],
    "Encroachment": ["Corporator", "Municipal Commissioner", "Town Planning Officer"],
    "Illegal Parking": ["Traffic Police", "Corporator"],
    "Missing Signboards": ["Municipal Engineer", "Traffic Department"],
    "Wrong Speed Breakers": ["Corporator", "Municipal Engineer"]
  },
  "Traffic & Safety": {
    "Traffic Signal Not Working": ["Traffic Police", "Municipal Engineer"],
    "Dangerous Intersections": ["Traffic Police", "Corporator", "Urban Planning Department"],
    "Missing Pedestrian Crossings": ["Traffic Police", "Urban Planning Department"],
    "Illegal Auto/Taxi Stands": ["Traffic Police", "RTO", "Corporator"]
  },
  "Water Supply & Drainage": {
    "No Water Supply": ["Water Board Engineer", "Corporator", "MLA"],
    "Leakage": ["Water Board Engineer", "Corporator"],
    "Contaminated Water": ["Water Board", "Public Health Department"],
    "Open Drains": ["Corporator", "Municipal Engineer"],
    "Blocked Sewage": ["Corporator", "Sewage Board"]
  },
  "Electricity & Power": {
    "Power Cuts": ["Electricity Board", "MLA"],
    "Unsafe Electrical Poles/Wires": ["Electricity Board Engineer", "Corporator"],
    "Faulty Transformers": ["Electricity Board", "Engineer"],
    "No Streetlights": ["Corporator", "Electricity Board"]
  },
  "Sanitation & Waste": {
    "Garbage Not Collected": ["Corporator", "Sanitation Supervisor", "Municipal Commissioner"],
    "Overflowing Bins": ["Sanitation Department", "Corporator"],
    "Open Dumping": ["Sanitation Department", "Municipal Commissioner"],
    "Public Toilet Maintenance": ["Municipal Engineer", "Health Department"]
  },
  "Environment": {
    "Tree Cutting": ["Forest Department", "Municipal Commissioner"],
    "Air Pollution": ["Pollution Control Board", "Municipal Commissioner"],
    "Water Pollution": ["Pollution Control Board", "Water Board"],
    "Illegal Construction Near Lakes": ["Urban Development Authority", "Municipal Commissioner"]
  },
  "Health & Safety": {
    "Dengue Breeding Spots": ["Health Department", "Corporator"],
    "Lack of Fogging": ["Municipal Health Officer"],
    "Lack of Ambulances": ["Health Department", "Hospital Authority"],
    "Hospital Negligence": ["Hospital Authority", "Health Department"]
  },
  "Law & Order": {
    "Eve-teasing Hotspots": ["Local Police Station", "Women Safety Cell"],
    "Illegal Alcohol Outlets": ["Excise Department", "Police"],
    "Public Nuisance": ["Police", "Corporator"]
  },
  "Education": {
    "Broken Infrastructure in Government Schools": ["School Management", "Education Department"],
    "Lack of Teachers": ["Education Department", "MLA"]
  },
  "Public Transport": {
    "Poor Bus Frequency": ["Transport Corporation", "MLA"],
    "Damaged Bus Shelters": ["Corporator", "Transport Department"],
    "Unsafe Metro Stations": ["Metro Rail Authority", "Safety Cell"]
  },
  "Welfare & Governance": {
    "Pension Delays": ["Social Welfare Department"],
    "Ration Card Issues": ["Civil Supplies Department"],
    "Aadhaar Errors": ["UIDAI Center", "District Administration"],
    "Corruption": ["Anti-Corruption Bureau", "Lokayukta"]
  },
  "Miscellaneous": {
    "Stray Dogs/Cattle": ["Municipal Veterinary Department"],
    "Fire Hazards": ["Fire Department", "Municipal Commissioner"],
    "Public Encroachments": ["Town Planning Department", "Corporator"]
  }
};

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('DB connected. Seeding categories/subcategories...');

    for (const [categoryName, subcats] of Object.entries(mapping)) {
      const [category] = await Category.findOrCreate({
        where: { name: categoryName },
        defaults: { name: categoryName }
      });

      for (const subName of Object.keys(subcats)) {
        await Subcategory.findOrCreate({
          where: { name: subName, categoryId: category.id },
          defaults: { name: subName, categoryId: category.id }
        });
      }
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();

const { Category, Subcategory, Official, User } = require('../models');
const { syncDatabase } = require('../models');

const categoriesData = [
  {
    name: 'Roads & Transport',
    nameHindi: 'सड़कें और परिवहन',
    nameTelugu: 'రోడ్లు మరియు రవాణా',
    description: 'Issues related to roads, footpaths, streetlights, and transportation',
    icon: 'road',
    color: '#3B82F6',
    subcategories: [
      { name: 'Potholes', nameHindi: 'खड्डे', nameTelugu: 'గుంతలు' },
      { name: 'Broken Footpaths', nameHindi: 'टूटे फुटपाथ', nameTelugu: 'విరిగిన ఫుట్‌పాత్‌లు' },
      { name: 'Streetlights not working', nameHindi: 'स्ट्रीटलाइट काम नहीं कर रही', nameTelugu: 'వీధి దీపాలు పనిచేయడం లేదు' },
      { name: 'Encroachment', nameHindi: 'अतिक्रमण', nameTelugu: 'అతిక్రమణ' },
      { name: 'Illegal Parking', nameHindi: 'अवैध पार्किंग', nameTelugu: 'చట్టవిరుద్ధ పార్కింగ్' },
      { name: 'Missing Signboards', nameHindi: 'गायब साइनबोर्ड', nameTelugu: 'కనిపించని సైన్‌బోర్డ్‌లు' },
      { name: 'Wrong Speed Breakers', nameHindi: 'गलत स्पीड ब्रेकर', nameTelugu: 'తప్పు స్పీడ్ బ్రేకర్‌లు' }
    ]
  },
  {
    name: 'Traffic & Safety',
    nameHindi: 'यातायात और सुरक्षा',
    nameTelugu: 'ట్రాఫిక్ మరియు భద్రత',
    description: 'Traffic signals, intersections, and safety issues',
    icon: 'traffic-light',
    color: '#EF4444',
    subcategories: [
      { name: 'Traffic Signal Not Working', nameHindi: 'ट्रैफिक सिग्नल काम नहीं कर रहा', nameTelugu: 'ట్రాఫిక్ సిగ్నల్ పనిచేయడం లేదు' },
      { name: 'Dangerous Intersections', nameHindi: 'खतरनाक चौराहे', nameTelugu: 'ప్రమాదకరమైన క్రాస్‌రోడ్‌లు' },
      { name: 'Missing Pedestrian Crossings', nameHindi: 'गायब पैदल चलने वालों के लिए क्रॉसिंग', nameTelugu: 'కనిపించని పాదచారుల క్రాసింగ్‌లు' },
      { name: 'Illegal Auto/Taxi Stands', nameHindi: 'अवैध ऑटो/टैक्सी स्टैंड', nameTelugu: 'చట్టవిరుద్ధ ఆటో/టాక్సీ స్టాండ్‌లు' }
    ]
  },
  {
    name: 'Water Supply & Drainage',
    nameHindi: 'जल आपूर्ति और निकासी',
    nameTelugu: 'నీటి సరఫరా మరియు డ్రైనేజ్',
    description: 'Water supply, drainage, and sewage issues',
    icon: 'droplet',
    color: '#06B6D4',
    subcategories: [
      { name: 'No Water Supply', nameHindi: 'पानी की आपूर्ति नहीं', nameTelugu: 'నీటి సరఫరా లేదు' },
      { name: 'Leakage', nameHindi: 'रिसाव', nameTelugu: 'లీకేజ్' },
      { name: 'Contaminated Water', nameHindi: 'दूषित पानी', nameTelugu: 'కలుషిత నీరు' },
      { name: 'Open Drains', nameHindi: 'खुले नाले', nameTelugu: 'తెరిచిన డ్రైన్‌లు' },
      { name: 'Blocked Sewage', nameHindi: 'अवरुद्ध सीवेज', nameTelugu: 'అడ్డుకున్న సీవేజ్' }
    ]
  },
  {
    name: 'Electricity & Power',
    nameHindi: 'बिजली और बिजली',
    nameTelugu: 'విద్యుత్ మరియు శక్తి',
    description: 'Power cuts, electrical safety, and transformer issues',
    icon: 'zap',
    color: '#F59E0B',
    subcategories: [
      { name: 'Power Cuts', nameHindi: 'बिजली कटौती', nameTelugu: 'విద్యుత్ కట్‌లు' },
      { name: 'Unsafe Electrical Poles/Wires', nameHindi: 'असुरक्षित बिजली के खंभे/तार', nameTelugu: 'అసురక్షిత విద్యుత్ స్తంభాలు/వైర్‌లు' },
      { name: 'Faulty Transformers', nameHindi: 'खराब ट्रांसफार्मर', nameTelugu: 'తప్పుడు ట్రాన్స్‌ఫార్మర్‌లు' },
      { name: 'No Streetlights', nameHindi: 'कोई स्ट्रीटलाइट नहीं', nameTelugu: 'వీధి దీపాలు లేవు' }
    ]
  },
  {
    name: 'Sanitation & Waste',
    nameHindi: 'सफाई और कचरा',
    nameTelugu: 'సానిటేషన్ మరియు వేస్ట్',
    description: 'Garbage collection, waste management, and sanitation',
    icon: 'trash-2',
    color: '#10B981',
    subcategories: [
      { name: 'Garbage Not Collected', nameHindi: 'कचरा एकत्र नहीं किया गया', nameTelugu: 'చెత్త సేకరించబడలేదు' },
      { name: 'Overflowing Bins', nameHindi: 'अतिप्रवाह बिन', nameTelugu: 'ఓవర్‌ఫ్లో బిన్‌లు' },
      { name: 'Open Dumping', nameHindi: 'खुला डंपिंग', nameTelugu: 'తెరిచిన డంపింగ్' },
      { name: 'Public Toilet Maintenance', nameHindi: 'सार्वजनिक शौचालय रखरखाव', nameTelugu: 'ప్రజా శౌచాలయ నిర్వహణ' }
    ]
  },
  {
    name: 'Environment',
    nameHindi: 'पर्यावरण',
    nameTelugu: 'పర్యావరణం',
    description: 'Environmental issues and pollution',
    icon: 'leaf',
    color: '#22C55E',
    subcategories: [
      { name: 'Tree Cutting', nameHindi: 'पेड़ काटना', nameTelugu: 'చెట్లు కత్తిరించడం' },
      { name: 'Air Pollution', nameHindi: 'वायु प्रदूषण', nameTelugu: 'వాయు కాలుష్యం' },
      { name: 'Water Pollution', nameHindi: 'जल प्रदूषण', nameTelugu: 'నీటి కాలుష్యం' },
      { name: 'Illegal Construction Near Lakes', nameHindi: 'झीलों के पास अवैध निर्माण', nameTelugu: 'సరస్సుల దగ్గర చట్టవిరుద్ధ నిర్మాణం' }
    ]
  },
  {
    name: 'Health & Safety',
    nameHindi: 'स्वास्थ्य और सुरक्षा',
    nameTelugu: 'ఆరోగ్యం మరియు భద్రత',
    description: 'Health facilities, safety concerns, and medical issues',
    icon: 'heart',
    color: '#EC4899',
    subcategories: [
      { name: 'Dengue Breeding Spots', nameHindi: 'डेंगू प्रजनन स्थल', nameTelugu: 'డెంగ్యూ ప్రజనన ప్రదేశాలు' },
      { name: 'Lack of Fogging', nameHindi: 'फॉगिंग की कमी', nameTelugu: 'ఫాగింగ్ లేకపోవడం' },
      { name: 'Lack of Ambulances', nameHindi: 'एम्बुलेंस की कमी', nameTelugu: 'అంబులెన్స్ లేకపోవడం' },
      { name: 'Hospital Negligence', nameHindi: 'अस्पताल की लापरवाही', nameTelugu: 'ఆసుపత్రి నిర్లక్ష్యం' }
    ]
  },
  {
    name: 'Law & Order',
    nameHindi: 'कानून और व्यवस्था',
    nameTelugu: 'చట్టం మరియు క్రమం',
    description: 'Security, law enforcement, and public safety',
    icon: 'shield',
    color: '#8B5CF6',
    subcategories: [
      { name: 'Eve-teasing Hotspots', nameHindi: 'छेड़छाड़ हॉटस्पॉट', nameTelugu: 'ఈవ్ టీజింగ్ హాట్‌స్పాట్‌లు' },
      { name: 'Illegal Alcohol Outlets', nameHindi: 'अवैध शराब आउटलेट', nameTelugu: 'చట్టవిరుద్ధ మద్య అవుట్‌లెట్‌లు' },
      { name: 'Public Nuisance', nameHindi: 'सार्वजनिक उपद्रव', nameTelugu: 'ప్రజా ఉపద్రవం' }
    ]
  },
  {
    name: 'Education',
    nameHindi: 'शिक्षा',
    nameTelugu: 'విద్య',
    description: 'Educational facilities and infrastructure',
    icon: 'book-open',
    color: '#6366F1',
    subcategories: [
      { name: 'Broken Infrastructure in Government Schools', nameHindi: 'सरकारी स्कूलों में टूटा बुनियादी ढांचा', nameTelugu: 'ప్రభుత్వ పాఠశాలలలో విరిగిన మౌలిక సదుపాయాలు' },
      { name: 'Lack of Teachers', nameHindi: 'शिक्षकों की कमी', nameTelugu: 'ఉపాధ్యాయుల లేకపోవడం' }
    ]
  },
  {
    name: 'Public Transport',
    nameHindi: 'सार्वजनिक परिवहन',
    nameTelugu: 'ప్రజా రవాణా',
    description: 'Public transportation and related infrastructure',
    icon: 'bus',
    color: '#F97316',
    subcategories: [
      { name: 'Poor Bus Frequency', nameHindi: 'खराब बस आवृत्ति', nameTelugu: 'చెడు బస్ ఫ్రీక్వెన్సీ' },
      { name: 'Damaged Bus Shelters', nameHindi: 'क्षतिग्रस्त बस शेल्टर', nameTelugu: 'పాడైన బస్ షెల్టర్‌లు' },
      { name: 'Unsafe Metro Stations', nameHindi: 'असुरक्षित मेट्रो स्टेशन', nameTelugu: 'అసురక్షిత మెట్రో స్టేషన్‌లు' }
    ]
  },
  {
    name: 'Welfare & Governance',
    nameHindi: 'कल्याण और शासन',
    nameTelugu: 'సంక్షేమం మరియు పరిపాలన',
    description: 'Government services, welfare schemes, and governance',
    icon: 'users',
    color: '#84CC16',
    subcategories: [
      { name: 'Pension Delays', nameHindi: 'पेंशन में देरी', nameTelugu: 'పెన్షన్‌లో ఆలస్యం' },
      { name: 'Ration Card Issues', nameHindi: 'राशन कार्ड समस्या', nameTelugu: 'రేషన్ కార్డ్ సమస్యలు' },
      { name: 'Aadhaar Errors', nameHindi: 'आधार त्रुटियां', nameTelugu: 'ఆధార్ లోపాలు' },
      { name: 'Corruption', nameHindi: 'भ्रष्टाचार', nameTelugu: 'అవినీతి' }
    ]
  },
  {
    name: 'Miscellaneous',
    nameHindi: 'विविध',
    nameTelugu: 'వివిధ',
    description: 'Other issues not covered in specific categories',
    icon: 'more-horizontal',
    color: '#6B7280',
    subcategories: [
      { name: 'Stray Dogs/Cattle', nameHindi: 'आवारा कुत्ते/मवेशी', nameTelugu: 'ఆవారా కుక్కలు/పశువులు' },
      { name: 'Fire Hazards', nameHindi: 'आग का खतरा', nameTelugu: 'అగ్ని ప్రమాదాలు' },
      { name: 'Public Encroachments', nameHindi: 'सार्वजनिक अतिक्रमण', nameTelugu: 'ప్రజా అతిక్రమణలు' }
    ]
  }
];

const officialsData = [
  {
    name: 'Rajesh Kumar',
    designation: 'Municipal Commissioner',
    department: 'Municipal Corporation',
    email: 'commissioner@municipal.gov.in',
    phone: '+91-9876543210',
    jurisdiction: {
      type: 'city',
      name: 'Hyderabad',
      state: 'Telangana',
      wards: ['all']
    },
    categories: [],
    responseTime: 24,
    resolutionRate: 85.5
  },
  {
    name: 'Priya Sharma',
    designation: 'Traffic Inspector',
    department: 'Traffic Police',
    email: 'traffic.inspector@police.gov.in',
    phone: '+91-9876543211',
    jurisdiction: {
      type: 'zone',
      name: 'Central Zone',
      city: 'Hyderabad',
      state: 'Telangana'
    },
    categories: [],
    responseTime: 12,
    resolutionRate: 92.3
  },
  {
    name: 'Amit Patel',
    designation: 'Water Works Engineer',
    department: 'Water Supply Department',
    email: 'water.engineer@water.gov.in',
    phone: '+91-9876543212',
    jurisdiction: {
      type: 'division',
      name: 'Division 1',
      city: 'Hyderabad',
      state: 'Telangana'
    },
    categories: [],
    responseTime: 18,
    resolutionRate: 78.9
  },
  {
    name: 'Sunita Reddy',
    designation: 'Electrical Engineer',
    department: 'Electricity Department',
    email: 'electrical.engineer@power.gov.in',
    phone: '+91-9876543213',
    jurisdiction: {
      type: 'circle',
      name: 'Circle 2',
      city: 'Hyderabad',
      state: 'Telangana'
    },
    categories: [],
    responseTime: 36,
    resolutionRate: 88.2
  },
  {
    name: 'Vikram Singh',
    designation: 'Sanitation Inspector',
    department: 'Sanitation Department',
    email: 'sanitation.inspector@municipal.gov.in',
    phone: '+91-9876543214',
    jurisdiction: {
      type: 'ward',
      name: 'Ward 15',
      city: 'Hyderabad',
      state: 'Telangana'
    },
    categories: [],
    responseTime: 6,
    resolutionRate: 95.1
  }
];

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Sync database first
    await syncDatabase();
    
    // Clear existing data
    await Category.destroy({ where: {} });
    await Subcategory.destroy({ where: {} });
    await Official.destroy({ where: {} });
    
    console.log('Cleared existing data');
    
    // Create categories and subcategories
    for (const categoryData of categoriesData) {
      const { subcategories, ...categoryInfo } = categoryData;
      
      const category = await Category.create(categoryInfo);
      console.log(`Created category: ${category.name}`);
      
      // Create subcategories for this category
      for (const subcategoryData of subcategories) {
        await Subcategory.create({
          ...subcategoryData,
          categoryId: category.id
        });
      }
      console.log(`Created ${subcategories.length} subcategories for ${category.name}`);
    }
    
    // Get all categories to assign to officials
    const allCategories = await Category.findAll();
    const categoryIds = allCategories.map(cat => cat.id);
    
    // Create officials
    for (const officialData of officialsData) {
      const official = await Official.create({
        ...officialData,
        categories: categoryIds // Assign all categories to each official for now
      });
      console.log(`Created official: ${official.name}`);
    }
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@janatareport.com',
      password: 'admin123',
      role: 'admin',
      isAnonymous: false
    });
    console.log('Created admin user');
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
