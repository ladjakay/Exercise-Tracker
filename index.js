const express = require('express')
const app = express()
const cors = require('cors')
const { randomBytes } = require('crypto')
require('dotenv').config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('public'))

const users = []

const createId = () => randomBytes(12).toString('hex')

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.post('/api/users', (req, res) => {
  const username =
    typeof req.body.username === 'string' ? req.body.username.trim() : ''

  if (!username) {
    return res.status(400).json({ error: 'Username is required' })
  }

  const user = { username, _id: createId(), exercises: [] }
  users.push(user)

  res.json({ username: user.username, _id: user._id })
})

app.get('/api/users', (req, res) => {
  res.json(users.map(({ username, _id }) => ({ username, _id })))
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const user = users.find(({ _id }) => _id === req.params._id)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  const description =
    typeof req.body.description === 'string' ? req.body.description.trim() : ''
  const duration = Number(req.body.duration)

  if (
    !description ||
    req.body.duration === undefined ||
    !Number.isFinite(duration) ||
    duration <= 0
  ) {
    return res.status(400).json({
      error: 'A description and a positive numeric duration are required'
    })
  }

  const exerciseDate =
    typeof req.body.date === 'string' && req.body.date.trim()
      ? new Date(req.body.date)
      : new Date()

  if (Number.isNaN(exerciseDate.getTime())) {
    return res.status(400).json({ error: 'Date must be a valid date' })
  }

  const exercise = {
    description,
    duration,
    date: exerciseDate
  }
  user.exercises.push(exercise)

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: user._id
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(({ _id }) => _id === req.params._id)

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  let log = user.exercises
  const from = req.query.from ? new Date(req.query.from) : null
  const to = req.query.to ? new Date(req.query.to) : null

  if (from && Number.isNaN(from.getTime())) {
    return res.status(400).json({ error: 'from must be a valid date' })
  }

  if (to && Number.isNaN(to.getTime())) {
    return res.status(400).json({ error: 'to must be a valid date' })
  }

  const endOfToDate =
    to && /^\d{4}-\d{2}-\d{2}$/.test(req.query.to)
      ? new Date(to.getTime() + 24 * 60 * 60 * 1000)
      : to

  if (from) {
    log = log.filter(({ date }) => date >= from)
  }
  if (endOfToDate) {
    log = log.filter(({ date }) => date < endOfToDate)
  }

  if (req.query.limit !== undefined) {
    const limit = Number(req.query.limit)
    if (!Number.isInteger(limit) || limit < 0) {
      return res
        .status(400)
        .json({ error: 'limit must be a non-negative integer' })
    }
    log = log.slice(0, limit)
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log.map(({ description, duration, date }) => ({
      description,
      duration,
      date: date.toDateString()
    }))
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
