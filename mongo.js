const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@persons.hnxn8s5.mongodb.net/?retryWrites=true&w=majority&appName=persons`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

// Create a new note
const note = new Note({
  content: 'Mongoose makes things easy',
  important: true,
})

note.save().then(result => {
  console.log('note saved!')
  // mongoose.connection.close()
})

// Read note
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  // mongoose.connection.close()
})

// Search notes
Note.find({ important: true }).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})
