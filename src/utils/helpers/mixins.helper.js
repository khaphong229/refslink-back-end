import dgram from 'dgram'

export function getInterfaceIp(family) {
    /**
     * Get the IP address of an external interface. Used when binding to
     * 0.0.0.0 or ::1 to show a more useful URL.
     *
     * @param {string} family - Address family, either 'IPv4' or 'IPv6'.
     * @returns {Promise<string>} - The IP address of the external interface.
     */
    return new Promise(function (resolve) {
        const host = family === 'IPv6' ? 'fd31:f903:5ab5:1::1' : '10.253.155.219'
        const socketType = family === 'IPv6' ? 'udp6' : 'udp4'
        const socket = dgram.createSocket(socketType)

        socket.on('error', function () {
            socket.close()
            resolve(family === 'IPv6' ? '::1' : '127.0.0.1')
        })

        socket.on('close', function () {
            resolve(family === 'IPv6' ? '::1' : '127.0.0.1')
        })

        socket.connect(58162, host, function () {
            try {
                const address = socket.address().address
                socket.close()
                resolve(address)
            } catch (err) {
                socket.close()
                resolve(family === 'IPv6' ? '::1' : '127.0.0.1')
            }
        })
    })
}
