const mongoose = require('mongoose')
const moment = require('moment')

const User = require('./user')
const Seat = require('./seat')

const Schema = mongoose.Schema

const ReservationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  seat: { type: Schema.Types.ObjectId, ref: 'Seat' },
  reservedUntil: { type: Date, default: moment.utc().add(3, 'minutes') },
  paid: { type: Schema.Types.Boolean, default: false }
})

ReservationSchema.statics.makeReservation = function (email, password, seatId) {
  return User.findOne({ email }).then(user => {
    return this.findOne({ user }).then(retrievedUser => {
      if (retrievedUser) {
        throw new Error('You have already made a reservation.')
      }

      return Seat.findOne({ id: seatId }).then(seat => {
        return this.findOne({ seat }).then(retrievedSeat => {
          if (retrievedSeat) {
            throw new Error('This seat is already reserved.')
          }

          return user.comparePassword(password).then(same => {
            if (!same) {
              throw new Error('Password incorrect.')
            }

            const reservation = new this({
              user,
              retrievedSeat
            })
            return reservation.save()
          })
        })
      })
    })
  })
}

ReservationSchema.statics.removeAllReservations = function () {
  return this.remove({})
}

module.exports = mongoose.model('Reservation', ReservationSchema)
