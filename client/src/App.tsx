import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainMenu from './components/MainMenu'
import JoinCampaign from './components/Player/JoinCampaign'
import { connect } from './network/socket'
import { useEffect } from 'react'

function App() {
  useEffect(()=> connect(), []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {
          <MainMenu />
        } />
        <Route path="/join-campaign" element = {
          <JoinCampaign />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
