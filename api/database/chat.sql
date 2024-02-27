CREATE DATABASE chat_app;

CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    firstName VARCHAR(225) NOT NULL,
    lastName VARCHAR(225) NOT NULL,
    username VARCHAR(225) NOT NULL UNIQUE, 
    password VARCHAR(225) NOT NULL
    );

ALTER TABLE users
ADD COLUMN last_active_at timestamp without time zone;

CREATE TABLE messages(
     message_id SERIAL PRIMARY KEY,
	 message_text VARCHAR(225) NOT NULL,
     created_at TIMESTAMP NOT NULL,
     username VARCHAR(225) REFERENCES users(username) NOT NULL,
     channel_id INT REFERENCES channels(id) NOT NULL
    );

CREATE table channels(
  id SERIAL PRIMARY KEY,
  channel VARCHAR(225) NOT NULL,
  created_at TIMESTAMP NOT NULL	
);