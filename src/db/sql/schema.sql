CREATE TABLE Velar (
	id INTEGER UNIQUE,
	password VARCHAR(255) NOT NULL,
	status BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE Pattern (
    id SERIAL PRIMARY KEY,
    image_URL VARCHAR(255) DEFAULT NULL,
    status BOOLEAN NOT NULL DEFAULT FALSE,
	vel_id INTEGER,
	name VARCHAR(255) NOT NULL,
	length INTEGER,
	matrix TEXT
);

ALTER TABLE Pattern
	ADD CONSTRAINT fk_vel_id FOREIGN KEY (vel_id) REFERENCES Velar(id) ON DELETE SET NULL;