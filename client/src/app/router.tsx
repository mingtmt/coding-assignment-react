import { createBrowserRouter } from 'react-router-dom';
import ListScreen from './pages/TicketsList';
import DetailsScreen from './pages/TicketDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      { index: true, element: <ListScreen /> },
      { path: 'ticket/:id', element: <DetailsScreen /> }
    ]
  }
]);
