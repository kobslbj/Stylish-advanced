CREATE TABLE comment (
    productId BIGINT UNSIGNED,
    commentId INT AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT UNSIGNED,
    text TEXT,
    rating INT,
    images_url JSON,
    likes INT DEFAULT 0,
    FOREIGN KEY (productId) REFERENCES product(id),
    FOREIGN KEY (userId) REFERENCES user(id)
);