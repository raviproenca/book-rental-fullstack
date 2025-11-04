package org.example.app.specifications;

import org.example.app.models.entities.UserEntity;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecifications {

    public static Specification<UserEntity> byGlobalSearch(String search) {
        if (search == null || search.trim().isEmpty()) {
            return Specification.where(null);
        }

        String searchPattern = "%" + search.toLowerCase() + "%";

        return Specification.<UserEntity>where(
                ((root, query, cb) -> cb.like(cb.lower(root.get("name")), searchPattern))
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("email")), searchPattern)
        ).or(
                (root, query, cb) -> cb.like(cb.lower(root.get("role").as(String.class)), searchPattern)
        );
    }
}
