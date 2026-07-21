import express from 'express';
import { createCV, getCV, updateCV, deleteCV } from '../controllers/cv.controller.js';
import { validateCVBody, validateCVIdParam } from '../middleware/validate.js';

const router = express.Router();

router.post('/', validateCVBody, createCV);
router.get('/:id', validateCVIdParam, getCV);
router.put('/:id', validateCVIdParam, validateCVBody, updateCV);
router.delete('/:id', validateCVIdParam, deleteCV);

export default router;
