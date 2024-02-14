curl -X PATCH   http://127.0.0.1:8000/api/v1/settings/notification-preference   -H 'Content-Type: application/json'   -H 'Authorization: Bearer MQ.Kf6_q3-Ea4MkmqQxbNo7xCpqg3NFIRw8dA88vSdr8Fu0OkmHSEHnpAvXtOa0'   -d '{
  "1": {
    "app": false,
    "email": true
  },
  "2": {
    "app": true,
    "email": true
  }

}'
