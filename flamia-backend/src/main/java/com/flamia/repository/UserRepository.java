package com.flamia.repository;

import com.flamia.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findBySupabaseId(String supabaseId);

    Optional<User> findByPhone(String phone);

    boolean existsBySupabaseId(String supabaseId);

    boolean existsByPhone(String phone);
}
