const { hash, compare } = require("bcryptjs")
const appError = require("../utils/appError")

const UserRepository = require("../repositories/UserRepository")
const UserCreateService = require("../services/UserCreateService")
const sqliteConnection = require("../database/sqlite")

class usersController {
  async create(request, response) {
    const { name, email, password } = request.body

    const userRepository = new UserRepository()
    const userCreateService = new UserCreateService(userRepository)
    await userCreateService.execute({ name, email, password })

    return response.status(201).json()
  }
  async update(request, response) {
    const { name, email, password, old_password } = request.body
    const user_id = request.user.id

    const database = await sqliteConnection()
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id])

    if (!user) {
      throw new appError("User not found.")
    }

    const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email = (?)", [email])

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new appError("This email is already in use.")
    }

    user.name = name ?? user.name
    user.email = email ?? user.email

    if (password && !old_password) {
      throw new appError("You need to inform your current password.")
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password)

      if (!checkOldPassword) {
        throw new appError("Current password is incorrect.")
      }

      user.password = await hash(password, 8)
    }

    await database.run(`
    UPDATE users SET
    name = ?,
    email = ?,
    password = ?,
    updated_at = DATETIME("now")
    WHERE id = ?`,
      [user.name, user.email, user.password, user_id]
    )

    return response.status(200).json()
  }
}

module.exports = usersController