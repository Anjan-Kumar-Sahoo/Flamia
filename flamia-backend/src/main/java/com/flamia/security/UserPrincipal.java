package com.flamia.security;

import com.flamia.entity.User;
import com.flamia.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Getter
public class UserPrincipal extends AbstractAuthenticationToken {

    private final UUID userId;
    private final String supabaseId;
    private final String phone;
    private final UserRole role;

    public UserPrincipal(User user) {
        super(buildAuthorities(user.getRole()));
        this.userId = user.getId();
        this.supabaseId = user.getSupabaseId();
        this.phone = user.getPhone();
        this.role = user.getRole();
        setAuthenticated(true);
    }

    private static Collection<? extends GrantedAuthority> buildAuthorities(UserRole role) {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public Object getCredentials() {
        return null; // JWT-based, no credentials stored
    }

    @Override
    public Object getPrincipal() {
        return userId;
    }
}
