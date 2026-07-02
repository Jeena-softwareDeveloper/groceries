import { Router } from 'express';
import * as ctrl from './district.controller.js';

export const districtRoutes = Router();

districtRoutes.get('/', ctrl.list);
districtRoutes.get('/:id', ctrl.get);
districtRoutes.post('/', ctrl.create);
districtRoutes.put('/:id', ctrl.update);
districtRoutes.delete('/:id', ctrl.remove);
