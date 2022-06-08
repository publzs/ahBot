const axios = require('axios')

//Bot Token
const Token = ''

//Your Id
const AdministratorId = ''

//openid
const openid = ''

//代理host 查询至cloudnproxy.baidu.com
let ips = [
    '180.97.104.168',
    '180.97.93.202',
    'cloudnproxy.baidu.com',
    '14.215.179.244',
    '220.181.33.174',
    '220.181.111.189',
    '220.181.7.1',
    '36.152.45.97',
    '110.242.70.68',
    '157.0.148.53'
]

const sendMessage = (text, log) => {
    axios.get(`https://api.telegram.org/bot${Token}/sendMessage`, {
        params: {
            'chat_id': AdministratorId,
            'text': text
        }
    }).then(_ => {
        console.log(log)
    }).catch(err => console.log(err))
}

const tryIp = async (ip) => {
    let now = new Date()
    let year = now.getFullYear().toString()
    let mouth = (now.getMonth() + 1).toString().padStart(2, '0')

    let date = `${year}${mouth}`
    let res
    let config = {
        url: 'http://wx.ah.189.cn/wxws/xcxahwx/detailInfo.do',
        method: 'POST',
        headers: {
            'User-Agent': 'baiduboxapp',
            'X-T5-Auth': 'ZjQxNDIh',
            'Host': 'wx.ah.189.cn',
            'Content-Length': '87',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: `openid=${openid}&dateTime=${date}`,
        timeout: 5000,
        proxy: {
            protocol: 'http',
            host: ip,
            port: 443
        }
    }

    try {
        res = await axios(config)
    } catch {
        return Promise.reject('err')
    }
    if (res?.data?.object) {
        return [res.data.object, ip]
    }
    return Promise.reject('err')
}

const getInfo = async () => {
    let res
    try {
        res = await Promise.any(ips.map(value => tryIp(value)))
    } catch {
        return Promise.reject('err')
    }
    return res
}

const ptllInfo = (ptll) => {
    let len = Object.keys(ptll).length
    let total = 0
    let left = 0
    for (let i = 0; i < len; i++) {
        total += Number(ptll[i]['RATABLE_TOTAL'])
        left += parseFloat(ptll[i]['RATABLE_LEFT'])
    }
    let t = (total / 1024).toFixed(2)
    let l = (left / 1024).toFixed(2)
    return (l + 'G/' + t + 'G')
}
const dxllInfo = (dxll) => {
    return (dxll[0]['RATABLE_USED'] / 1024).toFixed(2) + 'G'
}

const main = async (body) => {
    if (!(body?.['message']?.['text'])) {
        return;
    }
    let {message} = body
    if (message['chat']['id'] !== AdministratorId) return;

    if (message['text'] === '/start') {
        let res
        try {
            res = await getInfo()
        } catch {
            sendMessage('err', 'all err')
        }
        let {ptll, dxll} = res[0]
        let ptllStr = ptllInfo(ptll)
        let dxStr = dxllInfo(dxll)
        sendMessage(`➤➤ ${ptllStr} -- ${dxStr}`, `ip>> ${res[1]}`)
        return;
    }

    if (message['text'] === 'hello') {
        //isAlive
        sendMessage('Hello!')
    }
}
module.exports = main;
