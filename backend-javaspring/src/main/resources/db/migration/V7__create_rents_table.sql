CREATE TABLE rents(
	id BIGSERIAL PRIMARY KEY,
	renter_id BIGINT NOT NULL,
	book_id BIGINT NOT NULL,
	dead_line DATE NOT NULL,
	devolution_date DATE,
	rent_date DATE NOT NULL,
	status rent_status NOT NULL DEFAULT 'RENTED'
)