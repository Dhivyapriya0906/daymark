package com.taskmanager.dto; public record AuthResponse(String token,UserInfo user){public record UserInfo(Long id,String name,String email){}}
