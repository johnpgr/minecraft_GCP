const functions = require('@google-cloud/functions-framework')
const { InstancesClient, FirewallsClient } = require('@google-cloud/compute').v1
const project = process.env.PROJECT;
const zone = process.env.ZONE;
const instance = process.env.INSTANCE;

const ipv4_pattern = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi;

function isIpv4(str) {
    return ipv4_pattern.test(str)
}

async function getServerIp(client) {
    const vms = await client.get({
        project,
        zone,
        instance,
    })

    return vms?.[0].networkInterfaces?.[0].accessConfigs?.[0].natIP
}

functions.http('authorize_ip', async (req, res) => {
    const instancesClient = new InstancesClient();
    const fwClient = new FirewallsClient();
    let serverIp = await getServerIp(instancesClient);

    if (!serverIp) {
        console.error('authorize_ip called while server is down.');
        res.status(400).send('Falha ao Autorizar ip. O servidor esta offline.');
        return;
    }

    const sourceIp = req.get('x-forwarded-for');
    const _isIpv4 = isIpv4(sourceIp);

    const sourceRangeStr = _isIpv4 ? sourceIp + '/32' : sourceIp + '/128';
    const fwName = instance + 'fw-rule-for-' + _isIpv4 ? sourceIp.replaceAll('.', '') : sourceIp.replaceAll(':', '');
    const description = req.get('User-Agent');
    console.log('Inserting new firewall rule for ip: ' + sourceIp);

    const tcpPortFwRule = fwClient.insert({
        project,
        firewallResource: {
            direction: 'INGRESS',
            description,
            targetTags: ['minecraft'],
            name: fwName,
            sourceRanges: [sourceRangeStr],
            allowed: [
                {
                    ports: ['25565'],
                    IPProtocol: 'tcp'
                }
            ]

        }
    });

    await tcpPortFwRule
        .catch(() => {
            console.error('Error: An firewall rule for ip:' + sourceIp + ' already exists.');
            res.status(400).send('Seu ip ja foi autorizado no servidor.');
        }).then(() => {
            console.log('Ip authorized: ' + sourceIp);
            res.status(200).send('Seu Ip: ' + sourceIp + ' foi autorizado no servidor. Ip do servidor: ' + serverIp + ':25565');
        })
})