import React, { useCallback } from "react";

const Messages = ({ messages }) => {
  const setRef = useCallback((node) => {
    if (node) {
      node.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  let chatMessages;

  if (messages) {
    chatMessages = messages.map((chat, index) => {
      return (
        <div key={index} ref={setRef} className="bubble">
          <p style={{ fontWeight: "bold" }}>{chat.firstname}</p>
          <p>{chat.message_text}</p>
        </div>
      );
    });
  }
  return (
      <div className="col-md-6 pl-0">
        <div className="card card-bordered">
          <div className="card-header">
            <h4 className="card-title">
              <strong>Chat</strong>
            </h4>
          </div>

          <div
            className="ps-container ps-theme-default ps-active-y"
            id="chat-content"
            style={{
              overflow: "scroll !important",
              height: "400px !important",
            }}
          >
            <div>
              <div>
                <div>{chatMessages}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Messages;
