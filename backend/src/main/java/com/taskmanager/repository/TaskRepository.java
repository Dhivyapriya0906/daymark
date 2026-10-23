package com.taskmanager.repository; import com.taskmanager.entity.Task; import com.taskmanager.enums.*; import java.util.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param;
public interface TaskRepository extends JpaRepository<Task,Long>{
 @Query("select t from Task t where t.owner.id=:owner and (:status is null or t.status=:status) and (:priority is null or t.priority=:priority) and (:search is null or lower(t.title) like lower(concat('%',:search,'%')) or lower(coalesce(t.description,'')) like lower(concat('%',:search,'%'))) order by t.dueDate asc nulls last,t.createdAt desc") List<Task> filtered(@Param("owner") Long owner,@Param("status") TaskStatus status,@Param("priority") TaskPriority priority,@Param("search") String search);
 Optional<Task> findByIdAndOwnerId(Long id,Long owner); long countByOwnerId(Long id); long countByOwnerIdAndStatus(Long id,TaskStatus status);
}
