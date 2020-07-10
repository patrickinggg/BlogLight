Author: Patrick Liu(sl17143)    Frank Chen(sc17141) 
Project: SSO, Blog and Shop
===========================
Server:
+ user_controller.js for SSO, at localhost:9700
+ blog_controller.js for BlogLight, at localhost:9701
+ shop_controller.js for Shop, at localhost:9702

Database:
+ sqlite3
+ redis

Note:
To run all parts of the project, it is necessary to start 4 terminals:
+ user_controller.js
+ blog_controller.js
+ shop_controller.js
+ redis-server(external start required and use default port and settings)

Hierarchy:
+ user_controller.js
  + user_service.js
  + cache_service.js
+ blog_controller.js
  + article_service.js
  + follow_service.js
  + image_service.js
  + cache_service.js
+ shop_controller.js
  + credit_service.js
  + cache_service.js

Auto-test:
+ test.js

Front End:
+ localhost:9700/home for SSO
+ localhost:9701/blog/user for BlogLight(need login)
+ localhost:9702/shop for Shop


Test accounts:
patrick@abc.com
Frank@abc.com
jack@abc.com
Password:
22222222 

