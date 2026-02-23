package org.example.app.specifications;

import org.example.app.models.entities.RenterEntity;
import org.springframework.data.jpa.domain.Specification;

public class RenterSpecifications {

    public static Specification<RenterEntity> byGlobalSearch(String search) {
        if (search == null || search.trim().isEmpty()) {
            return Specification.where(null);
        }

        String searchPattern = "%" + search.toLowerCase() + "%";

        return Specification.<RenterEntity>where(
                ((root, query, cb) -> cb.like(cb.lower(root.get("name")), searchPattern))
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("email")), searchPattern)
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("telephone")), searchPattern)
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("address")), searchPattern)
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("cpf")), searchPattern)
        );
    }
}
