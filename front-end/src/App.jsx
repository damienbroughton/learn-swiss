import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Homepage from './pages/Homepage'
import FlashCardListPage, {loader as flashCardCategoryLoader} from './pages/FlashCardListPage'
import FlashCardPage, {loader as flashCardLoader} from './pages/FlashCardPage'
import ScenarioListPage, {loader as scenarioListLoader} from './pages/ScenarioListPage'
import ScenarioPage, {loader as scenarioLoader} from './pages/ScenarioPage'
import ArticlesList from './pages/ArticlesListPage'
import ArticlePage, {loader as articleLoader} from './pages/ArticlePage'
import Layout from './Layout'
import NotFoundPage from './pages/NotFoundPage'
import LoginPage from './pages/LoginPage'
import CreateAccountPage from './pages/CreateAccountPage'
import AdminPage from './pages/AdminPage'
import MakeFlashCardsPage from './pages/MakeFlashCardsPage'

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
    path: '/scenarios/:title/:mode',
    element: <ScenarioPage />,
    loader: scenarioLoader
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
