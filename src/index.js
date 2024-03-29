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
import KindView from './components/Kinds/KindView';
import TagView from './components/Tags/TagView';
import { NewReviewStateProvider } from './context/NewReviewsContext';
import EventApps from './components/EventApps/EventApps';
import { UpdateAnswersReviewProvider } from './context/UpdateAnswersContext';
import ReviewInfo from './components/ReviewInfo';
import About from './About';
import NewApps from './components/MainPageComponents/NewApps';
import NewReviews from './components/MainPageComponents/NewReviews';
import Repositories from './components/MainPageComponents/RepositoriesInMainPage';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import SearchResultApps from './components/App/SearchResultApps';
import { Col, Container, Row } from 'react-bootstrap';
import Footer from './components/Footer';

const HTTP = new QueryClient();

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
  },
  {
    path: '/:id?',
    element: (
      <Container className="Root mt-3">
        <EventApps byUrl />
        <Row>
          <Col>
            <Footer />
          </Col>
        </Row>
      </Container>
    ),
  },
  {
    path: '/about',
    element: (
      <ContainerWithHeaderFooter>
        <About />
      </ContainerWithHeaderFooter>
    ),
  },
  {
    path: '/used-apps',
    element: <Root />,
  },
  {
    path: '/review',
    element: <EventApps />,
  },
  {
    path: '/recommendations',
    element: <Recommendations />,
  },
  {
    path: '/p/:npub/:activeTab?',
    element: <Profile />,
  },
  {
    path: '/a/:naddr/:activeTab?/:review?',
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
    path: '/r/:naddr/:activeTab',
    element: <RepositoryInfo />,
  },
  {
    path: '/r/:naddr/:activeTab?/bounty?/:issueUrl?',
    element: <RepositoryInfo />,
  },
  {
    path: '/e/:note',
    element: (
      <ContainerWithHeaderFooter>
        <ReviewInfo />
      </ContainerWithHeaderFooter>
    ),
  },
  {
    path: '/tag/:tag',
    element: (
      <ContainerWithHeaderFooter>
        <TagView />
      </ContainerWithHeaderFooter>
    ),
  },
  {
    path: '/kind/:kind',
    element: (
      <ContainerWithHeaderFooter>
        <KindView />
      </ContainerWithHeaderFooter>
    ),
  },
  {
    path: '/apps/category/:category',
    element: (
      <ContainerWithHeaderFooter>
        <NewApps />
      </ContainerWithHeaderFooter>
    ),
  },
  {
    path: '/reviews',
    element: (
      <ContainerWithHeaderFooter>
        <NewReviews removePadding />
      </ContainerWithHeaderFooter>
    ),
  },
  {
    path: '/repos',
    element: (
      <ContainerWithHeaderFooter>
        <Repositories />
      </ContainerWithHeaderFooter>
    ),
  },
  {
    path: '/search/:searchValue?',
    element: (
      <ContainerWithHeaderFooter>
        <SearchResultApps />
      </ContainerWithHeaderFooter>
    ),
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <QueryClientProvider client={HTTP}>
    <Provider store={store}>
      <AuthProvider>
        <AppStateProvider>
          <NewReviewStateProvider>
            <LoginModalProvider>
              <ReviewModalProvider>
                <UpdateAnswersReviewProvider>
                  <IntlProvider>
                    <ThemeProvider>
                      <RouterProvider router={router} />
                      <ToastContainer />
                    </ThemeProvider>
                  </IntlProvider>
                </UpdateAnswersReviewProvider>
              </ReviewModalProvider>
            </LoginModalProvider>
          </NewReviewStateProvider>
        </AppStateProvider>
      </AuthProvider>
    </Provider>
  </QueryClientProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
