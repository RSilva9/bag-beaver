import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MainMenu from './components/MainMenu'
import JoinCampaign from './components/Player/JoinCampaign'
import { useSocketConnection } from './network/socket'
import CampaignDashboard from './components/DM/CampaignDashboard'
import CampaignView from './components/DM/CampaignView'
import CampaignCreator from './components/DM/CampaignCreator'

function App() {
  useSocketConnection();

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

        <Route path="/campaign/:campaignCode" element = {
          <div>
            <h2>HOLA</h2>
            <CampaignView />
          </div>
        } />

        <Route path="/create-campaign" element = {
          <div>
            <h2>HOLA</h2>
            <CampaignCreator />
          </div>
        } />

      </Routes>
    </BrowserRouter>
  )
}

export default App
