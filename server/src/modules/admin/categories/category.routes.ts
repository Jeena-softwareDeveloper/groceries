import { Router } from 'express';
import * as ctrl from './category.controller.js';

export const categoryRoutes = Router();

categoryRoutes.get('/', ctrl.list);
categoryRoutes.get('/:id', ctrl.get);
categoryRoutes.post('/', ctrl.create);
categoryRoutes.put('/:id', ctrl.update);
categoryRoutes.delete('/:id', ctrl.remove);
