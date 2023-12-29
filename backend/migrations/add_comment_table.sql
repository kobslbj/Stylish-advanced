CREATE TABLE comment (
    productId BIGINT UNSIGNED,
    commentId INT AUTO_INCREMENT PRIMARY KEY,
    userId BIGINT UNSIGNED,
    username varchar(255),
    userpicture varchar(255),
    text TEXT,
    rating INT,
    images_url JSON,
    commentTime varchar(255),
    likes INT DEFAULT 0,
    FOREIGN KEY (productId) REFERENCES product(id),
    FOREIGN KEY (userId) REFERENCES user(id)
);