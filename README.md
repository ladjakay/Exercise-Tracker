# Exercise Tracker

A small Express API for creating users, recording exercises, and retrieving
exercise logs. Data is stored in memory and is reset when the server restarts.

Run the app with `npm start`. It listens on port `3000` by default; set `PORT`
to use a different port.

## API

- `POST /api/users` with a `username` creates a user.
- `GET /api/users` lists users.
- `POST /api/users/:_id/exercises` with `description`, `duration`, and optional
  `date` records an exercise. Dates default to today and are returned as
  `toDateString()` strings.
- `GET /api/users/:_id/logs` returns a user's exercises. Optional `from` and
  `to` date parameters filter the log, and `limit` caps the number of results.

The included homepage has forms for creating users and adding exercises.
