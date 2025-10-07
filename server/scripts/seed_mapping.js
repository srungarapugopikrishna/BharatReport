require('dotenv').config();

const { sequelize, Category, Subcategory, Authority } = require('../models');

// Category → Subcategory → Authority Types mapping (designations/roles)
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

async function upsertAuthority(designation, categoryId, subcategoryId) {
  // Create a generic authority entry per designation using only level field
  const [authority] = await Authority.findOrCreate({
    where: { level: designation },
    defaults: {
      level: designation,
      description: designation,
      isActive: true
    }
  });

  // Ensure category association via join table
  if (categoryId && authority.getCategories && authority.setCategories) {
    const currentCategories = await authority.getCategories({ attributes: ['id'] });
    const ids = Array.from(new Set([...currentCategories.map(c => c.id), categoryId]));
    await authority.setCategories(ids);
  }

  // Associate with subcategory
  if (subcategoryId && authority.setSubcategories) {
    const currentSubs = await authority.getSubcategories({ attributes: ['id'] });
    const currentIds = new Set(currentSubs.map(s => s.id));
    if (!currentIds.has(subcategoryId)) {
      await authority.addSubcategories([subcategoryId]);
    }
  }

  return authority;
}

async function seedMapping() {
  try {
    await sequelize.authenticate();
    console.log('DB connected. Updating subcategory authorityTypes and linking authorities...');

    for (const [categoryName, subcats] of Object.entries(mapping)) {
      const category = await Category.findOne({ where: { name: categoryName } });
      if (!category) {
        console.warn(`Category not found, skipping: ${categoryName}`);
        continue;
      }

      for (const [subName, authorityTypes] of Object.entries(subcats)) {
        const subcategory = await Subcategory.findOne({ where: { name: subName, categoryId: category.id } });
        if (!subcategory) {
          console.warn(`Subcategory not found, skipping: ${categoryName} -> ${subName}`);
          continue;
        }

        // Update authorityTypes array on subcategory
        const uniqueTypes = Array.from(new Set(authorityTypes)).filter(Boolean);
        subcategory.authorityTypes = uniqueTypes;
        subcategory.isActive = true;
        await subcategory.save();

        // Create/link Authority records to this subcategory
        for (const designation of uniqueTypes) {
          await upsertAuthority(designation, category.id, subcategory.id);
        }
      }
    }

    console.log('Mapping seed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding mapping failed:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedMapping();
}

module.exports = { seedMapping };


