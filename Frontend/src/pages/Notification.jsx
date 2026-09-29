import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import "../styles/ApplierDashboard.css";
import Footer from "../components/Footer";
import logo from "../assets/logo.png";

const Notification = () => {
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(
    localStorage.getItem("user")
  );

  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:5000/claims"
        );

        const claims = await response.json();

        const myClaims = claims.filter(
          (claim) =>
            claim.user_id === loggedInUser?.user_id
        );

        const notificationResults = await Promise.all(
          myClaims.map(async (claim) => {
            try {
              const notificationResponse = await fetch(
                `http://127.0.0.1:5000/claims/${claim.claim_id}/notification`
              );

              const notificationData =
                await notificationResponse.json();

              if (
                notificationResponse.ok &&
                notificationData.success
              ) {
                return {
                  id: claim.claim_id,
                  claimId: claim.claim_id,
                  sender: "Medical Claim System",
                  subject: notificationData.status,
                  message: notificationData.message,
                  date: claim.treatment_start_date || "-",
                  claimAmount: notificationData.claim_amount,
                };
              }

              return null;

            } catch (error) {
              console.error(
                `Notification error for claim ${claim.claim_id}:`,
                error
              );

              return null;
            }
          })
        );

        const validNotifications =
          notificationResults.filter(
            (notification) => notification !== null
          );

        setNotifications(validNotifications);

        if (validNotifications.length > 0) {
          setSelectedNotification(validNotifications[0]);
        }

      } catch (error) {
        console.error(
          "Failed to fetch notifications:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

  }, [loggedInUser?.user_id]);

  return (
    <div className="home-container">

      {/* HEADER */}
      <header className="header">

        <div className="logo">
          <img src={logo} alt="People's Bank" />
        </div>

        <h1 className="page-title">
          Notification Inbox
        </h1>

        <div className="top-nav">

          <span
            className="nav-link"
            onClick={() => navigate("/applier-dashboard")}
          >
            Back
          </span>

          <span
            className="nav-link"
            onClick={() => navigate("/")}
          >
            Logout
          </span>

        </div>

      </header>


      {/* MAIN */}
      <div
        className="main-section dashboard-layout"
        style={{ justifyContent: "center" }}
      >

        <main
          className="dashboard-content"
          style={{ width: "90%" }}
        >

          <div className="panel">

            <h2>
              Notification Inbox
            </h2>

            {loading ? (

              <p>
                Loading notifications...
              </p>

            ) : notifications.length === 0 ? (

              <p>
                No notifications available.
              </p>

            ) : (

              <div className="mail-layout">

                {/* NOTIFICATION LIST */}
                <div className="mail-list">

                  {notifications.map((item) => (

                    <div
                      key={item.id}
                      className="mail-item"
                      onClick={() =>
                        setSelectedNotification(item)
                      }
                    >

                      <h4>
                        {item.sender}
                      </h4>

                      <p>
                        {item.subject}
                      </p>

                      <span>
                        Claim CLM-
                        {String(item.claimId).padStart(3, "0")}
                      </span>

                    </div>

                  ))}

                </div>


                {/* PREVIEW */}
                <div className="mail-preview">

                  {selectedNotification ? (

                    <>

                      <h3>
                        {selectedNotification.subject}
                      </h3>

                      <p>
                        <b>From:</b>{" "}
                        {selectedNotification.sender}
                      </p>

                      <p>
                        <b>Claim ID:</b> CLM-
                        {String(
                          selectedNotification.claimId
                        ).padStart(3, "0")}
                      </p>

                      <hr />

                      <p>
                        {selectedNotification.message}
                      </p>

                      <p>
                        <b>Claim Amount:</b> Rs.
                        {Number(
                          selectedNotification.claimAmount || 0
                        ).toLocaleString()}
                      </p>

                    </>

                  ) : (

                    <p>
                      Select a notification to view details
                    </p>

                  )}

                </div>

              </div>

            )}

          </div>

        </main>

      </div>

      <Footer />

    </div>
  );
};

export default Notification;