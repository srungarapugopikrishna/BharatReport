const { Authority, Category } = require('../models');

const authoritiesData = [
  {
    name: 'Rajesh Kumar',
    level: 'MLA',
    designation: 'Member of Legislative Assembly',
    department: 'Public Works Department',
    email: 'rajesh.kumar@assembly.gov.in',
    phone: '9876543210',
    jurisdiction: {
      area: 'Ward 15',
      ward: '15',
      district: 'Hyderabad',
      state: 'Telangana',
      constituency: 'Charminar'
    },
    categories: [], // Will be populated based on category names
    notes: 'Responsible for infrastructure and public works in Charminar constituency'
  },
  {
    name: 'Priya Sharma',
    level: 'Corporator',
    designation: 'Ward Corporator',
    department: 'Greater Hyderabad Municipal Corporation',
    email: 'priya.sharma@ghmc.gov.in',
    phone: '9876543211',
    jurisdiction: {
      area: 'Ward 15',
      ward: '15',
      district: 'Hyderabad',
      state: 'Telangana',
      constituency: 'Charminar'
    },
    categories: [],
    notes: 'Handles local civic issues and ward-level problems'
  },
  {
    name: 'Suresh Reddy',
    level: 'Engineer',
    designation: 'Assistant Engineer',
    department: 'Public Works Department',
    email: 'suresh.reddy@pwd.gov.in',
    phone: '9876543212',
    jurisdiction: {
      area: 'Zone 5',
      ward: 'Multiple',
      district: 'Hyderabad',
      state: 'Telangana',
      constituency: 'Multiple'
    },
    categories: [],
    notes: 'Technical expert for road construction and maintenance'
  },
  {
    name: 'Anita Singh',
    level: 'Contractor',
    designation: 'Civil Contractor',
    department: 'Private Contractor',
    email: 'anita.singh@contractor.com',
    phone: '9876543213',
    jurisdiction: {
      area: 'South Zone',
      ward: 'Multiple',
      district: 'Hyderabad',
      state: 'Telangana',
      constituency: 'Multiple'
    },
    categories: [],
    notes: 'Handles road repairs and construction work'
  },
  {
    name: 'Vikram Patel',
    level: 'Supervisor',
    designation: 'Sanitation Supervisor',
    department: 'Greater Hyderabad Municipal Corporation',
    email: 'vikram.patel@ghmc.gov.in',
    phone: '9876543214',
    jurisdiction: {
      area: 'Zone 3',
      ward: 'Multiple',
      district: 'Hyderabad',
      state: 'Telangana',
      constituency: 'Multiple'
    },
    categories: [],
    notes: 'Oversees waste management and sanitation services'
  },
  {
    name: 'Dr. Meera Joshi',
    level: 'Other',
    designation: 'Health Officer',
    department: 'Health Department',
    email: 'meera.joshi@health.gov.in',
    phone: '9876543215',
    jurisdiction: {
      area: 'Central Zone',
      ward: 'Multiple',
      district: 'Hyderabad',
      state: 'Telangana',
      constituency: 'Multiple'
    },
    categories: [],
    notes: 'Handles public health and safety issues'
  }
];

const seedAuthorities = async () => {
  try {
    console.log('Starting authority seeding...');

    // Get all categories
    const categories = await Category.findAll();
    console.log(`Found ${categories.length} categories`);

    // Map category names to IDs
    const categoryMap = {};
    categories.forEach(category => {
      categoryMap[category.name.toLowerCase()] = category.id;
    });

    // Assign categories to authorities based on their roles
    const categoryAssignments = {
      'Rajesh Kumar': ['Roads & Transport', 'Traffic & Safety', 'Water Supply & Drainage', 'Electricity & Power'],
      'Priya Sharma': ['Roads & Transport', 'Water Supply & Drainage', 'Sanitation & Waste', 'Environment'],
      'Suresh Reddy': ['Roads & Transport', 'Traffic & Safety', 'Water Supply & Drainage'],
      'Anita Singh': ['Roads & Transport', 'Traffic & Safety'],
      'Vikram Patel': ['Sanitation & Waste', 'Environment'],
      'Dr. Meera Joshi': ['Health & Safety', 'Environment']
    };

    // Create authorities
    for (const authorityData of authoritiesData) {
      const assignedCategories = categoryAssignments[authorityData.name] || [];
      const categoryIds = assignedCategories
        .map(catName => categoryMap[catName.toLowerCase()])
        .filter(id => id);

      const authority = await Authority.create({
        ...authorityData,
        categories: categoryIds
      });

      // Associate with categories
      if (categoryIds.length > 0) {
        await authority.setCategories(categoryIds);
      }

      console.log(`Created authority: ${authority.name} with ${categoryIds.length} categories`);
    }

    console.log('Authority seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding authorities:', error);
  }
};

module.exports = { seedAuthorities };

// Run if called directly
if (require.main === module) {
  const { syncDatabase } = require('../models');
  syncDatabase().then(() => {
    seedAuthorities().then(() => {
      process.exit(0);
    });
  });
}
