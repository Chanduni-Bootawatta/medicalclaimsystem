import React from "react";
import { Routes, Route } from "react-router-dom";
import Manager from "./pages/Manager";
import BOfficer from "./pages/BOfficer";
import AOfficer from "./pages/AOfficer";
import ManagerApprovals from "./pages/ManagerApprovals";
import ABApprovals from "./pages/ABApprovals";
import Reversed from "./pages/Reversed";
import Paid from "./pages/Paid";
import PaymentHistory from "./pages/PaymentHistory";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ApplicationForm from "./pages/ApplicationForm";
import ApplierDashboard from "./pages/ApplierDashboard";
import StaffOfficer from "./pages/StaffOfficer"; // Imported your staff page
import Support from "./pages/Support";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/application-form" element={<ApplicationForm />} />
      <Route path="/applier-dashboard" element={<ApplierDashboard/>}
/>


      {/* Staff page endpoint path */}
      <Route path="/staff-officer" element={<StaffOfficer />} />
      <Route path="/manager" element={<Manager />} />
      <Route path="/b-officer" element={<BOfficer />} />
      <Route path="/a-officer" element={<AOfficer />} />
      <Route path="/manager-approvals" element={<ManagerApprovals />} />
      <Route path="/ab-approvals" element={<ABApprovals />} />
      <Route path="/reversed-claims" element={<Reversed />} />
      <Route path="/paid-claims" element={<Paid />} />
      <Route path="/payment-history" element={<PaymentHistory />} />
      <Route path="/support"element={<Support />}
/>
   

      {/* Login portals passing roles */}
      <Route path="/staff-login" element={<Login role="staff" />} />
      <Route path="/manager-login" element={<Login role="manager" />} />
      <Route path="/a-login" element={<Login role="a" />} />
      <Route path="/b-login" element={<Login role="b" />} />
      <Route path="/applier-login" element={<Login role="applier" />} />
    </Routes>
  );
}

export default App;