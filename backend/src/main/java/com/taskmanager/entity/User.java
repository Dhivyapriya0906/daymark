package com.taskmanager.entity;
import jakarta.persistence.*; import java.time.Instant; import java.util.*;
@Entity @Table(name="users",uniqueConstraints=@UniqueConstraint(columnNames="email")) public class User {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @Column(nullable=false,length=100) private String name; @Column(nullable=false,length=254) private String email; @Column(nullable=false) private String password; @Column(nullable=false,updatable=false) private Instant createdAt=Instant.now();
 @OneToMany(mappedBy="owner",cascade=CascadeType.ALL,orphanRemoval=true) private List<Task> tasks=new ArrayList<>();
 protected User(){} public User(String name,String email,String password){this.name=name;this.email=email;this.password=password;}
 public Long getId(){return id;} public String getName(){return name;} public String getEmail(){return email;} public String getPassword(){return password;} public Instant getCreatedAt(){return createdAt;}
}
