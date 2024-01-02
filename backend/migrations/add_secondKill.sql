create TABLE orderlist(
	id INT PRIMARY KEY AUTO_INCREMENT,
    productName VARCHAR(255) NOT NULL,
    userName VARCHAR(255) NOT NULL
);

CREATE TABLE seckillproduct (
	id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    price VARCHAR(255) NOT NULL,
    number VARCHAR(255),
    picture VARCHAR(255)
);