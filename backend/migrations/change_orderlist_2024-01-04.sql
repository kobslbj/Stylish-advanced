ALTER TABLE orderlist ADD product_id bigint unsigned NOT NULL;
ALTER TABLE orderlist DROP COLUMN userName;
ALTER TABLE orderlist ADD user_id bigint unsigned NOT NULL;
ALTER TABLE orderlist DROP COLUMN productName;