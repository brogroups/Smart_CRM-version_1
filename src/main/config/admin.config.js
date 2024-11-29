const UserModel = require('../models/user.model')
const bcrypt = require('bcrypt')

module.exports.adminCreateConfig = async () => {
    try {
        const isAdmin = await UserModel.find()
        if (isAdmin.length > 0) {
            console.log('admin have in database')
            return
        }
        const role = 'admin'
        const password = '1234'
        const admin = await UserModel.create({
            name: 'Admin',
            username: 'admin',
            password: await bcrypt.hash(password, 7),
            role: role,
        })

        admin.save()
        console.log('Admin is created')
    } catch (error) {
        return { status: 500, error: 'Server Error' }
    }
}
