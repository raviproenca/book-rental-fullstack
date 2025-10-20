CREATE TABLE books(
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(255) UNIQUE NOT NULL,
	author VARCHAR(255) NOT NULL,
	launch_date DATE NOT NULL,
	total_quantity INTEGER NOT NULL,
	total_in_use INTEGER NOT NULL,
	publisher_id BIGINT NOT NULL,
	FOREIGN KEY (publisher_id) REFERENCES publishers(id)
)