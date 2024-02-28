import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import jwt_decode from "jwt-decode";
import Users from "./Users";
import Messages from "./Messages";
import InputMessage from "./InputMessage";
import Channels from "./Channels";

const ChatPage = ({ setIsLoggedIn }) => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [channelMessages, setChannelMessages] = useState([]);
  const [showInput, setShowInput] = useState(false)

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
    getMessagesAndChannels();

    return () => {
      socket.off();
    };
  }, [messages, socket]);

  const toggleChannel = (channelName) => {
    setSelectedChannel(channelName);
    getChannelMessages(channelName);
    setShowInput(true)
  };

  const getUser = async () => {
    const header = {
      headers: {
        token: localStorage.getItem("token"),
      },
    };
    const response = await axios.get("https://chat-rest.onrender.com/api/users/active", header);
    setUsers(response.data);
  };

  const getMessagesAndChannels = async () => {
    const header = {
      headers: {
        token: localStorage.getItem("token"),
      },
    };
    try {
      const [messagesResponse, channelsResponse] = await Promise.all([
        axios.get("https://chat-rest.onrender.com/api/messages", header),
        axios.get("https://chat-rest.onrender.com/api/channels", header),
      ]);

      const messagesData = messagesResponse.data;
      const channelsData = channelsResponse.data;

      setMessages(messagesData);
      setChannels(channelsData);
     
    } catch (error) {
      console.error(error);
    }
  };

  const getChannelMessages = (channelName) => {
    const filteredMessages = messages.filter((m) => m.channel === channelName);
    setChannelMessages(filteredMessages);
  };

  const logout = async (e) => {
    e.preventDefault();

    try {
      const username = localStorage.getItem("username");

      const response = await axios.post("https://chat-rest.onrender.com/api/logout", { username });

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
    const currentChannel = channels.find((channel) => channel.channel === selectedChannel);

    const message = {
      text,
      username: decoded.username,
      channelId: currentChannel.id
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
              <Channels channels={channels} toggleChannel={toggleChannel} selectedChannel={selectedChannel}/>
              <Messages channelMessages={channelMessages} />
            </div>

            <div className="container d-flex justify-content-center">
              { showInput && <InputMessage
                textInputRef={textInputRef}
                handleSubmit={submit}
              />}
            </div>
          </div>
        </div>
      </div>
  );
};

export default ChatPage;
