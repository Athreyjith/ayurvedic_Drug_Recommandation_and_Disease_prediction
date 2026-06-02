CREATE DATABASE IF NOT EXISTS ayurvedic_db;
USE ayurvedic_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  age INT DEFAULT 0,
  gender ENUM('Male','Female','Other') DEFAULT 'Other',
  role ENUM('user','admin','doctor') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  symptom1 VARCHAR(100),
  symptom2 VARCHAR(100),
  symptom3 VARCHAR(100),
  predicted_disease VARCHAR(150),
  confidence FLOAT,
  type VARCHAR(50) DEFAULT 'disease',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS drug_recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  disease VARCHAR(150),
  age INT,
  gender VARCHAR(20),
  severity VARCHAR(50),
  recommended_drug VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100),
  age INT,
  gender VARCHAR(20),
  disease VARCHAR(150),
  preferred_date DATE,
  notes TEXT,
  admin_note TEXT,
  status ENUM('Pending','Approved','Rejected','Completed') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  appointment_id INT,
  message TEXT,
  sender ENUM('user','doctor') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) DEFAULT 'General',
  message TEXT,
  rating INT DEFAULT 5,
  status ENUM('Open','Resolved') DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT,
  response TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Default admin user (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES 
('Admin', 'admin@ayurveda.com', SHA2('admin123', 256), 'admin'),
('Doctor', 'doctor@ayurveda.com', SHA2('doctor123', 256), 'doctor');
