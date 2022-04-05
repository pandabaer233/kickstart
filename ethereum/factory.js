import web3 from './web3';
import CampaignFactory from './build/CampaignFactory.json';

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  '0x4f0121f1daa947b2D76AA8eE57DB37c358e781eD'
);

export default instance;
