const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
})

const sessions = new Map()

io.on('connection', socket => {
  // Mapear el id del usuario con su id del socket
  socket.emit('attachId', userId => {
    sessions.set(userId, socket.id)
  })
  // Quitar el id del usuario cuando se desconecte
  socket.on('disconnect', () => {
    socket.emit('detachId', userId => {
      sessions.delete(userId)
    })
  })
  //mandar mensajes a todos
  socket.on('chat message', msg => {
    io.emit('emit message', msg)
  })
  //mandar una alerta única
  socket.on('alert request', userId => {
    const id = sessions.get(userId)
    io
      .sockets
      .connected[id]
      .emit('alert unique', `Mensaje único para el id ${userId}`)
  })
})

http.listen(port, function(){
  console.log(`listening on *:${port}`)
})