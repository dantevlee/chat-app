import React, { useRef, useState } from "react";
import axios from "axios";
import { Alert } from 'react-bootstrap';
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import chat from "../assets/chat.png";

const LoginForm = ({ setIsLoggedIn }) => {
  let emailInputRef = useRef();
  let passwordInputRef = useRef();
  const [error, setError] = useState("");
  const [visitCount, setVisitCount] = useState(1)
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (visitCount === 1){
      setIsInitialLoad(true)
    }

    const loginBody = {
      email: emailInputRef.current.value,
      password: passwordInputRef.current.value,
    };

    try {
      const response = await axios.post("https://chat-rest.onrender.com/api/login", loginBody);

      if (response.status === 400) {
        setError('User not found or password is incorrect.');
        setIsInitialLoad(false)
        return;
      }
  
      const user = response.data.token;
  
      localStorage.setItem("token", user);
  
      localStorage.setItem("email", response.data.email);
  
      if (response.status === 200) {
        setIsLoggedIn(true);
      }

      setIsInitialLoad(false)
      if (visitCount > 0){
        setVisitCount(0)
      }

    } catch(err) {
      setError('An error occurred please try again later.')
    }

   
  };

  const removeNotification = () => {
    setIsInitialLoad(false);
    setVisitCount(0)
  }

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
       <Alert variant="info" onClose={() => removeNotification()} dismissible>
          This server is running on a free instance in the cloud that spins down if unused. It may take a few seconds for the first app log-in attempt. Thank you for your patience!
        </Alert>
      <form
        style={{
          width: 400,
          border: "1px solid",
          backgroundColor: "#cad5df",
          borderRadius: "5mm",
          padding: "20px",
        }}
        onSubmit={handleSubmit}
      >
        <img
          src={chat}
          alt="chit-chit"
          style={{
            maxWidth: "100%",
            height: "auto",
            borderRadius: "5mm",
            marginBottom: "20px",
          }}
        />
         {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            required
            type="email"
            className="form-control"
            id="email"
            placeholder="Email..."
            ref={emailInputRef}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            required
            type="password"
            className="form-control"
            id="password"
            placeholder="Password..."
            ref={passwordInputRef}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Submit
        </button>

        <p className="mt-3">
          Don't have an account? <Link to="/register">REGISTER</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
