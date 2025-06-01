import { pick } from 'lodash'
import * as shortenLinkService from '@/app/services/client/shorten-link.service'
import { getOrCreateShortenLinkQRCode } from '@/app/services/client/shorten-link.service'

export async function create(req, res) {
    const data = await shortenLinkService.create(req.body, req)
    const filteredData = pick(data, ['_id', 'alias', 'shorten_link', 'created_at', 'updated_at'])
    res.status(201).jsonify(filteredData)
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

export const redirectShortenLink = async (req, res) => {
    const { alias } = req.params
    console.log(alias)
    const data = await shortenLinkService.getByAtlas(alias)
    if (!data) {
        return res.status(404).send('Not found')
    }
    return res.redirect(data.third_party_link)
}

export async function deleteByID(req, res) {
    const id = req.params.id
    const data = await shortenLinkService.deleteByID(id, req)
    if (!data) throw new Error('Không tìm thấy link để xóa')
    return res.status(200).jsonify('Xoá link rút gọn thành công.')
}

export async function goLink(req, res) {
    const data = await shortenLinkService.goLink(req.body, req)
    res.status(201).jsonify(data)
}

export async function goLinkValid(req, res) {
    const data = await shortenLinkService.goLinkValid(req.body, req)
    res.status(201).jsonify(data)
}
