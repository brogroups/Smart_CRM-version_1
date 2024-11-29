const UserModel = require('../models/user.model')
const bcrypt = require('bcrypt')

module.exports = async () => {
    try {
        const isAdmin = await UserModel.find()
        if (isAdmin.role==='admin') {
            console.log('admin have in database')
            return
        }
        const role = 'admin'
        const password = 'admin'
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
