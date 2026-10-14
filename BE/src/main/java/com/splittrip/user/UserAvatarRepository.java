package com.splittrip.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.Set;
import java.util.UUID;

public interface UserAvatarRepository extends JpaRepository<UserAvatar, UUID> {
    @Query("select a.userId from UserAvatar a where a.userId in :ids")
    Set<UUID> findUserIdsWithAvatar(Collection<UUID> ids);
}
