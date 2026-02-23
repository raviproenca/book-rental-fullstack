package org.example.app.specifications;

import org.example.app.models.entities.PublisherEntity;
import org.springframework.data.jpa.domain.Specification;

public class PublisherSpecifications {

    public static Specification<PublisherEntity> byGlobalSearch(String search) {
        if (search == null || search.trim().isEmpty()) {
            return Specification.where(null);
        }

        String searchPattern = "%" + search.toLowerCase() + "%";

        return Specification.<PublisherEntity>where(
                ((root, query, cb) -> cb.like(cb.lower(root.get("name")), searchPattern))
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("email")), searchPattern)
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("telephone")), searchPattern)
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("site")), searchPattern)
        );
    }
}
