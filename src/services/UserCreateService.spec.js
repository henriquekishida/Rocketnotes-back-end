const UserCreateService = require("./UserCreateService")
const UserRepositoryInMemory = require("../repositories/UserRepositoryInMemory")
const appError = require("../utils/appError")


describe("UserCreateService", () => {
  it("should create user", async () => {
    const user = {
      name: "User Test",
      email: "user@test.com",
      password: "a"
    }

    const userRepositoryInMemory = new UserRepositoryInMemory()
    const userCreateService = new UserCreateService(userRepositoryInMemory)
    const userCreated = await userCreateService.execute(user)

    expect(userCreated).toHaveProperty("id")
  })

  it("user shouldn't be created with existing email", async () => {
    const user1 = {
      name: "User Test 1",
      email: "user@test.com",
      password: "a"
    }

    const user2 = {
      name: "User Test 2",
      email: "user@test.com",
      password: "abc"
    }

    const userRepository = new UserRepositoryInMemory()
    const userCreateService = new UserCreateService(userRepository)

    await userCreateService.execute(user1)
    await expect(userCreateService.execute(user2)).rejects.toEqual(new appError("This email is already in use."))
  })
})