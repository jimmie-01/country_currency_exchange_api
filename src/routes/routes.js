import express from 'express';
import Controller from '../controllers/countries.controller.js';
import statusController from '../controllers/status.controller.js';

const router  = express.Router();

router.post('/countries/refresh', Controller.refresh);
router.get('/countries', Controller.list);
router.get('/countries/image', Controller.image);
router.get('/countries/:name', Controller.getOne);
router.delete('/countries/:name', Controller.image);

router.get('/status', statusController.status);

export default router;