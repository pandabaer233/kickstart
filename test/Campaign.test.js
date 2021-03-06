const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send( { from: accounts[0], gas: '1000000'});

  await factory.methods.createCampaign('100').send({
    from: accounts[0],
    gas: '1000000'
  });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  )
});

describe('Campaigns', () => {
  it('deploys a contract', () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('marks caller as the campaign manager', async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it('allows people to contribute money and marks them as approvers', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '200'
    });
    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it('requires a minimum contribution', async () => {
    try {
      await campaign.methods.contribute().send({
        from: accounts[1],
        value: '99'
      });
      assert(false);
    } catch (err) {
      assert.ok(err);
    }
  });

  it('allows a manager to make a payment request', async () => {
    await campaign.methods
      .createRequest('Buy batteries.', '100', accounts[1])
      .send({
        gas: '1000000',
        from: accounts[0]
      });
      const request = await campaign.methods.requests(0).call();
      assert.equal('Buy batteries.', request.description);
      assert.equal('100', request.value);
      assert.equal(accounts[1], request.recipient);
    });

  it('processes requests', async () => {
    let balance1 = await web3.eth.getBalance(accounts[1]);
    balance1 = web3.utils.fromWei(balance1, 'ether');
    balance1 = parseFloat(balance1);
    console.log(balance1);

    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei('10', 'ether')
    });
    await campaign.methods
      .createRequest('Buy batteries.', web3.utils.toWei('5', 'ether'), accounts[1])
      .send({
        gas: '1000000',
        from: accounts[0]
    });

    await campaign.methods.approveRequest(0).send({
      gas: '1000000',
      from: accounts[0]
    });

    await campaign.methods.finalizeRequest(0).send({
      gas: '1000000',
      from: accounts[0]
    });

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = parseFloat(balance);

    console.log(balance);
    assert(balance = balance1+5);
  })

})
