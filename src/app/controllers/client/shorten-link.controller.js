import * as shortenLinkService from '@/app/services/client/shorten-link.service'
import _ from 'lodash'

export const create = async (req, res) => {
    const data = await shortenLinkService.create(req.body, req)
    res.status(201).jsonify(_.pick(data, ['original_link', 'shorten_link']))
}

export const getAll = async (req, res) => {
    const data = await shortenLinkService.getAll(req.query, req)
    res.status(200).jsonify(data)
}

export const getById = async (req, res) => {
    const data = await shortenLinkService.getById(req.params.id, req)
    console.log(data)

    res.status(200).jsonify(data)
}

export const hiddenLink = async (req, res) => {
    const data = await shortenLinkService.hiddenLink(req.body, req.data)
    if (data) {
        res.status(200).jsonify('Ẩn link rút gọn thành công.')
    }
}
