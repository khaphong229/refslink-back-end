import * as shortenLinkService from '@/app/services/client/shorten-link.service'

export const create = async (req, res) => {
    const data = await shortenLinkService.create(req.body, req)
    console.log(data)
    res.status(201).jsonify({
        id : data._id,
        original_link: data.original_link,
        shorten_link: data.shorten_link,
        third_party_link: data.third_party_link
    })
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
