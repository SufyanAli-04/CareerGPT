import type { RouteConfigItem } from './routeTypes';

import Login from '../pages/Login';
import Register from '../pages/Register';

export const publicRouteConfig: RouteConfigItem[] = [
  { path: '/login', element: <Login /> },
  { path: '/signup', element: <Register /> },
];
