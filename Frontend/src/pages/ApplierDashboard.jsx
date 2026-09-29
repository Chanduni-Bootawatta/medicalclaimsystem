import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import "../styles/ApplierDashboard.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";


const ApplierDashboard = () => {

  const navigate = useNavigate();

  const loggedInUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [activeSection, setActiveSection] = useState("dashboard");
 

  const [claims, setClaims] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchMyClaims = async () => {
      try {
  
        // Get all claims
        const response = await fetch(
          "http://127.0.0.1:5000/claims"
        );
  
        const data = await response.json();
  
        const myClaims = data.filter(
          claim =>
            claim.user_id === loggedInUser?.user_id
        );
  
        setClaims(myClaims);
  
  
        // Get payment history
        const paymentResponse = await fetch(
          "http://127.0.0.1:5000/claims/payment-history"
        );
  
        const paymentData = await paymentResponse.json();
  
        const myPayments = paymentData.claims.filter(
          payment =>
            payment.user_id === loggedInUser?.user_id
        );
  
        setPayments(myPayments);
  
      } catch (error) {
  
        console.error(
          "Failed to fetch claims and payments:",
          error
        );
  
      }
    };
  
    fetchMyClaims();
  
  }, [loggedInUser?.user_id]);

  


  const totalClaims = claims.length;

const pendingClaims = claims.filter(
  claim => claim.status === "PENDING"
).length;

const approvedClaims = claims.filter(
  claim =>
    claim.status === "APPROVED" ||
    claim.b_status === "APPROVED" ||
    claim.a_status === "APPROVED"
).length;

const paidClaims = claims.filter(
  claim => claim.payment_status === "PAID"
).length;




return (

<div className="home-container">


<header className="header">


<div className="logo">
<img src={logo} alt="People's Bank"/>
</div>


<h1 className="page-title">
Applier Portal
</h1>



<div className="top-nav">

<span 
className="nav-link"
onClick={()=>navigate("/")}
>
Home
</span>


<span 
className="nav-link"
onClick={()=>navigate("/")}
>
Logout
</span>


</div>


</header>





<div className="main-section dashboard-layout">



{/* SIDEBAR */}

<aside className="sidebar-container">


<h3>
Menu
</h3>



<ul className="menu-links">


<li
className={activeSection==="dashboard"?"active-link":""}
onClick={()=>setActiveSection("dashboard")}
>
Dashboard
</li>



<li
onClick={()=>navigate("/application-form")}
>
New Application
</li>



<li
className={activeSection==="claims"?"active-link":""}
onClick={()=>setActiveSection("claims")}
>
My Claims
</li>



<li
  onClick={() => navigate("/notifications")}
>
  Notification Inbox
</li>



<li
className={activeSection==="payments"?"active-link":""}
onClick={()=>setActiveSection("payments")}
>
Payments
</li>



</ul>




<div className="sidebar-bottom">


<div 
onClick={()=>navigate("/support")}
>
Support & Help?
</div>


</div>



</aside>






{/* CONTENT */}


<main className="dashboard-content">



{
activeSection==="dashboard" &&

<>


<div className="top-dashboard-header">



<div className="welcome-box">


<div className="profile-area">


<div className="profile-icon">

</div>



<div>

<h2>
  Welcome {loggedInUser?.full_name}
</h2>

<p>
  Manage your medical claim applications, notifications and payments.
</p>


</div>


</div>


</div>

</div>



<div className="summary-container">

  <div className="summary-card">
    <h3>Total Claims</h3>
    <p>{totalClaims}</p>
  </div>

  <div className="summary-card">
    <h3>Pending</h3>
    <p>{pendingClaims}</p>
  </div>

  <div className="summary-card">
    <h3>Approved</h3>
    <p>{approvedClaims}</p>
  </div>

  <div className="summary-card">
    <h3>Paid</h3>
    <p>{paidClaims}</p>
  </div>

</div>


<div className="quick-action">


<h3>
Submit New Medical Claim
</h3>


<p>
Start a new reimbursement application.
</p>



<button
className="new-claim-btn"
onClick={()=>navigate("/application-form")}
>
Create Application
</button>


</div>



</>

}


{
activeSection==="claims" &&


<div className="panel">


<h2>
My Claims
</h2>


<table className="claims-table">


<thead>

<tr>
<th>ID</th>
<th>Category</th>
<th>Date</th>
<th>Amount</th>
<th>Status</th>
</tr>


</thead>



<tbody>


{
claims.map(claim=>(

<tr key={claim.claim_id}>

<td>
  CLM-{String(claim.claim_id).padStart(3, "0")}
</td>

<td>
  {claim.category}
</td>

<td>
  {claim.treatment_start_date}
</td>

<td>
  Rs.{Number(claim.claim_amount).toLocaleString()}
</td>

<td>
  {claim.status}
</td>

</tr>


))

}


</tbody>


</table>


</div>


}







{
activeSection==="payments" &&


<div className="panel">


<h2>
Recent Payments
</h2>


<table className="claims-table">


<thead>

<tr>
<th>Claim ID</th>
<th>Amount</th>
<th>Treatment Period</th>
<th>Status</th>
</tr>

</thead>



<tbody>

{
  payments.map(payment => (

    <tr key={payment.claim_id}>

      <td>
        CLM-{String(payment.claim_id).padStart(3, "0")}
      </td>

      <td>
        Rs.{Number(payment.claim_amount).toLocaleString()}
      </td>

      <td>
        {payment.treatment_period || "-"}
      </td>

      <td>
        {payment.payment_status}
      </td>

    </tr>

  ))
}




</tbody>


</table>



</div>


}



</main>



</div>



<Footer/>


</div>

);


};


export default ApplierDashboard;