require('dotenv').config();
const { sequelize, Category, Subcategory, Official, User, Authority } = require('../models');
const { syncDatabase } = require('../models');

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
    await Authority.destroy({ where: {} });
    
    console.log('Cleared existing data');
    
    // Create authorities first
    const authorityMap = new Map();
    const allAuthorities = new Set();
    
    // Collect all unique authorities from mapping
    for (const [categoryName, subcats] of Object.entries(mapping)) {
      for (const [subName, authorities] of Object.entries(subcats)) {
        authorities.forEach(auth => allAuthorities.add(auth));
      }
    }
    
    // Create authority records
    for (const authorityName of allAuthorities) {
      const [authority] = await Authority.findOrCreate({
        where: { level: authorityName },
        defaults: { level: authorityName, description: `${authorityName} authority` }
      });
      authorityMap.set(authorityName, authority);
      console.log(`Created authority: ${authorityName}`);
    }
    
    // Create categories and subcategories using mapping
    for (const [categoryName, subcats] of Object.entries(mapping)) {
      const [category] = await Category.findOrCreate({
        where: { name: categoryName },
        defaults: { 
          name: categoryName,
          description: `Issues related to ${categoryName.toLowerCase()}`,
          icon: 'alert-circle',
          color: '#3B82F6'
        }
      });
      console.log(`Created category: ${category.name}`);
      
      // Create subcategories for this category
      for (const [subName, authorities] of Object.entries(subcats)) {
        const [subcategory] = await Subcategory.findOrCreate({
          where: { name: subName, categoryId: category.id },
          defaults: { 
            name: subName, 
            categoryId: category.id,
            description: `${subName} issues`,
            authorityTypes: authorities
          }
        });
        console.log(`Created subcategory: ${subName} for ${category.name}`);
      }
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