const express = require('express')
const cors = require('cors')
const app = express()

require('dotenv').config()
//const mongoose = require('mongoose')

// DO NOT SAVE YOUR PASSWORD TO GITHUB!!
//const url =
//  process.env.MONGODB_URI;
//  //`mongodb+srv://fullstack:${password}@persons.hnxn8s5.mongodb.net/?retryWrites=true&w=majority&appName=notes`
//  //`mongodb+srv://fullstack:${password}@cluster0.o1opl.mongodb.net/?retryWrites=true&w=majority`
//console.log(url)

//mongoose.set('strictQuery',false)
//mongoose.connect(url)

//const noteSchema = new mongoose.Schema({
//  content: String,
//  important: Boolean,
//})

//noteSchema.set('toJSON', {
//  transform: (document, returnedObject) => {
//    returnedObject.id = returnedObject._id.toString()
//    delete returnedObject._id
//    delete returnedObject.__v
//  }
//})

//const Note = mongoose.model('Note', noteSchema)

const Note = require('./models/note')

//let notes = [
//  {
//    id: 1,
//    content: "HTML is easy",
//    important: true
//  },
//  {
//    id: 2,
//    content: "Browser can execute only JavaScript",
//    important: false
//  },
//  {
//    id: 3,
//    content: "GET and POST are the most important methods of HTTP protocol",
//    important: true
//  }
//]

//const generateID = () => {
//  const maxId = notes.length > 0
//    ? Math.max(...notes.map(n => n.id))
//    :0
//  return maxId + 1
//}


app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
//app.use(requestLogger)

// app.get('/', (request, response) => {
//  response.send('<h1>Hello World!</h1>')
//})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes)
  })
})

//app.get('/api/notes/:id', (request, response) => {
//  const id = Number(request.params.id)
//  console.log(id);
//  const note = notes.find(note => {
//    console.log(note, note.id, typeof note.id, id, typeof id, note.id === id);
//    return note.id === id
//  })
//  //const this_note = notes.find(note => note.id === id)
//  console.log(note);
//  if (note) {
//    response.json(note)
//  } else {
//    response.status(404).end()
//  }
//})



app.get('/api/notes/:id', (request, response, next) => {
  console.log(request.params.id)
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end()
      } 
    })
    .catch(error => next(error))
})

//app.delete('/api/notes/:id', (request, response) => {
//  const id = Number(request.params.id)
//  notes = notes.filter(note => note.id !== id)
//
//  response.status(204).end()
//})

app.delete('/api/notes/:id', (request, response, next) => {
  Note.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

//app.put('/api/notes/:id', (request, response) => {
//  const id = Number(request.params.id)
//  console.log(request.body)
//  const note = notes.find(note => {
//    //console.log(note, note.id, typeof note.id, id, typeof id, note.id === id);
//    return note.id === id
//  })
//  console.log(note);
//})

app.put('/api/notes/:id', (request, response, next) => {
  console.log('Toggle importance')
  // const body = request.body

  //const note = {
  //  content: body.content,
  //  important: body.important,
  //}

  const { content, important } = request.body

  Note.findByIdAndUpdate(
    request.params.id, 
    { content, important },
     { new: true, runValidators: true, context: 'query' })
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

//app.post('/api/notes', (request, response) => {
//  const body = request.body
//
//  if (!body.content) {
//    return response.status(400).json({
//      error: 'content missing'
//    })
//  }

//  const note = {
//    content: body.content,
//    important: Boolean(body.important) || false,
//    id: generateID()
//  }
//
//  notes = notes.concat(note)
//
//  console.log(note)
//  response.json(note)
//})
app.post('/api/notes', (request, response, next) => {
  const body = request.body

  if (body.content === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save()
    .then(savedNote => {
    response.json(savedNote)
  })
  .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  console.log('In unknown endpoint error handler')
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log('In errorHandler')
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
