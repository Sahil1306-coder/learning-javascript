require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' })); // Allow requests from local frontend
app.use(express.json());

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  detail: { type: String, default: '', trim: true },
  category: { type: String, default: 'Others', trim: true },
  image: { type: String, default: '' },
  price: { type: Number, default: 0 },
  description: { type: String, default: '' },
  published: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const INITIAL_PRODUCTS = [
  { name: 'ShivaSOL™ Soda Ash Light', detail: 'Soda Ash Light', category: 'Water Treatment', image: 'Soda-Ash-Light.webp', published: true, price: 0, description: 'High purity Soda Ash Light suitable for water treatment and detergent industries.' },
  { name: 'ShivaSOL™ Calcium Carbonate (CaCO₃)', detail: 'Calcium Carbonate', category: 'Paints, Inks & Coatings', image: 'Calcium-carbonate.webp', published: true, price: 0, description: 'Precipitated and ground calcium carbonate for paint, plastics and rubber.' },
  { name: 'ShivaSOL™ PVC Resin', detail: 'PVC Resin', category: 'PVC & Compounding', image: 'PVC-Resins.webp', published: true, price: 0, description: 'Premium suspension PVC resin for pipes, fittings and compounding.' },
  { name: 'ShivaSOL™ Linear Alkyl Benzene Sulphonic Acid (LABSA)', detail: 'LABSA', category: 'Home and Personal Care', image: 'Linear-Alkyl-Benzene-Sulphonic-Acid-LABSA.webp', published: true, price: 0, description: 'Anionic surfactant for heavy duty laundry and home care formulations.' },
  { name: 'ShivaSOL™ Toluene', detail: 'Toluene', category: 'Petrochemical', image: 'Toluene.webp', published: true, price: 0, description: 'Industrial aromatic solvent for synthetic resins, coatings and adhesives.' },
  { name: 'ShivaSOL™ DOTP', detail: 'Dioctyl Terephthalate', category: 'Plasticizers', image: 'Dioctyl-Terephthalate-DOTP.webp', published: true, price: 0, description: 'Non-phthalate eco-friendly plasticizer with excellent thermal stability.' },
  { name: 'ShivaSOL™ Stearic Acid', detail: 'Stearic Acid', category: 'Rubber & Tyres', image: 'Stearic-Acid.webp', published: true, price: 0, description: 'Triple pressed stearic acid for tyre manufacturing and rubber vulcanization.' },
  { name: 'ShivaSOL™ Soap Noodles', detail: 'Soap Noodles', category: 'Soap & Detergents', image: 'Soap-Noodles.webp', published: true, price: 0, description: 'Blend of palm oil and palm kernel oil based soap noodles.' },
  { name: 'ShivaSOL™ Talc', detail: 'Talc', category: 'PVC & Compounding', image: 'Talc.webp', published: true, price: 0, description: 'Ultra-fine micronized talc for plastics reinforcement and fillers.' },
  { name: 'ShivaSOL™ Sodium Sulphate Anhydrous', detail: 'Sodium Sulphate Anhydrous', category: 'Industrial Acids', image: 'Sodium-Sulphate-Anhydrous.webp', published: true, price: 0, description: 'Neutral salt used as a filler in powdered detergents and textile dyeing.' },
  { name: 'ShivaSOL™ Sodium Aluminium Silicate', detail: 'Sodium Aluminium Silicate', category: 'Others', image: 'Sodium-Aluminium-Silicate-1.jpg', published: true, price: 0, description: 'Fine synthetic silicate anti-caking agent for food and industrial use.' },
  { name: 'ShivaSOL™ Stabilizer', detail: 'Stabilizer', category: 'PVC & Compounding', image: 'Stabilizers-1.jpg', published: true, price: 0, description: 'Lead-based and Ca-Zn heat stabilizers for rigid and flexible PVC processing.' },
];

// Health endpoint
app.get('/api/health', (req, res) => res.json({ ok: true, timestamp: new Date() }));

// Get all products (with optional search and category filter)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category && category !== 'All Products') {
      filter.category = category;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { detail: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const { name, detail, category, image, price, description, published } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    const newProduct = await Product.create({
      name: name.trim(),
      detail: detail ? detail.trim() : '',
      category: category || 'Others',
      image: image || '',
      price: Number(price) || 0,
      description: description ? description.trim() : '',
      published: published !== undefined ? Boolean(published) : true,
    });
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed default products
app.post('/api/products/seed', async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0 && !req.query.force) {
      return res.json({ message: `Database already has ${count} products. Use ?force=true to seed anyway.`, count });
    }
    const inserted = await Product.insertMany(INITIAL_PRODUCTS);
    res.json({ message: `Seeded ${inserted.length} default products successfully`, count: inserted.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Home Page Dynamic Content CMS
// -------------------------------------------------------------
const siteContentSchema = new mongoose.Schema({
  key: { type: String, default: 'homepage', unique: true },
  hero: {
    kicker: { type: String, default: "INDIA'S FIRST GREEN BIODEGRADABLE PLASTICIZERS" },
    title: { type: String, default: 'Trusted speciality\nchemicals in 75+ countries' },
    copy: { type: String, default: 'For 38 years, Shivtek has supported industries globally with specialty chemical and petrochemical solutions, backed by a production capacity of 400,000 metric ton per annum.' },
    buttonText: { type: String, default: 'Talk to an Expert' },
    buttonLink: { type: String, default: '#contact' },
  },
  advantages: [
    {
      key: { type: String, default: '' },
      title: { type: String, default: '' },
      detail: { type: String, default: '' },
    }
  ],
  stories: [
    {
      company: { type: String, default: '' },
      quote: { type: String, default: '' },
      name: { type: String, default: '' },
      role: { type: String, default: '' },
      color: { type: String, default: 'green' },
      image: { type: String, default: '' },
    }
  ],
  faqs: [
    {
      question: { type: String, default: '' },
      answer: { type: String, default: '' },
    }
  ],
  companyInfo: {
    address: { type: String, default: '24, 4th Floor, M3M Corner Walk, SPR, Golf Course Road (Extn), Sector – 74, Gurugram, Haryana 122004' },
    plants: { type: String, default: 'Manufacturing Units: Kurnool, Rajpura, and Dahej' },
    upcomingPlant: { type: String, default: 'Upcoming Plant: Pungam and Rajpura' },
    phone: { type: String, default: '+91-124-6584406' },
    email: { type: String, default: 'info@shivtekspechemi.com' },
    copyrightYear: { type: String, default: '2026' },
  }
}, { timestamps: true });

const SiteContent = mongoose.models.SiteContent || mongoose.model('SiteContent', siteContentSchema);

const DEFAULT_SITE_CONTENT = {
  key: 'homepage',
  hero: {
    kicker: 'INDIA’S FIRST GREEN BIODEGRADABLE PLASTICIZERS',
    title: 'Trusted speciality\nchemicals in 75+ countries',
    copy: 'For 38 years, Shivtek has supported industries globally with specialty chemical and petrochemical solutions, backed by a production capacity of 400,000 metric ton per annum.',
    buttonText: 'Talk to an Expert',
    buttonLink: '#contact',
  },
  advantages: [
    { key: 'experience-icon', title: '38+ Years of Expertise', detail: 'Delivering trusted chemical solutions for over three decades.' },
    { key: 'quality-icon', title: 'Quality Assurance', detail: 'Every batch is rigorously tested for consistent quality and performance.' },
    { key: 'rd-icon', title: 'Research & Development', detail: 'Application-focused research to improve product quality and performance.' },
    { key: 'sustainable-icon', title: 'Sustainable Innovation', detail: 'Leading the future with India’s first green biodegradable plasticizer.' },
    { key: 'export-icon', title: 'Two Star Export House', detail: 'Recognized for reliable exports and global supply excellence.' },
    { key: 'capacity-icon', title: '400,000 MTPA Capacity', detail: 'Scalable manufacturing for domestic and global supply requirements.' },
  ],
  stories: [
    {
      company: 'Alpha',
      quote: 'Chlorinated Paraffin from Shivtek Spechem has become a core part of our flame-retardant formulations for rubber and coating products. We switched to them after facing supply delays with our previous vendor, and honestly the transition was smoother than expected — same-week sample turnaround, clear COAs with every batch, and pricing that stayed competitive even when raw material costs were volatile industry-wide. Their CP-52 grade in particular has given us the char formation and flame resistance we need without affecting the material’s mechanical properties. It’s rare to find a supplier this consistent on both quality and delivery.',
      name: 'Pl.Yegappan',
      role: 'MANAGING PARTNER',
      color: 'green',
      image: 'WhatsApp-Image-2026-10-12-at-12.48.50-PM.webp'
    },
    {
      company: 'Ddev Plastiks',
      quote: 'We use Shivtek Spechem’s Chlorinated Paraffin as a secondary plasticizer in our PVC compounding line, and it’s been a solid replacement for costlier plasticizer blends without compromising flexibility or aging performance. What stood out to us was the consistency — batch to batch, the viscosity and chlorine content stayed within spec, which isn’t something we could always count on with previous suppliers. Their technical team also walked us through optimal dosing when we were reformulating one of our cable compounds, which saved us weeks of trial runs. Nearly two years in, Shivtek remains one of our most dependable raw material partners.',
      name: 'Shri R.K Kothari',
      role: 'Director of DDev Plastiks Industries Limited.',
      color: 'blue',
      image: 'WhatsApp-Image-2026-10-12-at-12.48.37-PM-1.jpeg'
    },
    {
      company: 'KEI Wires & Cables',
      quote: 'As an exporter, timing is everything, and Shivtek Spechem has consistently delivered our Chlorinated Paraffin orders on schedule, even during periods of container shortages and port congestion that disrupted other parts of our supply chain. Their documentation is always accurate and ready ahead of shipment, which has saved us from the customs delays we used to run into with previous suppliers. It’s given us one less thing to worry about when we’re juggling multiple international orders at once.',
      name: 'Mr Ramytan',
      role: 'DGM PURCHASE',
      color: 'pink',
      image: 'WhatsApp-Image-2026-10-12-at-12.48.15-PM-edited.webp'
    }
  ],
  faqs: [
    { question: 'Do you offer custom manufacturing solutions?', answer: 'Yes. We provide custom manufacturing and product development support based on customer specifications and application requirements.' },
    { question: 'How do you ensure product quality?', answer: 'Every product is manufactured under stringent quality control processes with batch testing and compliance measures to ensure consistent quality and reliability.' },
    { question: 'Can your team help us choose the right product?', answer: 'Absolutely. Our technical team works closely with customers to understand their applications and recommend the most suitable products for their business needs.' },
    { question: 'What are Green Biodegradable Plasticizers?', answer: 'Green Biodegradable Plasticizers are environmentally responsible alternatives developed to support evolving sustainability requirements while maintaining product quality and application performance.' },
    { question: 'How quickly can I receive a quotation?', answer: 'Once we receive your inquiry, our team reviews your requirements and responds within 48 business hours.' }
  ],
  companyInfo: {
    address: '24, 4th Floor, M3M Corner Walk, SPR, Golf Course Road (Extn), Sector – 74, Gurugram, Haryana 122004',
    plants: 'Manufacturing Units: Kurnool, Rajpura, and Dahej',
    upcomingPlant: 'Upcoming Plant: Pungam and Rajpura',
    phone: '+91-124-6584406',
    email: 'info@shivtekspechemi.com',
    copyrightYear: '2026'
  }
};

// GET active site content (auto-initializes default if absent)
app.get('/api/content', async (req, res) => {
  try {
    let content = await SiteContent.findOne({ key: 'homepage' });
    if (!content) {
      content = await SiteContent.create(DEFAULT_SITE_CONTENT);
    }
    res.json(content);
  } catch (err) {
    console.error('Error fetching site content:', err);
    res.json(DEFAULT_SITE_CONTENT);
  }
});

// PUT update site content
app.put('/api/content', async (req, res) => {
  try {
    const updateData = req.body;
    delete updateData._id;
    delete updateData.key;
    const content = await SiteContent.findOneAndUpdate(
      { key: 'homepage' },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, message: 'Content updated successfully', content });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST reset site content to defaults
app.post('/api/content/reset', async (req, res) => {
  try {
    await SiteContent.findOneAndDelete({ key: 'homepage' });
    const fresh = await SiteContent.create(DEFAULT_SITE_CONTENT);
    res.json({ success: true, message: 'Content reset to defaults successfully', content: fresh });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Global error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON format in request body' });
  }
  console.error('Server error:', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log('Server running on port ' + PORT));
  })
  .catch(err => console.error('MongoDB error:', err.message));