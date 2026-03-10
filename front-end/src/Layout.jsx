import { Outlet } from "react-router-dom"
import NavBar from "./NavBar"
import Footer from "./Footer"

export default function Layout() {
  return (
    <div className="page">
      <NavBar />
      <main className="page-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}