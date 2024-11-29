const UserModel = require('../models/user.model')
const bcrypt = require('bcrypt')
const { events } = require('../events')
const {
    setCache,
    getCache,
    deleteCache,
} = require('../global/helpers/redis.helper')

module.exports.createUser = async (args) => {
    try {
        const { name, username, password, role } = args
        const existingUser = await UserModel.findOne({ username })
        if (existingUser) {
            return { status: 400, message: 'Username already exists' }
        }

        const hashedPassword = await bcrypt.hash(password, 7)
        const user = new UserModel({
            name,
            username,
            password: hashedPassword,
            role,
        })
        await user.save()

        const desc = `New User ${name}`
        events.emit('user.created', Date.now(), desc)

        await deleteCache('user_list')

        return { status: 201, data: user }
    } catch (error) {
        console.error(error)
        return { status: 500, message: 'Server Error' }
    }
}

module.exports.listUser = async () => {
    try {
        const cachedUsers = await getCache('user_list')
        if (cachedUsers) {
            return {
                status: 200,
                message: 'Users retrieved from cache',
                data: cachedUsers,
            }
        }

        const users = await UserModel.find().lean()
        await setCache('user_list', users, 3600)

        return { status: 200, data: users }
    } catch (error) {
        console.error(error)
        return { status: 500, message: 'Server Error' }
    }
}

module.exports.updateUser = async (args) => {
    try {
        const { id, name, username, role } = args
        const user = await getUserById(id)

        const updatedUser = await UserModel.findByIdAndUpdate(
            id,
            {
                name: name || user.name,
                username: username || user.username,
                role: role || user.role,
            },
            { new: true }
        )

        await deleteCache('user_list')

        return {
            status: 200,
            message: 'User updated successfully',
            data: updatedUser,
        }
    } catch (error) {
        console.error(error)
        return { status: 500, message: 'Server Error' }
    }
}

module.exports.deleteUser = async (args) => {
    try {
        const { id } = args
        const user = await getUserById(id)

        const desc = `User ${user.name}`
        events.emit('user.deleted', Date.now(), desc)

        await UserModel.deleteOne({ _id: id })

        await deleteCache('user_list')

        return { status: 200, message: 'User deleted successfully' }
    } catch (error) {
        console.error(error)
        return { status: 500, message: 'Server Error' }
    }
}

module.exports.checkLoginUser = async (username) => {
    try {
        const user = await UserModel.findOne({ username })
        if (!user) {
            return { status: 404, message: 'User not found' }
        }
        return { status: 200, data: user }
    } catch (error) {
        return { status: 500, message: 'Server Error' }
    }
}

const getUserById = async (id) => {
    try {
        const user = await UserModel.findById(id)
        if (!user) {
            return { status: 404, message: 'User not found' }
        }
        return user
    } catch (error) {
        console.error(error)
        return { status: 500, message: 'Server Error' }
    }
}
