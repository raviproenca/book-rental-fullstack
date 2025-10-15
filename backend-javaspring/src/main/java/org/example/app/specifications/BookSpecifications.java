package org.example.app.specifications;

import org.example.app.models.entities.BookEntity;
import org.springframework.data.jpa.domain.Specification;

public class BookSpecifications {

    public static Specification<BookEntity> hasName(String name) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("name"), name);
    }

    public static Specification<BookEntity> hasAuthor(String author) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("author"), author);
    }

    public static Specification<BookEntity> isAvailable() {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThan(root.get("totalInUse"), 0);
    }
}
