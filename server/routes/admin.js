const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Issue, User, Category, Subcategory, Authority, AuditLog } = require('../models');

// Guard all admin routes
router.use(authenticateToken, requireAdmin);

// List issues with filters for moderation
router.get('/issues', async (req, res) => {
  try {
    const { status, q } = req.query;
    const where = {};
    if (status) where.status = status;
    if (q) {
      where[require('sequelize').Op.or] = [
        { title: { [require('sequelize').Op.iLike]: `%${q}%` } },
        { description: { [require('sequelize').Op.iLike]: `%${q}%` } }
      ];
    }

    const issues = await Issue.findAll({
      where,
      include: [
        { model: Category },
        { model: Subcategory }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    res.json({ issues });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

// Approve issue
router.post('/issues/:id/approve', async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    issue.status = 'open';
    issue.rejectionReason = null;
    issue.approvedBy = req.user.id;
    issue.approvedAt = new Date();
    await issue.save();
    // TEMP: disable audit logging until FK is fixed
    // await AuditLog.create({ adminId: req.user.id, action: 'approve_issue', entityType: 'Issue', entityId: issue.id, metadata: {} });
    res.json({ success: true, issue });
  } catch (e) {
    res.status(500).json({ error: 'Failed to approve issue' });
  }
});

// Reject issue
router.post('/issues/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    issue.status = 'rejected';
    issue.rejectionReason = reason || 'Rejected';
    issue.approvedBy = req.user.id;
    await issue.save();
    // TEMP: disable audit logging until FK is fixed
    // await AuditLog.create({ adminId: req.user.id, action: 'reject_issue', entityType: 'Issue', entityId: issue.id, metadata: { reason } });
    res.json({ success: true, issue });
  } catch (e) {
    res.status(500).json({ error: 'Failed to reject issue' });
  }
});

// Edit issue (basic fields)
router.put('/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findByPk(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    const updatable = ['title', 'description', 'priority', 'categoryId', 'subcategoryId'];
    for (const k of updatable) {
      if (k in req.body) issue[k] = req.body[k];
    }
    await issue.save();
    // TEMP: disable audit logging until FK is fixed
    // await AuditLog.create({ adminId: req.user.id, action: 'edit_issue', entityType: 'Issue', entityId: issue.id, metadata: req.body });
    res.json({ success: true, issue });
  } catch (e) {
    res.status(500).json({ error: 'Failed to edit issue' });
  }
});

// Users management: list, ban/unban
router.get('/users', async (req, res) => {
  const users = await User.findAll({ order: [['createdAt', 'DESC']] });
  res.json(users);
});

router.post('/users/:id/ban', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.isActive = false;
  await user.save();
  // TEMP: disable audit logging until FK is fixed
  // await AuditLog.create({ adminId: req.user.id, action: 'ban_user', entityType: 'User', entityId: user.id });
  res.json({ success: true });
});

router.post('/users/:id/unban', async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.isActive = true;
  await user.save();
  // TEMP: disable audit logging until FK is fixed
  // await AuditLog.create({ adminId: req.user.id, action: 'unban_user', entityType: 'User', entityId: user.id });
  res.json({ success: true });
});

// Categories/Subcategories CRUD (simplified examples)
router.get('/categories', async (req, res) => {
  const cats = await Category.findAll({ include: [Subcategory] });
  res.json(cats);
});

router.post('/categories', async (req, res) => {
  const cat = await Category.create(req.body);
  // TEMP: disable audit logging until FK is fixed
  // await AuditLog.create({ adminId: req.user.id, action: 'create_category', entityType: 'Category', entityId: cat.id, metadata: req.body });
  res.json(cat);
});

router.put('/categories/:id', async (req, res) => {
  const cat = await Category.findByPk(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  Object.assign(cat, req.body);
  await cat.save();
  // TEMP: disable audit logging until FK is fixed
  // await AuditLog.create({ adminId: req.user.id, action: 'update_category', entityType: 'Category', entityId: cat.id, metadata: req.body });
  res.json(cat);
});

router.delete('/categories/:id', async (req, res) => {
  const cat = await Category.findByPk(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Not found' });
  await cat.destroy();
  // TEMP: disable audit logging until FK is fixed
  // await AuditLog.create({ adminId: req.user.id, action: 'delete_category', entityType: 'Category', entityId: cat.id });
  res.json({ success: true });
});

// TODO: authority mappings endpoints could be added similarly

module.exports = router;


