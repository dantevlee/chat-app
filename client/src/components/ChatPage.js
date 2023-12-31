import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Users from "./Users";
import Messages from "./Messages";
import InputMessage from "./InputMessage";

const ChatPage = ({ setIsLoggedIn }) => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);

  const socket = io();

  useEffect(() => {}, [messages]);

  useEffect(() => {
    socket.on("connect", () => {});

    socket.on("receive-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("login", ({ activeUsers }) => {
      setUsers(activeUsers);
    });

    socket.on("logout", ({ activeUsers }) => {
      setUsers(activeUsers);
    });

    getUser();
    getMessage();

    return () => {
      socket.off();
    };
  }, [messages, socket]);

  const getUser = async () => {
    const header = {
      headers: {
        token: localStorage.getItem("token"),
      },
    };
    const response = await axios.get("https://chat-rest.onrender.com/api/users/active", header);
    setUsers(response.data);
  };

  const getMessage = async () => {
    const header = {
      headers: {
        token: localStorage.getItem("token"),
      },
    };
    const response = await axios.get("https://chat-rest.onrender.com/api/messages", header);
    setMessages(response.data);
  };

  const logout = async (e) => {
    e.preventDefault();

    try {
      const userEmail = localStorage.getItem("email");

      const response = await axios.post("https://chat-rest.onrender.com/api/logout", { userEmail });

      if (response.status === 200 || response.status === 201) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  let textInputRef = useRef();

  const submit = (e) => {
    e.preventDefault();
    const text = textInputRef.current.value;
    const token = localStorage.getItem("token");
    let decoded = jwt_decode(token);

    const message = {
      text,
      id: decoded.userId,
      userName: decoded.firstName,
    };

    axios.post("https://chat-rest.onrender.com/api/send/messages", message);

    socket.emit("chatMessage", message);
    textInputRef.current.value = "";
  };

  return (
      <div>
        <button
           style={{ position: "fixed", right: "10px", top: "10px" }}
          className="btn btn-primary"
          onClick={logout}
        >
          Logout
        </button>
        <div className="page-content page-container" id="page-content">
          <div className="padding">
            <div
              style={{ width: 712 }}
              className="container d-flex justify-content-center"
            >
              <Users users={users} />
              <Messages
                messages={messages}
              />
            </div>

            <div className="container d-flex justify-content-center">
              <InputMessage
                textInputRef={textInputRef}
                handleSubmit={submit}
              />
            </div>
          </div>
        </div>
      </div>
  );
};

export default ChatPage;
