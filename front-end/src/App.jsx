import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Homepage from './pages/Homepage'
import FlashCardListPage, {loader as flashCardCategoryLoader} from './pages/FlashCardListPage'
import FlashCardPage, {loader as flashCardLoader} from './pages/FlashCardPage'
import ScenarioListPage, {loader as scenarioListLoader} from './pages/ScenarioListPage'
import ScenarioPage, {loader as scenarioLoader} from './pages/ScenarioPage'
import ArticlesList from './pages/ArticlesListPage'
import ArticlePage, {loader as articleLoader} from './pages/ArticlePage'
import ChallengeListPage, {loader as challengeListLoader} from './pages/ChallengeListPage'
import Dashboard, {loader as dashboardLoader} from './pages/DashboardPage'
import ChallengePage, {loader as challengeLoader} from './pages/ChallengePage'
import ContactPage from './pages/ContactPage'
import Layout from './Layout'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/LoginPage'
import CreateAccountPage from './pages/CreateAccountPage'
import AdminPage from './pages/AdminPage'
import MakeFlashCardsPage from './pages/MakeFlashCardsPage'
import StoryListPage, {loader as storyListLoader} from './pages/StoryListPage'
import StoryPage, {loader as storyLoader} from './pages/StoryPage'

const routes = [{
  path: '/',
  element: <Layout />,
  errorElement: <NotFoundPage />,
  children: [{
      path: '/',
      element: <Homepage />
  },
  {
    path: '/flashcard/:category',
    element: <FlashCardPage />,
    loader: flashCardLoader
  },
  {
    path: '/flashcards',
    element: <FlashCardListPage />,
    loader: flashCardCategoryLoader
  },
  {
    path: '/make-flashcards',
    element: <MakeFlashCardsPage />
  },
  {
    path: '/scenarios',
    element: <ScenarioListPage />,
    loader: scenarioListLoader
  },
  {
    path: '/scenarios/:reference/:mode',
    element: <ScenarioPage />,
    loader: scenarioLoader
  },
  {
    path: '/stories',
    element: <StoryListPage />,
    loader: storyListLoader
  },
  {
    path: '/stories/:reference',
    element: <StoryPage />,
    loader: storyLoader
  },
  {
    path: '/challenges',
    element: <ChallengeListPage />,
    loader: challengeListLoader
  },
  {
    path: '/contact',
    element: <ContactPage />
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
    loader: dashboardLoader
  },
  {
    path: '/challenges/:reference/:mode',
    element: <ChallengePage />,
    loader: challengeLoader
  },
  {
    path: '/articles',
    element: <ArticlesList />
  },
  {
    path: '/articles/:name',
    element: <ArticlePage />,
    loader: articleLoader
  }, {
    path: '/login',
    element: <LoginPage />
  }, {
    path: '/create-account',
    element: <CreateAccountPage />
  }, {
    path: '/admin',
    element: <AdminPage />,
    loader: flashCardCategoryLoader
  }]
}]

const router = createBrowserRouter(routes);

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
