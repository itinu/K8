# K8
Node.js MVC structure base on Kohana Framework

[!!! this module still under development !!!]

```
-- application
 L modules
 L system
```

system is this repository.

K8 depends on better-sqlite3
centOS may require install g++ to compile driver.

```sudo yum install /usr/bin/g++```

ORM provide following static variables:

- ORM.lowercase
  - lowercase name of the class
- ORM.key
  - local key of the class
- ORM.tableName
  - table name of the class
- ORM.fields
  - fields of the class
- ORM.belongsTo
  - list of the class belongs
- ORM.hasMany 