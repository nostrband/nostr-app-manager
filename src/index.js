import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from 'react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ThemeProvider from 'react-bootstrap/ThemeProvider';
import { IntlProvider } from './IntlProvider';
import RepositoryPage from './pages/RepositoryPage';
import './index.scss';
import Root from './Root';
import Recommendations from './Recommendations';
import Profile from './Profile';
import AppInfo from './AppInfo';
import AppEdit from './AppEdit';
import reportWebVitals from './reportWebVitals';
import { LoginModalProvider } from './context/ShowModalContext';
import { ToastContainer } from 'react-toastify';
import RepositoryInfo from './RepositoryInfo';
import { AuthProvider } from './context/AuthContext';
import { ReviewModalProvider } from './context/ShowReviewContext';
import { AppStateProvider } from './context/AppContext';
import ContainerWithHeaderFooter from './layout/ContainerWithHeaderFooter';
import Tags from './components/Tags/Tags';

const HTTP = new QueryClient();

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
  },
  {
    path: '/about',
    element: <Root />,
  },
  {
    path: '/recommendations',
    element: <Recommendations />,
  },
  {
    path: '/p/:npub',
    element: <Profile />,
  },
  {
    path: '/a/:naddr',
    element: <AppInfo />,
  },
  {
    path: '/edit/:naddr?',
    element: <AppEdit />,
  },
  {
    path: '/create-repository/:naddr?',
    element: <RepositoryPage />,
  },
  {
    path: '/r/:naddr',
    element: <RepositoryInfo />,
  },
  {
    path: '/tags/:tag',
    element: (
      <ContainerWithHeaderFooter>
        <Tags />
      </ContainerWithHeaderFooter>
    ),
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <QueryClientProvider client={HTTP}>
    <AuthProvider>
      <AppStateProvider>
        <LoginModalProvider>
          <ReviewModalProvider>
            <IntlProvider>
              <ThemeProvider>
                <RouterProvider router={router} />
                <ToastContainer />
              </ThemeProvider>
            </IntlProvider>
          </ReviewModalProvider>
        </LoginModalProvider>
      </AppStateProvider>
    </AuthProvider>
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
