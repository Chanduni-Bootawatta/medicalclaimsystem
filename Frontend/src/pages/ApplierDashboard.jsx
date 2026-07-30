import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import "../styles/ApplierDashboard.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";


const ApplierDashboard = () => {

  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedNotification, setSelectedNotification] = useState(null);


  const notifications = [
    {
      id:1,
      sender:"Staff Officer",
      subject:"Claim Approved",
      message:"Your medical claim CLM-001 has been approved by the Staff Officer.",
      date:"2026-07-15"
    },
    {
      id:2,
      sender:"Manager",
      subject:"Claim Forwarded",
      message:"Your medical claim CLM-002 has been forwarded for final approval.",
      date:"2026-07-14"
    },
    {
      id:3,
      sender:"System",
      subject:"Payment Completed",
      message:"Payment for claim CLM-003 has been successfully processed.",
      date:"2026-07-10"
    }
  ];



  const claims=[
    {
      id:"CLM-001",
      category:"A1",
      submitted:"2026-07-01",
      amount:"Rs.25,000",
      status:"Approved"
    },
    {
      id:"CLM-002",
      category:"B3",
      submitted:"2026-07-05",
      amount:"Rs.18,000",
      status:"Pending"
    },
    {
      id:"CLM-003",
      category:"C1",
      submitted:"2026-06-20",
      amount:"Rs.10,000",
      status:"Paid"
    }
  ];



  const payments=[
    {
      id:"CLM-003",
      amount:"Rs.10,000",
      date:"2026-07-10",
      status:"Completed"
    },
    {
      id:"CLM-004",
      amount:"Rs.30,000",
      date:"2026-06-15",
      status:"Completed"
    }
  ];



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
className={activeSection==="notifications"?"active-link":""}
onClick={()=>setActiveSection("notifications")}
>
    Notification Inbox

    <span className="notification-wrapper">
        <span className="bell-icon"></span>
        <span className="notification-count">3</span>
    </span>

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
Welcome PB001
</h2>


<p>
Manage your medical claim applications, notifications and payments.
</p>


</div>


</div>


</div>





<div className="balance-card">


<h3>
Available Balance
</h3>


<h2>
Rs.125,000.00
</h2>


<p>
Medical reimbursement account
</p>


</div>




</div>







<div className="summary-container">


<div className="summary-card">
<h3>Total Claims</h3>
<p>5</p>
</div>


<div className="summary-card">
<h3>Pending</h3>
<p>2</p>
</div>


<div className="summary-card">
<h3>Approved</h3>
<p>3</p>
</div>


<div className="summary-card">
<h3>Paid</h3>
<p>2</p>
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
activeSection==="notifications" &&


<div className="panel">


<h2>
Notification Inbox
</h2>


<div className="mail-layout">


<div className="mail-list">


{
notifications.map(item=>(

<div
key={item.id}
className="mail-item"
onClick={()=>setSelectedNotification(item)}
>


<h4>
{item.sender}
</h4>


<p>
{item.subject}
</p>


<span>
{item.date}
</span>


</div>


))

}


</div>





<div className="mail-preview">


{
selectedNotification ?

<>

<h3>
{selectedNotification.subject}
</h3>


<p>
From: {selectedNotification.sender}
</p>


<hr/>


<p>
{selectedNotification.message}
</p>


<p>
{selectedNotification.date}
</p>


</>


:

<p>
Select a notification to view details
</p>


}


</div>


</div>


</div>


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

<tr key={claim.id}>

<td>{claim.id}</td>
<td>{claim.category}</td>
<td>{claim.submitted}</td>
<td>{claim.amount}</td>
<td>{claim.status}</td>

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
<th>Date</th>
<th>Status</th>
</tr>

</thead>



<tbody>


{
payments.map(payment=>(

<tr key={payment.id}>


<td>{payment.id}</td>
<td>{payment.amount}</td>
<td>{payment.date}</td>
<td>{payment.status}</td>


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