import { Router } from 'express';
import * as ctrl from './settings.controller.js';

export const settingsRoutes = Router();

settingsRoutes.get('/', ctrl.get);
settingsRoutes.put('/', ctrl.update);
