const { events } = require('../events')
const LeadModel = require('../models/lead.model')
const {
    setCache,
    getCache,
    deleteCache,
} = require('../global/helpers/redis.helper')
require('../events/notification.event')

module.exports.createLead = async (event, args) => {
    try {
        const { name, phone, email, address, comment } = args
        if (!name || !phone || !email || !address || !comment) {
            return handleError(400, 'Please add all fields', null)
        }

        const lead = new LeadModel({
            name,
            phone,
            email,
            address,
            comment,
        })
        await lead.save()

        const desc = `Новый Лид ${name}`
        events.emit('lead.created', Date.now(), desc)

        await deleteCache('lead_list')

        return {
            status: 201,
            message: 'Lead created successfully',
            data: lead,
        }
    } catch (error) {
        console.error(error)
    }
}

module.exports.listLead = async () => {
    try {
        const cachedLeads = await getCache('lead_list')
        if (cachedLeads) {
            return {
                status: 200,
                message: 'Leads retrieved from cache',
                data: cachedLeads,
            }
        }

        const leads = await LeadModel.find().lean()

        await setCache('lead_list', leads, 3600)

        return {
            status: 200,
            message: 'Leads retrieved successfully',
            data: leads,
        }
    } catch (error) {
        console.error(error)
    }
}

module.exports.updateLead = async (event, args) => {
    try {
        const { id, name, phone, email, address, comment } = args
        const lead = await getLeadById(id)

        const updatedLead = await LeadModel.findByIdAndUpdate(
            id,
            {
                name: name || lead.name,
                phone: phone || lead.phone,
                email: email || lead.email,
                address: address || lead.address,
                comment: comment || lead.comment,
            },
            { new: true }
        )

        await deleteCache('lead_list')

        return {
            status: 200,
            message: 'Lead updated successfully',
            data: updatedLead,
        }
    } catch (error) {
        console.error(error)
    }
}

module.exports.deleteLead = async (event, args) => {
    try {
        const { id } = args
        const lead = await getLeadById(id)

        const desc = `Лид ${lead.name}`
        events.emit('lead.deleted', Date.now(), desc)

        await LeadModel.deleteOne({ _id: id })

        await deleteCache('lead_list')

        return {
            status: 200,
            message: 'Lead deleted successfully',
            data: null,
        }
    } catch (error) {
        console.error(error)
    }
}

const getLeadById = async (id) => {
    try {
        const lead = await LeadModel.findById(id)
        if (!lead) {
            throw new Error('Lead not found')
        }
        return lead
    } catch (error) {
        console.error(error)
    }
}
