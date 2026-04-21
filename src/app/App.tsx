import { BrowserRouter, Routes, Route } from 'react-router';

// Marketing pages
import NavigationHub from './components/NavigationHub';
import LandingPage from './components/LandingPage';
import SignUpPage from './components/SignUpPage';
import LogInPage from './components/LogInPage';

// Organization pages
import CreateOrganization from './components/CreateOrganization';
import OrganizationSelection from './components/OrganizationSelection';
import AcceptInvite from './components/AcceptInvite';
import MembersAndInvites from './components/MembersAndInvites';

// Product pages
import DesignSystemPage from './components/DesignSystemPage';
import Dashboard from './components/Dashboard';
import NewEngagement from './components/NewEngagement';
import BriefReview from './components/BriefReview';
import UploadStatesDemo from './components/UploadStatesDemo';
import EngagementWorkspace from './components/EngagementWorkspace';
import MatchedCasesStatesDemo from './components/MatchedCasesStatesDemo';
import ArtifactStatesDemo from './components/ArtifactStatesDemo';
import OrganizationStatesDemo from './components/OrganizationStatesDemo';
import UsagePage from './components/UsagePage';
import BillingPage from './components/BillingPage';
import SettingsPage from './components/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<NavigationHub />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/create-organization" element={<CreateOrganization />} />
        <Route path="/select-organization" element={<OrganizationSelection />} />
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/members" element={<MembersAndInvites />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-engagement" element={<NewEngagement />} />
        <Route path="/brief-review" element={<BriefReview />} />
        <Route path="/upload-states" element={<UploadStatesDemo />} />
        <Route path="/workspace" element={<EngagementWorkspace />} />
        <Route path="/matched-cases-states" element={<MatchedCasesStatesDemo />} />
        <Route path="/artifact-states" element={<ArtifactStatesDemo />} />
        <Route path="/organization-states" element={<OrganizationStatesDemo />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
