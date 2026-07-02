import { Router } from 'express';
import * as ctrl from './area.controller.js';

export const areaRoutes = Router();

areaRoutes.get('/', ctrl.list);
areaRoutes.get('/:id', ctrl.get);
areaRoutes.post('/', ctrl.create);
areaRoutes.put('/:id', ctrl.update);
areaRoutes.delete('/:id', ctrl.remove);
