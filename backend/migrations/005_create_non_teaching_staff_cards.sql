CREATE TABLE IF NOT EXISTS non_teaching_staff_cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
    user_id INT NOT NULL,
    card_number VARCHAR(50) NOT NULL,
    status ENUM('active', 'revoked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY (school_id, card_number)
);
