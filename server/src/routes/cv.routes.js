import express from 'express';
import rateLimit from 'express-rate-limit';
import { createCV, getCV, updateCV, deleteCV, claimCV } from '../controllers/cv.controller.js';
import { validateCVBody, validateCVIdParam } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const createLimiter = rateLimit({ windowMs: 1000 * 60 * 60, max: 10, message: { error: true, message: 'Too many requests' } });

router.post('/', createLimiter, validateCVBody, createCV);
router.get('/:id', validateCVIdParam, getCV);
router.put('/:id', validateCVIdParam, validateCVBody, updateCV);
router.delete('/:id', validateCVIdParam, deleteCV);

// Claim endpoint: user claims an anonymous CV using X-CV-Access-Token and auth JWT
router.post('/:id/claim', validateCVIdParam, requireAuth, claimCV);

export default router;
