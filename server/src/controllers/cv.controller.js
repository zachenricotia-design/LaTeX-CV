import crypto from 'crypto';
import * as cvService from '../services/cv.service.js';

const computeHash = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const requireAccess = (cv, token) => {
  if (!cv) {
    return { status: 404, message: 'CV not found' };
  }

  if (cv.user_id) {
    return { status: 403, message: 'Authenticated CV access is not supported yet' };
  }

  if (!token) {
    return { status: 401, message: 'Missing CV access token' };
  }

  const tokenHash = computeHash(token);
  if (tokenHash !== cv.access_token_hash) {
    return { status: 403, message: 'Invalid CV access token' };
  }

  return null;
};

const normalizeCV = (cv) => ({
  id: cv.id,
  title: cv.title,
  personal: cv.personal_data || {},
  sections: cv.sections || [],
  createdAt: cv.created_at,
  updatedAt: cv.updated_at,
});

export const createCV = async (req, res, next) => {
  try {
    const { title = 'My Resume', personal, sections } = req.body;
    const accessToken = crypto.randomBytes(32).toString('hex');
    const accessTokenHash = computeHash(accessToken);

    const cv = await cvService.createCV({ title, personal, sections, accessTokenHash });

    res.status(201).json({
      id: cv.id,
      accessToken,
      createdAt: cv.created_at,
      updatedAt: cv.updated_at,
    });
  } catch (error) {
    next(error);
  }
};

export const getCV = async (req, res, next) => {
  try {
    const { id } = req.params;
    const accessToken = req.header('X-CV-Access-Token');
    const cv = await cvService.findCVById(id);

    const accessError = requireAccess(cv, accessToken);
    if (accessError) {
      return res.status(accessError.status).json({ error: true, message: accessError.message });
    }

    res.json(normalizeCV(cv));
  } catch (error) {
    next(error);
  }
};

export const updateCV = async (req, res, next) => {
  try {
    const { id } = req.params;
    const accessToken = req.header('X-CV-Access-Token');
    const { personal, sections } = req.body;
    const cv = await cvService.findCVById(id);

    const accessError = requireAccess(cv, accessToken);
    if (accessError) {
      return res.status(accessError.status).json({ error: true, message: accessError.message });
    }

    const updated = await cvService.updateCV(id, { personal, sections });
    res.json(normalizeCV(updated));
  } catch (error) {
    next(error);
  }
};

export const deleteCV = async (req, res, next) => {
  try {
    const { id } = req.params;
    const accessToken = req.header('X-CV-Access-Token');
    const cv = await cvService.findCVById(id);

    const accessError = requireAccess(cv, accessToken);
    if (accessError) {
      return res.status(accessError.status).json({ error: true, message: accessError.message });
    }

    const deleted = await cvService.deleteCV(id);
    if (!deleted) {
      return res.status(404).json({ error: true, message: 'CV not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
