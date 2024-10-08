import './App.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Page404 from './Layout/Page404';
import { ConfigProvider } from '../src/Context/ConfigContext';
import routes from './Routes/Routes';
import AppLayout from './Layout/AppLayout';

function App() {
  const mRoutes = [
    {
      element: <AppLayout />,
      errorElement: <Page404 />,
      children: routes,
    },
  ];

  const router = createBrowserRouter(mRoutes);

  return (
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}

export default App;
