const express = require('express');
const router = express.Router();
const {
  createYarn,
  updateYarn,
  getYarnById,
  getYarnByFilters
} = require('../models/yarn'); // Adjust path if needed

// Create a new yarn listing
router.post('/', async (req, res) => {
  try {
    const yarn = await createYarn(req.body);
    res.status(201).json(yarn);
  } catch (err) {
    console.error('Error creating yarn:', err);
    res.status(500).json({ error: 'Failed to create yarn' });
  }
});

// Update an existing yarn listing
router.put('/:id', async (req, res) => {
  try {
    const updated = await updateYarn(req.body, req.params.id);
    res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating yarn:', err);
    res.status(500).json({ error: 'Failed to update yarn' });
  }
});

// Get yarn by ID
router.get('/:id', async (req, res) => {
  try {
    const yarn = await getYarnById(req.params.id);
    if (!yarn.length) {
      return res.status(404).json({ error: 'Yarn not found' });
    }
    res.status(200).json(yarn[0]);
  } catch (err) {
    console.error('Error fetching yarn by ID:', err);
    res.status(500).json({ error: 'Failed to fetch yarn' });
  }
});

// Filter yarns by query
router.post('/filters', async (req, res) => {
  try {
    const filters = req.body
    const filteredYarns = await getYarnByFilters(filters);
    res.status(200).json(filteredYarns);
  } catch (err) {
    console.error('Error filtering yarns:', err);
    res.status(500).json({ error: 'Failed to filter yarns' });
  }
});

module.exports = router;