curl -X PATCH   http://127.0.0.1:8000/api/v1/settings/notification-preference   -H 'Content-Type: application/json'   -H 'Authorization: Bearer MzQ.elKc5me03sIQa6OVkYdGBNlxN_7r2XveilYKMG1Fr2HnqLXD0B3FE1sLKeHY'   -d '{
  "1": {
    "app": false,
    "email": true
  },
  "2": {
    "app": true,
    "email": false
  }

}'
