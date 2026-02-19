package org.example.app.specifications;

import jakarta.persistence.criteria.Expression;
import org.example.app.models.entities.PublisherEntity;
import org.example.app.models.entities.RentEntity;
import org.springframework.data.jpa.domain.Specification;

public class RentSpecifications {

    public static Specification<RentEntity> byGlobalSearch(String search) {
        if (search == null || search.trim().isEmpty()) {
            return Specification.where(null);
        }

        String searchPattern = "%" + search.toLowerCase() + "%";

        Specification<RentEntity> spec = Specification.<RentEntity>where(
                ((root, query, cb) -> cb.like(cb.lower(root.get("bookEntity").get("name")), searchPattern))
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("renterEntity").get("name")), searchPattern)
        ).or(
                (root, query, cb) -> {
                    String format = "DD/MM/YYYY";
                    Expression<String> dateString = cb.function(
                            "to_char",
                            String.class,
                            root.get("rentDate"),
                            cb.literal(format)
                    );
                    return cb.like(dateString, searchPattern);
                }
        ).or(
                (root, query, cb) -> {
                    String format = "DD/MM/YYYY";
                    Expression<String> dateString = cb.function(
                            "to_char",
                            String.class,
                            root.get("deadLine"),
                            cb.literal(format)
                    );
                    return cb.like(dateString, searchPattern);
                }
        ).or(
                (root, query, cb) -> {
                    String format = "DD/MM/YYYY";
                    Expression<String> dateString = cb.function(
                            "to_char",
                            String.class,
                            root.get("devolutionDate"),
                            cb.literal(format)
                    );
                    return cb.like(dateString, searchPattern);
                }
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("status").as(String.class)), searchPattern)
        );

        if ("não entregue".contains(search.toLowerCase())) {
            spec = spec.or((root, query, cb) -> cb.isNull(root.get("devolutionDate")));
        }

        return spec;
    }
}
