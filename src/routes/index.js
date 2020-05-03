import express from 'express';
import { exemList } from '../controllers/index';

const router = express.Router();

router.get('/exems', exemList);

export default router;