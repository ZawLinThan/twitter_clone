import {Routes, Route} from 'react-router-dom'
import HomePage from "../src/pages/auth/home/HomePage.jsx"
import LoginPage from "../src/pages/auth/login/LoginPage.jsx"
import SignupPage from './pages/auth/signup/SignupPage.jsx'

function App() {

  return (
    <div className="flex max-w-6xl mx-auto">
      <Routes> 
        <Route path="/" element={<HomePage/>}/> 
        <Route path="/login" element={<LoginPage/>}/> 
        <Route path="/signup" element={<SignupPage/>}/> 
      </Routes>
    </div>
  )
}

export default App
