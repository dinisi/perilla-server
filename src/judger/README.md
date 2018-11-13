# Perilla Judger Server

```
User
 | submit
\|/
solution
 | resolve
\|/
task -> mongodb
message -> redis

Judger
 | Query mongodb
\|/
task
 | Judge
\|/
Update mongodb
````