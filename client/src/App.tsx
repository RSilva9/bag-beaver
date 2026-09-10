import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainMenu from './components/MainMenu'
import JoinCampaign from './components/Player/JoinCampaign'
import { connect } from './network/socket'
import { useEffect } from 'react'
import CampaignDashboard from './components/DM/CampaignDashboard'

function App() {
  useEffect(()=> {
    connect()
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element = {
          <MainMenu />
        } />
        <Route path="/join-campaign" element = {
          <JoinCampaign />
        } />
        <Route path="/campaign-dashboard" element = {
          <div>
            <h2>HOLA</h2>
            <CampaignDashboard />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
