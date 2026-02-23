package org.example.app.specifications;

import jakarta.persistence.criteria.Expression;
import org.example.app.models.entities.BookEntity;
import org.example.app.models.entities.UserEntity;
import org.springframework.data.jpa.domain.Specification;

public class BookSpecifications {

    public static Specification<BookEntity> byGlobalSearch(String search) {
        if (search == null || search.trim().isEmpty()) {
            return Specification.where(null);
        }

        String searchPattern = "%" + search.toLowerCase() + "%";

        return Specification.<BookEntity>where(
                ((root, query, cb) -> cb.like(cb.lower(root.get("name")), searchPattern))
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("author")), searchPattern)
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("publisher").get("name")), searchPattern)
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("totalQuantity").as(String.class)), searchPattern)
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("totalInUse").as(String.class)), searchPattern)
        ).or(
                (root, query, cb) -> {
                    String format = "DD/MM/YYYY";
                    Expression<String> dateString = cb.function(
                            "to_char",
                            String.class,
                            root.get("launchDate"),
                            cb.literal(format)
                    );
                    return cb.like(dateString, searchPattern);
                }
        );
    }
}
