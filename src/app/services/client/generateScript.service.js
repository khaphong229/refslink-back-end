// import express from 'express'
// import axios from 'axios'

// const app = express()
// app.use(express.json())

// app.post('/api/receive-links', async (req, res) => {
//     const { links } = req.body
//     if (!Array.isArray(links) || links.length === 0) {
//         return res.status(400).json({ success: false, message: 'Links không hợp lệ' })
//     }

//     try {

//         const response = await axios.post('http://localhost:3111/st/bulk', {
//             token,
//             urls: links
//         })

//         if (response.data.success) {
//             const shortenedLinks = response.data.data.map(item => ({
//                 original: item.data.original_link,
//                 shorten: item.data.shorten_link
//             }))
//             res.json({ success: true, shortenedLinks })
//         } else {
//             res.status(500).json({ success: false, message: 'API rút gọn lỗi' })
//         }
//     } catch (err) {
//         console.error(err)
//         res.status(500).json({ success: false, message: 'Lỗi server' })
//     }
// })

